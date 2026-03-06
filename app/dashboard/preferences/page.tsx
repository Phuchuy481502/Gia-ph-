import { getProfile, getSupabase } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import UserPreferencesForm from "@/components/UserPreferencesForm";
import { getUserPreferences } from "./actions";
import { Settings2 } from "lucide-react";

export default async function PreferencesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await getSupabase();

  const [persons, branches, prefs] = await Promise.all([
    supabase
      .from("persons")
      .select("id, full_name, birth_year, generation")
      .order("generation", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true }),
    supabase.from("branches").select("id, name").order("name"),
    getUserPreferences(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings2 className="size-6 text-amber-600" />
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Tùy chọn cá nhân</h1>
          <p className="text-sm text-stone-500 mt-0.5">Lưu chế độ xem mặc định cho tài khoản của bạn</p>
        </div>
      </div>

      <UserPreferencesForm
        persons={persons.data ?? []}
        branches={branches.data ?? []}
        initialPrefs={prefs}
      />
    </div>
  );
}
