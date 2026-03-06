// AI chat handler — placeholder for issue #83
// Will be replaced with full OpenAI/Gemini integration in the next phase.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { TelegramMessage } from "./telegram";
import { sendTelegramMessage } from "./telegram";

export interface BranchBot {
  id: string;
  bot_token: string;
  ai_enabled: boolean;
  ai_provider?: string;
  ai_model?: string;
  ai_api_key?: string;
  ai_base_url?: string;
  ai_system_prompt?: string;
}

export async function handleAIChat(
  bot: BranchBot,
  chatId: number,
  _message: TelegramMessage,
  _supabase: SupabaseClient,
): Promise<void> {
  await sendTelegramMessage(
    bot.bot_token,
    chatId,
    "🤖 AI chưa được cấu hình. Tính năng này sẽ có trong phiên bản tiếp theo.",
  );
}
