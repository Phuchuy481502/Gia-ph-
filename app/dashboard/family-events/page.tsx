import { getIsAdmin, getSupabase } from "@/utils/supabase/queries";
import { FamilyEvent, Branch } from "@/types";
import FamilyEventsClient from "./FamilyEventsClient";

export const metadata = { title: "Sự kiện họ tộc — Gia Phả OS" };

export default async function FamilyEventsPage() {
  const supabase = await getSupabase();
  const isAdmin = await getIsAdmin();

  const [eventsRes, branchesRes] = await Promise.all([
    supabase
      .from("family_events")
      .select("*")
      .order("event_date", { ascending: false }),
    supabase.from("branches").select("id, name").order("name"),
  ]);

  const events = (eventsRes.data ?? []) as FamilyEvent[];
  const branches = (branchesRes.data ?? []) as Pick<Branch, "id" | "name">[];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="title">Sự kiện họ tộc</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Lễ giỗ họ, đám cưới, họp họ và các sự kiện quan trọng của gia tộc
        </p>
      </div>
      <FamilyEventsClient
        initialEvents={events}
        branches={branches}
        isAdmin={isAdmin}
      />
    </main>
  );
}
