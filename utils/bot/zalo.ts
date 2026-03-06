// Zalo OA webhook sender
// Zalo OA API: send messages to followers/users who have messaged the OA.

export async function sendZaloGroupMessage(
  accessToken: string,
  chatId: string,
  text: string,
): Promise<void> {
  try {
    await fetch("https://openapi.zalo.me/v2.0/oa/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken,
      },
      body: JSON.stringify({
        recipient: { user_id: chatId },
        message: { text },
      }),
    });
  } catch {
    // Non-critical
  }
}

export async function refreshZaloToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        app_id: process.env.ZALO_APP_ID ?? "",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}
