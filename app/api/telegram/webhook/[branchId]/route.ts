import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { TelegramUpdate } from "@/utils/bot/telegram";
import { sendTelegramMessage } from "@/utils/bot/telegram";

// Use service role to bypass RLS for webhook processing
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> },
) {
  try {
    const { branchId } = await params;
    const update = (await req.json()) as TelegramUpdate;
    const message = update.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const supabase = getServiceSupabase();

    // Load bot config for this branch
    const { data: bot } = await supabase
      .from("branch_bots")
      .select("*")
      .eq("branch_id", branchId)
      .eq("platform", "telegram")
      .eq("is_active", true)
      .single();

    if (!bot?.bot_token) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Handle commands
    if (text.startsWith("/start") || text.startsWith("/help")) {
      await sendTelegramMessage(
        bot.bot_token,
        chatId,
        "🏡 <b>Gia Phả Bot</b>\n\nTôi là trợ lý gia phả của dòng họ bạn.\n\n" +
          "📋 <b>Lệnh có sẵn:</b>\n" +
          "/lichgio — Danh sách giỗ sắp tới\n" +
          "/sukien — Sự kiện họ tộc sắp tới\n" +
          "/giapha [tên] — Tìm thành viên\n" +
          "/help — Xem trợ giúp\n\n" +
          "💬 Hoặc đặt câu hỏi tự do về dòng họ!",
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/lichgio")) {
      // Get upcoming anniversaries
      const today = new Date();
      const next30 = new Date(today);
      next30.setDate(next30.getDate() + 30);

      const { data: persons } = await supabase
        .from("persons")
        .select("full_name, death_month, death_day, death_year")
        .not("death_year", "is", null)
        .not("death_month", "is", null)
        .not("death_day", "is", null);

      if (!persons || persons.length === 0) {
        await sendTelegramMessage(bot.bot_token, chatId, "📅 Không có lịch giỗ trong 30 ngày tới.");
        return NextResponse.json({ ok: true });
      }

      const year = today.getFullYear();
      const upcoming = persons
        .map((p) => {
          const d = new Date(year, (p.death_month as number) - 1, p.death_day as number);
          if (d < today) d.setFullYear(year + 1);
          return { name: p.full_name, date: d, deathYear: p.death_year };
        })
        .filter((p) => p.date <= next30)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 10);

      if (upcoming.length === 0) {
        await sendTelegramMessage(bot.bot_token, chatId, "📅 Không có lịch giỗ trong 30 ngày tới.");
      } else {
        const lines = upcoming.map((p) => {
          const diff = Math.round((p.date.getTime() - today.getTime()) / 86400000);
          const dateStr = `${p.date.getDate()}/${p.date.getMonth() + 1}`;
          return `• <b>${p.name}</b> — ${dateStr} (còn ${diff} ngày, giỗ năm thứ ${year - (p.deathYear as number)})`;
        });
        await sendTelegramMessage(
          bot.bot_token,
          chatId,
          `🕯️ <b>Lịch giỗ 30 ngày tới:</b>\n\n${lines.join("\n")}`,
        );
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/sukien")) {
      const { data: events } = await supabase
        .from("family_events")
        .select("title, event_date, event_type, location")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date")
        .limit(5);

      if (!events || events.length === 0) {
        await sendTelegramMessage(bot.bot_token, chatId, "📅 Không có sự kiện họ tộc sắp tới.");
      } else {
        const lines = events.map(
          (e) => `• <b>${e.title}</b> — ${e.event_date}${e.location ? ` | ${e.location}` : ""}`,
        );
        await sendTelegramMessage(
          bot.bot_token,
          chatId,
          `📋 <b>Sự kiện sắp tới:</b>\n\n${lines.join("\n")}`,
        );
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/giapha ")) {
      const query = text.replace("/giapha ", "").trim();
      const { data: found } = await supabase
        .from("persons")
        .select("full_name, birth_year, death_year, generation")
        .ilike("full_name", `%${query}%`)
        .limit(5);

      if (!found || found.length === 0) {
        await sendTelegramMessage(
          bot.bot_token,
          chatId,
          `🔍 Không tìm thấy thành viên tên "<b>${query}</b>"`,
        );
      } else {
        const lines = found.map((p) => {
          const status = p.death_year ? `†${p.death_year}` : "còn sống";
          return `• <b>${p.full_name}</b> — Sinh: ${p.birth_year ?? "?"} (${status}) — Thế hệ: ${p.generation ?? "?"}`;
        });
        await sendTelegramMessage(
          bot.bot_token,
          chatId,
          `🔍 <b>Kết quả tìm kiếm "${query}":</b>\n\n${lines.join("\n")}`,
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Free-form AI chat (if AI is enabled)
    if (bot.ai_enabled) {
      // Dynamically import to avoid loading AI deps for non-AI requests
      const { handleAIChat } = await import("@/utils/bot/aiClient");
      await handleAIChat(bot, chatId, message, supabase);
    } else {
      await sendTelegramMessage(
        bot.bot_token,
        chatId,
        "💬 Trả lời AI chưa được bật cho bot này. Admin vui lòng cấu hình AI trong phần cài đặt bot.",
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
