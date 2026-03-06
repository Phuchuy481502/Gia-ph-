import CemeteryMapWrapper from "@/components/CemeteryMapWrapper";
import { getAllGravesWithGPS } from "@/app/dashboard/members/[id]/grave/actions";
import type { GraveStatus } from "@/types";
import type { GraveMapPoint } from "@/components/CemeteryMapView";

const STATUS_LABEL: Record<GraveStatus, string> = {
  no_grave:     "Chưa có mộ",
  has_grave:    "Đã xây mộ",
  grave_moved:  "Đã cải táng",
  cremated_urn: "Tro cốt",
  unknown:      "Chưa rõ",
};

const STATUS_DOT: Record<GraveStatus, string> = {
  no_grave:     "bg-red-500",
  has_grave:    "bg-green-500",
  grave_moved:  "bg-orange-500",
  cremated_urn: "bg-blue-500",
  unknown:      "bg-stone-400",
};

export default async function CemeteryMapPage() {
  const raw = await getAllGravesWithGPS();

  // Type-cast to GraveMapPoint (Supabase join returns nested object)
  const graves = raw as unknown as GraveMapPoint[];

  // Build sidebar: group by cemetery
  const byCemetery = graves.reduce<Record<string, GraveMapPoint[]>>((acc, g) => {
    const key = g.cemetery_name ?? "Không rõ nghĩa trang";
    (acc[key] ??= []).push(g);
    return acc;
  }, {});

  const statuses: GraveStatus[] = ["has_grave", "no_grave", "grave_moved", "cremated_urn", "unknown"];

  return (
    <div className="flex h-[calc(100vh-64px)] gap-4 p-4 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
          <h2 className="text-sm font-semibold text-stone-700">🪦 Bản đồ mộ phần</h2>
          <p className="text-xs text-stone-400 mt-0.5">{graves.length} mộ có toạ độ GPS</p>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-b border-stone-100 flex flex-wrap gap-x-4 gap-y-1.5">
          {statuses.map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-stone-600">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[s]}`} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>

        {/* Grave list by cemetery */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(byCemetery).map(([cemetery, list]) => (
            <div key={cemetery}>
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 sticky top-0">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider truncate">
                  {cemetery} ({list.length})
                </p>
              </div>
              <ul className="divide-y divide-stone-100">
                {list.map((g) => (
                  <li key={g.id} className="px-4 py-2.5 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[g.grave_status]}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">
                        {g.persons?.full_name ?? "Không rõ"}
                      </p>
                      {g.persons?.death_year && (
                        <p className="text-xs text-stone-400">Mất: {g.persons.death_year}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {graves.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-stone-400 italic">
              <p>Chưa có mộ nào được thêm toạ độ GPS.</p>
              <p className="mt-1 text-xs">Nhập GPS trong phần &ldquo;Mộ phần&rdquo; của từng thành viên.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-stone-800">🗺️ Bản đồ nghĩa trang</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Hiển thị vị trí mộ phần của các thành viên đã mất
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <CemeteryMapWrapper graves={graves} />
        </div>
      </main>
    </div>
  );
}
