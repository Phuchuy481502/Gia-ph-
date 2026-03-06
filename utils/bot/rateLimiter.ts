"use server";
import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
}

/** Check if an AI request is allowed. If BYOK, always allow. */
export async function checkRateLimit(isByok: boolean): Promise<RateLimitResult> {
  if (isByok) return { allowed: true };

  const supabase = getServiceSupabase();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("is_active", true)
    .single();

  if (!sub) {
    return {
      allowed: false,
      reason:
        "Chưa có gói thuê bao. Vui lòng cấu hình API key riêng (BYOK) hoặc liên hệ admin.",
    };
  }

  if (sub.ai_requests_limit === -1) return { allowed: true }; // Enterprise unlimited

  if (sub.ai_requests_used >= sub.ai_requests_limit) {
    return {
      allowed: false,
      reason: `Đã hết quota AI tháng này (${sub.ai_requests_used}/${sub.ai_requests_limit} requests). Quota sẽ reset vào đầu tháng sau.`,
    };
  }

  await supabase
    .from("subscriptions")
    .update({ ai_requests_used: sub.ai_requests_used + 1 })
    .eq("id", sub.id);

  return { allowed: true, remaining: sub.ai_requests_limit - sub.ai_requests_used - 1 };
}
