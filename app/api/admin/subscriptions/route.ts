import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getProfile } from "@/utils/supabase/queries";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function requireAdmin() {
  const profile = await getProfile();
  if (profile?.role !== "admin") return null;
  return profile;
}

/** GET /api/admin/subscriptions — return current active subscription */
export async function GET() {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = getServiceSupabase();
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: subscription ?? null });
}

/** POST /api/admin/subscriptions — create or update subscription plan */
export async function POST(req: Request) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    plan?: string;
    ai_requests_limit?: number;
    expires_at?: string | null;
  };

  const supabase = getServiceSupabase();

  // Deactivate current subscription first
  await supabase.from("subscriptions").update({ is_active: false }).eq("is_active", true);

  const planLimits: Record<string, number> = {
    free: 0,
    basic: 100,
    pro: 1000,
    enterprise: -1,
  };
  const plan = body.plan ?? "free";
  const limit =
    body.ai_requests_limit !== undefined ? body.ai_requests_limit : (planLimits[plan] ?? 0);

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      plan,
      ai_requests_limit: limit,
      ai_requests_used: 0,
      is_active: true,
      expires_at: body.expires_at ?? null,
      reset_at: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1,
      ).toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, subscription: data });
}

/** PUT /api/admin/subscriptions — reset ai_requests_used to 0 */
export async function PUT() {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("subscriptions")
    .update({ ai_requests_used: 0 })
    .eq("is_active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
