import Footer from "@/components/Footer";
import LandingHero from "@/components/LandingHero";
import PublicDashboard from "@/components/PublicDashboard";
import { createPublicClient } from "@/utils/supabase/public";
import { computeEvents } from "@/utils/eventHelpers";
import config from "./config";

async function getPublicDashboardData() {
  const supabase = createPublicClient();

  // Check if public dashboard is enabled
  const { data: setting } = await supabase
    .from("family_settings")
    .select("setting_value")
    .eq("setting_key", "public_dashboard_enabled")
    .maybeSingle();

  if (setting?.setting_value !== "true") return null;

  // Fetch stats
  const [membersRes, announcementsRes] = await Promise.all([
    supabase
      .from("persons")
      .select(
        "id, full_name, is_deceased, gender, birth_year, birth_month, birth_day, death_year, death_month, death_day, generation, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("announcements")
      .select("*")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const persons = membersRes.data ?? [];
  const announcements = announcementsRes.data ?? [];

  // Compute stats
  const generations = new Set(
    persons.map((p) => p.generation).filter(Boolean),
  );
  const stats = {
    totalMembers: persons.length,
    totalGenerations: generations.size,
    totalBranches: 0, // branch count from branches table (optional)
    totalLiving: persons.filter((p) => !p.is_deceased).length,
    totalDeceased: persons.filter((p) => p.is_deceased).length,
  };

  // Fetch branches count separately
  const { count: branchCount } = await supabase
    .from("branches")
    .select("id", { count: "exact", head: true });
  stats.totalBranches = branchCount ?? 0;

  // Compute upcoming events (next 30 days)
  const allEvents = computeEvents(persons);
  const upcomingEvents = allEvents
    .filter((e) => e.daysUntil >= 0 && e.daysUntil <= 30 && e.type !== "custom_event")
    .slice(0, 8)
    .map((e) => ({
      personName: e.personName,
      type: e.type as "birthday" | "death_anniversary",
      daysUntil: e.daysUntil,
      dateLabel: e.eventDateLabel,
      isDeceased: e.isDeceased,
    }));

  // Recent members (last 5)
  const recentMembers = persons.slice(0, 5).map((p) => ({
    id: p.id as string,
    full_name: p.full_name as string,
    is_deceased: p.is_deceased as boolean,
    gender: p.gender as "male" | "female" | "other",
    birth_year: (p.birth_year ?? null) as number | null,
  }));

  return { stats, announcements, upcomingEvents, recentMembers };
}

export default async function HomePage() {
  const dashboardData = await getPublicDashboardData();

  if (dashboardData) {
    return (
      <PublicDashboard
        siteName={config.siteName}
        stats={dashboardData.stats}
        announcements={dashboardData.announcements}
        upcomingEvents={dashboardData.upcomingEvents}
        recentMembers={dashboardData.recentMembers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col selection:bg-amber-200 selection:text-amber-900 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)] pointer-events-none"></div>

      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none flex justify-center">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-amber-300/20 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-rose-200/20 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 relative z-10 w-full">
        <LandingHero siteName={config.siteName} />
      </main>

      <Footer className="bg-transparent relative z-10 border-none" />
    </div>
  );
}
