"use client";

import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  Webhook,
  WifiOff,
} from "lucide-react";

interface BotConfig {
  id?: string;
  bot_token?: string | null;
  bot_username?: string | null;
  chat_id?: string | null;
  webhook_registered?: boolean;
  is_active?: boolean;
  ai_enabled?: boolean;
}

interface BotSettingsProps {
  branchId: string;
  branchName: string;
  initialBot: BotConfig | null;
}

export default function BotSettings({ branchId, branchName, initialBot }: BotSettingsProps) {
  const [botToken, setBotToken] = useState(initialBot?.bot_token ?? "");
  const [chatId, setChatId] = useState(initialBot?.chat_id ?? "");
  const [showToken, setShowToken] = useState(false);

  const [webhookRegistered, setWebhookRegistered] = useState(
    initialBot?.webhook_registered ?? false,
  );
  const [botUsername, setBotUsername] = useState(initialBot?.bot_username ?? "");
  const [webhookUrl, setWebhookUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function callRegisterApi(action: "register" | "deregister") {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/bots/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, botToken, action }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        username?: string;
        webhookUrl?: string;
      };
      if (!res.ok || json.error) {
        setError(json.error ?? "Đã xảy ra lỗi không xác định.");
      } else {
        if (action === "register") {
          setWebhookRegistered(true);
          setBotUsername(json.username ?? "");
          setWebhookUrl(json.webhookUrl ?? "");
          setSuccess(`✅ Đăng ký webhook thành công! Bot: @${json.username}`);
        } else {
          setWebhookRegistered(false);
          setBotUsername("");
          setWebhookUrl("");
          setSuccess("✅ Đã huỷ đăng ký webhook.");
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        {webhookRegistered ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            <CheckCircle2 className="size-4" />
            Webhook đã đăng ký
            {botUsername && <span className="font-normal opacity-75">· @{botUsername}</span>}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-600">
            <WifiOff className="size-4" />
            Chưa đăng ký webhook
          </span>
        )}
      </div>

      {/* Config form */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-5 shadow-sm">
        <h2 className="font-semibold text-stone-800 flex items-center gap-2">
          <Bot className="size-4 text-amber-600" />
          Cấu hình Bot — {branchName}
        </h2>

        <div className="space-y-4">
          {/* Bot token */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Bot Token
              <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-10 text-sm font-mono focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label={showToken ? "Ẩn token" : "Hiện token"}
              >
                {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Lấy từ{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline inline-flex items-center gap-0.5"
              >
                @BotFather <ExternalLink className="size-3" />
              </a>
            </p>
          </div>

          {/* Chat ID */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Chat ID (Group/Channel)
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-1001234567890"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <p className="mt-1 text-xs text-stone-500">
              ID của nhóm/kênh Telegram mà bot được thêm vào. Thường có dạng{" "}
              <code className="rounded bg-stone-100 px-1">-100xxxxxxxxxx</code>
            </p>
          </div>
        </div>

        {/* Webhook URL (read-only, shown after registration) */}
        {webhookUrl && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              <Webhook className="inline size-3.5 mr-1" />
              Webhook URL
            </label>
            <input
              readOnly
              value={webhookUrl}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-mono text-stone-600"
            />
          </div>
        )}

        {/* Feedback */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <XCircle className="size-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
            <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => callRegisterApi("register")}
            disabled={loading || !botToken}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Webhook className="size-4" />
            )}
            {webhookRegistered ? "Cập nhật Webhook" : "Đăng ký Webhook"}
          </button>

          {webhookRegistered && (
            <button
              onClick={() => callRegisterApi("deregister")}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <WifiOff className="size-4" />
              Huỷ Webhook
            </button>
          )}
        </div>
      </div>

      {/* Setup instructions */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-4">
        <h3 className="font-semibold text-blue-800 flex items-center gap-2 text-sm">
          <Info className="size-4" />
          Hướng dẫn thiết lập Bot Telegram
        </h3>

        <ol className="space-y-3 text-sm text-blue-900">
          <li className="flex gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">
              1
            </span>
            <span>
              Mở Telegram và nhắn tin cho{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 hover:text-blue-700"
              >
                @BotFather
              </a>
              . Gõ <code className="rounded bg-blue-100 px-1">/newbot</code> và làm theo hướng dẫn
              để tạo bot mới. Bạn sẽ nhận được <strong>Bot Token</strong>.
            </span>
          </li>

          <li className="flex gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">
              2
            </span>
            <span>
              Tạo nhóm Telegram cho dòng họ (hoặc dùng nhóm đã có). Thêm bot vào nhóm và{" "}
              <strong>cấp quyền Admin</strong> để bot có thể gửi tin nhắn.
            </span>
          </li>

          <li className="flex gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">
              3
            </span>
            <span>
              Lấy Chat ID của nhóm: thêm bot{" "}
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 hover:text-blue-700"
              >
                @userinfobot
              </a>{" "}
              vào nhóm, nó sẽ gửi Chat ID (dạng{" "}
              <code className="rounded bg-blue-100 px-1">-100xxxxxxxxxx</code>). Hoặc dùng{" "}
              <a
                href="https://t.me/getidsbot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 hover:text-blue-700"
              >
                @getidsbot
              </a>
              .
            </span>
          </li>

          <li className="flex gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">
              4
            </span>
            <span>
              Điền <strong>Bot Token</strong> và <strong>Chat ID</strong> ở trên, sau đó nhấn{" "}
              <strong>Đăng ký Webhook</strong>. Hệ thống sẽ tự động kết nối bot với ứng dụng.
            </span>
          </li>
        </ol>

        <div className="rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-xs text-blue-700">
          <strong>Lưu ý bảo mật:</strong> Bot Token được lưu trữ an toàn trong cơ sở dữ liệu với
          Row Level Security. Chỉ admin mới có thể xem và chỉnh sửa cấu hình bot.
        </div>
      </div>

      {/* Commands reference */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3 shadow-sm">
        <h3 className="font-semibold text-stone-800 text-sm">📋 Lệnh Bot hỗ trợ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            { cmd: "/start, /help", desc: "Hiển thị trợ giúp" },
            { cmd: "/lichgio", desc: "Lịch giỗ 30 ngày tới" },
            { cmd: "/sukien", desc: "Sự kiện họ tộc sắp diễn ra" },
            { cmd: "/giapha [tên]", desc: "Tìm kiếm thành viên gia phả" },
          ].map(({ cmd, desc }) => (
            <div
              key={cmd}
              className="flex items-baseline gap-2 rounded-lg bg-stone-50 px-3 py-2"
            >
              <code className="shrink-0 text-xs font-mono text-amber-700">{cmd}</code>
              <span className="text-stone-600 text-xs">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
