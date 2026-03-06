"use server";

import { getIsAdmin, getSupabase, getUser } from "@/utils/supabase/queries";
import { sendTelegramTest } from "@/utils/notifyTelegram";
import { sendZaloTest } from "@/utils/notifyZalo";
import { revalidatePath } from "next/cache";

const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function getTelegramZaloSettings() {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = await getSupabase();
  const { data } = await supabase
    .from("family_settings")
    .select("setting_key, setting_value")
    .in("setting_key", [
      "telegram_enabled",
      "telegram_bot_token",
      "telegram_chat_id",
      "telegram_phone",
      "zalo_enabled",
      "zalo_webhook_url",
      "notify_on_member_added",
      "notify_on_family_event",
      "notify_on_birthday",
    ]);

  const map = Object.fromEntries(
    (data ?? []).map((r: { setting_key: string; setting_value: string | null }) => [
      r.setting_key,
      r.setting_value,
    ]),
  );

  return {
    telegram: {
      enabled: map["telegram_enabled"] === "true",
      botToken: map["telegram_bot_token"] ?? "",
      chatId: map["telegram_chat_id"] ?? "",
      phone: map["telegram_phone"] ?? "",
    },
    zalo: {
      enabled: map["zalo_enabled"] === "true",
      webhookUrl: map["zalo_webhook_url"] ?? "",
    },
    triggers: {
      onMemberAdded: map["notify_on_member_added"] !== "false",
      onFamilyEvent: map["notify_on_family_event"] !== "false",
      onBirthday: map["notify_on_birthday"] !== "false",
    },
  };
}

async function upsertSetting(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  userId: string | undefined,
  key: string,
  value: string,
) {
  const { error } = await supabase.from("family_settings").upsert(
    {
      setting_key: key,
      setting_value: value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "setting_key" },
  );
  if (error) throw new Error(error.message);
}

export async function saveTelegramSettings(data: {
  enabled: boolean;
  botToken: string;
  chatId: string;
  phone?: string;
}) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  if (data.phone && !PHONE_REGEX.test(data.phone.trim())) {
    throw new Error("Số điện thoại không hợp lệ");
  }

  const user = await getUser();
  const supabase = await getSupabase();

  await upsertSetting(supabase, user?.id, "telegram_enabled", data.enabled ? "true" : "false");
  await upsertSetting(supabase, user?.id, "telegram_bot_token", data.botToken.trim());
  await upsertSetting(supabase, user?.id, "telegram_chat_id", data.chatId.trim());
  if (data.phone !== undefined) {
    await upsertSetting(supabase, user?.id, "telegram_phone", data.phone.trim());
  }

  revalidatePath("/dashboard/settings");
}

export async function saveZaloSettings(data: {
  enabled: boolean;
  webhookUrl: string;
}) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  if (data.webhookUrl && !isValidUrl(data.webhookUrl)) {
    throw new Error("Webhook URL phải bắt đầu bằng https://");
  }

  const user = await getUser();
  const supabase = await getSupabase();

  await upsertSetting(supabase, user?.id, "zalo_enabled", data.enabled ? "true" : "false");
  await upsertSetting(supabase, user?.id, "zalo_webhook_url", data.webhookUrl.trim());

  revalidatePath("/dashboard/settings");
}

export async function saveNotifyTriggers(triggers: {
  onMemberAdded: boolean;
  onFamilyEvent: boolean;
  onBirthday: boolean;
}) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const user = await getUser();
  const supabase = await getSupabase();

  await upsertSetting(supabase, user?.id, "notify_on_member_added", triggers.onMemberAdded ? "true" : "false");
  await upsertSetting(supabase, user?.id, "notify_on_family_event", triggers.onFamilyEvent ? "true" : "false");
  await upsertSetting(supabase, user?.id, "notify_on_birthday", triggers.onBirthday ? "true" : "false");

  revalidatePath("/dashboard/settings");
}

export async function testTelegramConnection(
  botToken: string,
  chatId: string,
): Promise<{ ok: boolean; error?: string }> {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return sendTelegramTest(botToken, chatId);
}

export async function testZaloConnection(
  webhookUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return sendZaloTest(webhookUrl);
}
