import { buildReminderEmailHtml, sendEmail } from "@/utils/email/resend";
import { getIsAdmin } from "@/utils/supabase/queries";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { apiKey?: string; to?: string };
  if (!body.apiKey || !body.to) {
    return NextResponse.json({ error: "apiKey và to là bắt buộc" }, { status: 400 });
  }

  const html = buildReminderEmailHtml({
    familyName: "Gia Phả",
    type: "birthday",
    personName: "Nguyễn Văn A",
    daysUntil: 3,
    dateLabel: "15/03",
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://giapha-os-rose.vercel.app",
  });

  const result = await sendEmail(body.apiKey, {
    to: body.to,
    subject: "[Gia Phả] Test email thông báo",
    html,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
