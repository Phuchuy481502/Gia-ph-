import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import QRCodeSection from "@/components/QRCodeSection";

interface PageProps {
  params: Promise<{ id: string }>;
}

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAnonClient();

  const { data: grave } = await supabase
    .from("grave_records")
    .select("public_memorial, persons(full_name, birth_year, death_year, avatar_url)")
    .eq("person_id", id)
    .eq("public_memorial", true)
    .maybeSingle();

  if (!grave) return { title: "Trang tưởng nhớ" };

  const person = grave.persons as unknown as { full_name: string; birth_year: number | null; death_year: number | null; avatar_url: string | null } | null;
  const name = person?.full_name ?? "Tưởng nhớ";
  const years = [person?.birth_year, person?.death_year].filter(Boolean).join(" — ");

  return {
    title: `Tưởng nhớ ${name}${years ? ` (${years})` : ""}`,
    description: `Trang tưởng nhớ ${name} — Gia Phả OS`,
    openGraph: {
      title: `🕯️ Tưởng nhớ ${name}`,
      description: years ? `${years}` : `Trang tưởng nhớ`,
      images: person?.avatar_url ? [{ url: person.avatar_url }] : [],
    },
  };
}

const EVENT_LABEL: Record<string, string> = {
  burial:             "⚰️ Chôn cất",
  exhumation:         "🏚️ Bốc mộ",
  grave_construction: "🏗️ Xây mộ",
  grave_renovation:   "🔨 Tu sửa mộ",
  cremation:          "🔥 Hỏa táng",
  urn_placement:      "🏺 Đặt bình tro cốt",
  cleaning:           "🧹 Vệ sinh mộ",
  other:              "📌 Sự kiện",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Không rõ ngày";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default async function MemorialPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAnonClient();

  // Fetch grave record (only if public_memorial = true)
  const { data: grave } = await supabase
    .from("grave_records")
    .select(`
      *,
      persons (
        id, full_name, gender, birth_year, birth_month, birth_day,
        death_year, death_month, death_day, avatar_url, note, place_of_birth
      )
    `)
    .eq("person_id", id)
    .eq("public_memorial", true)
    .maybeSingle();

  if (!grave) notFound();

  const person = grave.persons as unknown as {
    id: string;
    full_name: string;
    gender: string;
    birth_year: number | null;
    birth_month: number | null;
    birth_day: number | null;
    death_year: number | null;
    death_month: number | null;
    death_day: number | null;
    avatar_url: string | null;
    note: string | null;
    place_of_birth: string | null;
  };

  // Fetch events and photos
  const [{ data: events }, { data: photos }] = await Promise.all([
    supabase
      .from("grave_events")
      .select("*")
      .eq("grave_id", grave.id)
      .order("event_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("grave_photos")
      .select("*")
      .eq("grave_id", grave.id)
      .eq("is_panorama", false)
      .order("created_at", { ascending: true }),
  ]);

  const birthStr = [person.birth_day, person.birth_month, person.birth_year]
    .filter(Boolean).join("/") || "Không rõ";
  const deathStr = [person.death_day, person.death_month, person.death_year]
    .filter(Boolean).join("/") || "Không rõ";

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/memorial/${id}`;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-gradient-to-b from-stone-800 to-stone-700 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-stone-400 text-sm mb-6 tracking-widest uppercase">🕯️ Tưởng nhớ</p>

          {person.avatar_url ? (
            <Image
              src={person.avatar_url}
              alt={person.full_name}
              width={120}
              height={120}
              className="w-28 h-28 rounded-full object-cover mx-auto mb-5 border-4 border-stone-600 shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-stone-600 flex items-center justify-center mx-auto mb-5 text-4xl">
              {person.gender === "female" ? "👩" : "👨"}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{person.full_name}</h1>
          <p className="text-stone-300 text-lg">
            {person.birth_year ?? "?"} — {person.death_year ?? "?"}
          </p>

          {grave.epitaph && (
            <blockquote className="mt-6 italic text-stone-300 text-base max-w-lg mx-auto border-t border-stone-600 pt-5">
              &ldquo;{grave.epitaph}&rdquo;
            </blockquote>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Biography */}
        <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="font-bold text-stone-800 text-lg mb-4">📅 Tiểu sử</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-2">
              <dt className="text-stone-500 w-28 shrink-0">Ngày sinh:</dt>
              <dd className="font-medium text-stone-800">{birthStr}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-stone-500 w-28 shrink-0">Ngày mất:</dt>
              <dd className="font-medium text-stone-800">{deathStr}</dd>
            </div>
            {person.place_of_birth && (
              <div className="flex gap-2">
                <dt className="text-stone-500 w-28 shrink-0">Nơi sinh:</dt>
                <dd className="font-medium text-stone-800">{person.place_of_birth}</dd>
              </div>
            )}
            {grave.cause_of_death && (
              <div className="flex gap-2">
                <dt className="text-stone-500 w-28 shrink-0">Nguyên nhân:</dt>
                <dd className="font-medium text-stone-800">{grave.cause_of_death}</dd>
              </div>
            )}
            {person.note && (
              <div className="pt-3 border-t border-stone-100">
                <dt className="text-stone-500 mb-1">Ghi chú:</dt>
                <dd className="text-stone-700 whitespace-pre-wrap">{person.note}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Grave info */}
        {(grave.cemetery_name || grave.cemetery_address || grave.gps_lat) && (
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h2 className="font-bold text-stone-800 text-lg mb-4">🪦 Thông tin mộ phần</h2>
            <dl className="space-y-3 text-sm">
              {grave.cemetery_name && (
                <div className="flex gap-2">
                  <dt className="text-stone-500 w-28 shrink-0">Nghĩa trang:</dt>
                  <dd className="font-medium text-stone-800">{grave.cemetery_name}</dd>
                </div>
              )}
              {grave.cemetery_address && (
                <div className="flex gap-2">
                  <dt className="text-stone-500 w-28 shrink-0">Địa chỉ:</dt>
                  <dd className="font-medium text-stone-800">{grave.cemetery_address}</dd>
                </div>
              )}
              {grave.grave_type && (
                <div className="flex gap-2">
                  <dt className="text-stone-500 w-28 shrink-0">Loại mộ:</dt>
                  <dd className="font-medium text-stone-800">{grave.grave_type}</dd>
                </div>
              )}
              {grave.gps_lat != null && grave.gps_lng != null && (
                <div className="flex gap-2">
                  <dt className="text-stone-500 w-28 shrink-0">Toạ độ:</dt>
                  <dd>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${grave.gps_lat}&mlon=${grave.gps_lng}#map=17/${grave.gps_lat}/${grave.gps_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-800 font-medium"
                    >
                      📍 Xem trên bản đồ
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Timeline */}
        {events && events.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h2 className="font-bold text-stone-800 text-lg mb-5">📅 Lịch sử an táng</h2>
            <div className="space-y-0">
              {events.map((ev, idx) => (
                <div key={ev.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-base flex-shrink-0">
                      {(EVENT_LABEL[ev.event_type] ?? "📌").split(" ")[0]}
                    </div>
                    {idx < events.length - 1 && <div className="w-px flex-1 bg-stone-200 my-1" />}
                  </div>
                  <div className="pb-5">
                    <p className="font-semibold text-stone-800 text-sm">
                      {EVENT_LABEL[ev.event_type] ?? "Sự kiện"}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">{formatDate(ev.event_date)}</p>
                    {ev.notes && <p className="text-sm text-stone-600 italic mt-1">{ev.notes}</p>}
                    {ev.conducted_by && <p className="text-xs text-stone-400 mt-0.5">Thực hiện: {ev.conducted_by}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photos */}
        {photos && photos.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h2 className="font-bold text-stone-800 text-lg mb-4">📸 Hình ảnh mộ phần</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const src = `${supabaseUrl}/storage/v1/object/public/grave-photos/${photo.storage_path}`;
                return (
                  <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-stone-100">
                    <Image
                      src={src}
                      alt={photo.caption ?? "Ảnh mộ"}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* QR Code */}
        <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 text-center">
          <h2 className="font-bold text-stone-800 text-lg mb-2">📲 Mã QR trang tưởng nhớ</h2>
          <p className="text-sm text-stone-500 mb-5">Quét mã để truy cập trang này</p>
          <QRCodeSection url={pageUrl} name={person.full_name} />
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-stone-400 pb-8">
          <p>Trang tưởng nhớ được tạo bởi{" "}
            <Link href="/" className="text-amber-600 hover:text-amber-800">Gia Phả OS</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
