import FamilyBookExport from "@/components/FamilyBookExport";
import FamilyStats from "@/components/FamilyStats";
import { getSupabase } from "@/utils/supabase/queries";

export const metadata = {
  title: "Thống kê gia phả",
};

export default async function StatsPage() {
  const supabase = await getSupabase();

  const [{ data: persons }, { data: relationships }, { data: settings }] =
    await Promise.all([
      supabase.from("persons").select("*"),
      supabase.from("relationships").select("*"),
      supabase
        .from("family_settings")
        .select("setting_key, setting_value")
        .eq("setting_key", "family_name")
        .maybeSingle(),
    ]);

  const familyName = (settings as { setting_value?: string } | null)?.setting_value ?? "Gia Phả Dòng Họ";

  return (
    <div className="flex-1 w-full relative flex flex-col pb-12">
      <div className="w-full relative z-20 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="title">Thống kê gia phả</h1>
          <p className="text-stone-500 mt-1 text-sm">
            Tổng quan số liệu về các thành viên trong dòng họ
          </p>
        </div>
        <FamilyBookExport
          persons={persons ?? []}
          relationships={relationships ?? []}
          familyName={familyName}
        />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <FamilyStats
          persons={persons ?? []}
          relationships={relationships ?? []}
        />
      </main>
    </div>
  );
}
