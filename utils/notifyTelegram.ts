"use server";

import { getSupabase } from "@/utils/supabase/queries";

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

async function getTelegramConfig(): Promise<TelegramConfig | null> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("family_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "telegram_enabled",
        "telegram_bot_token",
        "telegram_chat_id",
      ]);

    const map = Object.fromEntries(
      (data ?? []).map((r: { setting_key: string; setting_value: string | null }) => [
        r.setting_key,
        r.setting_value,
      ]),
    );

    if (
      map["telegram_enabled"] !== "true" ||
      !map["telegram_bot_token"] ||
      !map["telegram_chat_id"]
    ) {
      return null;
    }

    return {
      botToken: map["telegram_bot_token"],
      chatId: map["telegram_chat_id"],
    };
  } catch {
    return null;
  }
}

/** Fire-and-forget Telegram notification — never throws */
export async function notifyTelegram(message: string): Promise<void> {
  try {
    const config = await getTelegramConfig();
    if (!config) return;

    await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );
  } catch {
    // Non-critical — never throw
  }
}

/** Send a direct test message using provided credentials */
export async function sendTelegramTest(
  botToken: string,
  chatId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🔔 <b>Gia Phả OS</b> — Kết nối Telegram thành công! Bạn sẽ nhận thông báo từ hệ thống gia phả qua kênh này.",
          parse_mode: "HTML",
        }),
      },
    );
    const json = (await res.json()) as { ok: boolean; description?: string };
    if (!json.ok) {
      return { ok: false, error: json.description ?? "Unknown Telegram error" };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
