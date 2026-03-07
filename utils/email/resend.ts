/** Lightweight Resend email sender — uses HTTP API, no SDK dependency. */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface ResendResponse {
  id?: string;
  error?: { message: string; name: string };
}

export async function sendEmail(
  apiKey: string,
  options: SendEmailOptions,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const from = options.from ?? "Gia Phả <noreply@giapha.app>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    const data = (await res.json()) as ResendResponse;
    if (!res.ok || data.error) {
      return { ok: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Build HTML email for birthday/death anniversary reminders. */
export function buildReminderEmailHtml(params: {
  familyName: string;
  type: "birthday" | "death_anniversary" | "custom_event";
  personName: string;
  daysUntil: number;
  dateLabel: string;
  dashboardUrl: string;
}): string {
  const { familyName, type, personName, daysUntil, dateLabel, dashboardUrl } = params;

  const typeLabel =
    type === "birthday"
      ? "Sinh nhật"
      : type === "death_anniversary"
        ? "Ngày giỗ"
        : "Sự kiện";

  const emoji = type === "birthday" ? "🎂" : type === "death_anniversary" ? "🕯️" : "📅";

  const whenLabel =
    daysUntil === 0 ? "Hôm nay" : daysUntil === 1 ? "Ngày mai" : `${daysUntil} ngày nữa`;

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><title>${typeLabel} - ${familyName}</title></head>
<body style="font-family: sans-serif; background: #f9f6f0; padding: 24px; color: #3c2f1a;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background: #b45309; padding: 24px 32px;">
      <h1 style="margin: 0; color: #fff; font-size: 20px;">${emoji} ${typeLabel}</h1>
      <p style="margin: 4px 0 0; color: #fde68a; font-size: 13px;">${familyName}</p>
    </div>
    <!-- Body -->
    <div style="padding: 28px 32px;">
      <p style="font-size: 16px; font-weight: 600; margin: 0 0 8px;">${personName}</p>
      <p style="margin: 0 0 6px; color: #6b5c3e;">
        <strong>${typeLabel}:</strong> ${dateLabel}
      </p>
      <p style="margin: 0 0 20px; color: #78716c;">
        <strong>Thời gian:</strong> ${whenLabel}
      </p>
      <a href="${dashboardUrl}/dashboard"
         style="display: inline-block; background: #b45309; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
        Xem gia phả →
      </a>
    </div>
    <!-- Footer -->
    <div style="padding: 16px 32px; background: #faf7f2; border-top: 1px solid #e7e0d4;">
      <p style="margin: 0; font-size: 12px; color: #a8a29e;">
        Email tự động từ hệ thống Gia Phả. Truy cập <a href="${dashboardUrl}/dashboard/settings" style="color: #b45309;">cài đặt</a> để tắt thông báo.
      </p>
    </div>
  </div>
</body>
</html>`;
}
