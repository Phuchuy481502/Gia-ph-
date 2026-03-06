import { DashboardProvider } from "@/components/DashboardContext";
import DashboardViews from "@/components/DashboardViews";
import MemberDetailModal from "@/components/MemberDetailModal";
import ViewToggle from "@/components/ViewToggle";
import { getUserPreferences } from "@/app/dashboard/preferences/actions";
import { getProfile, getSupabase } from "@/utils/supabase/queries";

interface PageProps {
  searchParams: Promise<{ view?: string; rootId?: string }>;
}
export default async function FamilyTreePage({ searchParams }: PageProps) {
  const { rootId } = await searchParams;

  const profile = await getProfile();
  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  const supabase = await getSupabase();

  const [personsRes, relsRes, userPrefs] = await Promise.all([
    supabase
      .from("persons")
      .select("*")
      .order("birth_year", { ascending: true, nullsFirst: false }),
    supabase.from("relationships").select("*"),
    getUserPreferences().catch(() => null),
  ]);

  const persons = personsRes.data || [];
  const relationships = relsRes.data || [];

  // Prepare map and roots for tree views
  const personsMap = new Map();
  persons.forEach((p) => personsMap.set(p.id, p));

  const childIds = new Set(
    relationships
      .filter(
        (r) => r.type === "biological_child" || r.type === "adopted_child",
      )
      .map((r) => r.person_b),
  );

  // URL param > user preference > fallback
  let finalRootId = rootId ?? userPrefs?.default_root_person_id ?? undefined;

  if (!finalRootId || !personsMap.has(finalRootId)) {
    const rootsFallback = persons.filter((p) => !childIds.has(p.id));
    if (rootsFallback.length > 0) {
      finalRootId = rootsFallback[0].id;
    } else if (persons.length > 0) {
      finalRootId = persons[0].id;
    }
  }

  return (
    <DashboardProvider>
      <ViewToggle />
      <DashboardViews
        persons={persons}
        relationships={relationships}
        canEdit={canEdit}
      />

      <MemberDetailModal />
    </DashboardProvider>
  );
}
