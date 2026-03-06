"use server";

import { getSupabase } from "@/utils/supabase/queries";

async function getZaloWebhook(): Promise<string | null> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("family_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["zalo_enabled", "zalo_webhook_url"]);

    const map = Object.fromEntries(
      (data ?? []).map((r: { setting_key: string; setting_value: string | null }) => [
        r.setting_key,
        r.setting_value,
      ]),
    );

    if (map["zalo_enabled"] !== "true" || !map["zalo_webhook_url"]) return null;
    return map["zalo_webhook_url"];
  } catch {
    return null;
  }
}

/** Fire-and-forget Zalo OA webhook notification — never throws */
export async function notifyZalo(message: string): Promise<void> {
  try {
    const webhookUrl = await getZaloWebhook();
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch {
    // Non-critical — never throw
  }
}

/** Test Zalo webhook with a sample message */
export async function sendZaloTest(
  webhookUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "🔔 Gia Phả OS — Kết nối Zalo webhook thành công! Bạn sẽ nhận thông báo từ hệ thống gia phả qua nhóm này.",
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
