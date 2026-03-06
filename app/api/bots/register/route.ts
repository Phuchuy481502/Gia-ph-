import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getIsAdmin } from "@/utils/supabase/queries";
import { setWebhook, deleteWebhook, getBotInfo } from "@/utils/bot/telegram";

export async function POST(req: NextRequest) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { branchId, botToken, action } = (await req.json()) as {
    branchId: string;
    botToken: string;
    action: "register" | "deregister";
  };

  if (!branchId || !botToken) {
    return NextResponse.json({ error: "Missing branchId or botToken" }, { status: 400 });
  }

  if (action === "deregister") {
    await deleteWebhook(botToken);
    const supabase = await getSupabase();
    await supabase
      .from("branch_bots")
      .update({ webhook_registered: false })
      .eq("branch_id", branchId)
      .eq("platform", "telegram");
    return NextResponse.json({ ok: true });
  }

  // Verify bot token is valid
  const botInfo = await getBotInfo(botToken);
  if (!botInfo.ok) {
    return NextResponse.json(
      { error: `Invalid bot token: ${botInfo.description}` },
      { status: 400 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const baseUrl = siteUrl ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
  const webhookUrl = `${baseUrl}/api/telegram/webhook/${branchId}`;

  const result = await setWebhook(botToken, webhookUrl);
  if (!result.ok) {
    return NextResponse.json({ error: result.description }, { status: 400 });
  }

  const supabase = await getSupabase();
  await supabase.from("branch_bots").upsert(
    {
      branch_id: branchId,
      platform: "telegram",
      bot_token: botToken,
      bot_username: botInfo.username,
      webhook_registered: true,
      is_active: true,
    },
    { onConflict: "branch_id,platform" },
  );

  return NextResponse.json({ ok: true, username: botInfo.username, webhookUrl });
}
