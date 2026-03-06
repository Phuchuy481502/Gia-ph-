// Telegram Bot API helper — server-side only

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: unknown;
}

export interface TelegramMessage {
  message_id: number;
  from?: { id: number; username?: string; first_name?: string };
  chat: { id: number; type: string; title?: string };
  text?: string;
  date: number;
}

export async function telegramRequest(
  botToken: string,
  method: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function setWebhook(
  botToken: string,
  webhookUrl: string,
): Promise<{ ok: boolean; description?: string }> {
  return telegramRequest(botToken, "setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
}

export async function deleteWebhook(botToken: string): Promise<void> {
  await telegramRequest(botToken, "deleteWebhook", { drop_pending_updates: false });
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML",
): Promise<void> {
  try {
    await telegramRequest(botToken, "sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    });
  } catch {
    // Non-critical
  }
}

export async function getBotInfo(
  botToken: string,
): Promise<{ ok: boolean; username?: string; description?: string }> {
  const res = await telegramRequest(botToken, "getMe", {});
  if (res.ok && typeof res.result === "object" && res.result !== null) {
    const r = res.result as { username?: string };
    return { ok: true, username: r.username };
  }
  return { ok: false, description: res.description };
}
