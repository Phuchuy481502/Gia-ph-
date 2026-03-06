"use client";

import { useState } from "react";
import { ExternalLink, Copy, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

interface ZaloBotConfig {
  id?: string;
  bot_token?: string | null; // Zalo OA access token
  zalo_oa_id?: string | null;
  chat_id?: string | null;
  is_active?: boolean;
  ai_enabled?: boolean;
}

interface ZaloBotSettingsProps {
  branchId: string;
  branchName: string;
  initialBot: ZaloBotConfig | null;
}

export default function ZaloBotSettings({ branchId, branchName, initialBot }: ZaloBotSettingsProps) {
  const [accessToken, setAccessToken] = useState(initialBot?.bot_token ?? "");
  const [oaId, setOaId] = useState(initialBot?.zalo_oa_id ?? "");
  const [chatId, setChatId] = useState(initialBot?.chat_id ?? "");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/zalo/webhook`
      : "/api/zalo/webhook";

  async function handleSave() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/bots/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          botToken: accessToken,
          chatId,
          platform: "zalo",
          zaloOaId: oaId,
          action: "register",
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Đã xảy ra lỗi không xác định.");
      } else {
        setSuccess("✅ Đã lưu cấu hình Zalo OA thành công.");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function copyWebhook() {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          {/* Zalo logo placeholder */}
          <div className="size-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            Z
          </div>
          <div>
            <h2 className="font-semibold text-stone-800">Zalo OA Bot</h2>
            <p className="text-xs text-stone-500">{branchName}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Zalo OA ID</label>
            <input
              type="text"
              value={oaId}
              onChange={(e) => setOaId(e.target.value)}
              placeholder="Nhập Zalo OA ID"
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Zalo OA Access Token"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2 top-2 text-stone-400 hover:text-stone-600"
              >
                {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              User ID mặc định (để test)
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Zalo user_id để nhận thông báo"
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-stone-50 border border-stone-200 px-3 py-2 text-xs text-stone-700">
                {webhookUrl}
              </code>
              <button
                onClick={copyWebhook}
                className="shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-lg border border-stone-200 text-xs hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="size-3.5 text-green-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-1 text-xs text-stone-400">
              Dán URL này vào phần Webhook trong Zalo Developer Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={loading || !accessToken}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Lưu cấu hình
          </button>
          <a
            href="https://developers.zalo.me/docs/api/official-account-api"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            Zalo Developer Portal
          </a>
        </div>

        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {success}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 space-y-1">
        <p className="font-medium">Lưu ý Zalo OA</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-700 text-xs">
          <li>Zalo OA chỉ gửi được tin nhắn tới người dùng đã quan tâm (follow) OA.</li>
          <li>Access Token có thời hạn — cần refresh định kỳ qua Zalo OAuth.</li>
          <li>
            Đăng ký Zalo OA tại{" "}
            <a
              href="https://oa.zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              oa.zalo.me
            </a>
          </li>
          <li>ZALO_APP_ID cần được cấu hình trong biến môi trường để refresh token.</li>
        </ul>
      </div>
    </div>
  );
}
