import { sendTelegramMessage } from "@/utils/bot/telegram";
import { sendZaloGroupMessage } from "@/utils/bot/zalo";

export interface BotPlatform {
  sendMessage(chatId: string, text: string): Promise<void>;
  name: string;
}

export function createPlatform(bot: { platform: string; bot_token: string }): BotPlatform {
  if (bot.platform === "telegram") {
    return {
      name: "telegram",
      sendMessage: (chatId, text) => sendTelegramMessage(bot.bot_token, chatId, text),
    };
  }
  if (bot.platform === "zalo") {
    return {
      name: "zalo",
      sendMessage: (chatId, text) => sendZaloGroupMessage(bot.bot_token, chatId, text),
    };
  }
  throw new Error(`Unknown platform: ${bot.platform}`);
}
