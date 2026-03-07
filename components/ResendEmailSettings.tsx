"use client";

import { saveResendEmailSettings } from "@/app/dashboard/settings/actions";
import { Check, KeyRound, Loader2, Mail, Send, X } from "lucide-react";
import { useState } from "react";

interface Props {
  initialApiKey: string | null;
  initialNotificationEmail: string | null;
}

export default function ResendEmailSettings({ initialApiKey, initialNotificationEmail }: Props) {
  const [apiKey, setApiKey] = useState(initialApiKey ?? "");
  const [email, setEmail] = useState(initialNotificationEmail ?? "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveResendEmailSettings(apiKey.trim(), email.trim());
      showMsg("success", "Đã lưu cấu hình email!");
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim() || !email.trim()) {
      showMsg("error", "Cần nhập API Key và email để kiểm tra");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim(), to: email.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        showMsg("success", `Email thử nghiệm đã gửi tới ${email}`);
      } else {
        showMsg("error", data.error ?? "Gửi thất bại");
      }
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Lỗi kết nối");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <Mail className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-800 text-sm">Email thông báo (Resend)</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Gửi email nhắc nhở sinh nhật/ngày giỗ qua Resend API
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* API Key */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 flex items-center gap-1.5">
            <KeyRound className="size-3.5" />
            Resend API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 pr-20"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
            >
              {showKey ? "Ẩn" : "Hiện"}
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Lấy tại{" "}
            <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              resend.com/api-keys
            </a>
            . Miễn phí 100 email/ngày.
          </p>
        </div>

        {/* Notification email */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 flex items-center gap-1.5">
            <Mail className="size-3.5" />
            Email nhận thông báo
          </label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
          />
          <p className="text-xs text-stone-400 mt-1">
            Email sẽ nhận thông báo mỗi khi cron chạy và có sự kiện trong 3 ngày tới.
          </p>
        </div>

        {/* Status message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {message.type === "success" ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Lưu cài đặt
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !apiKey || !email}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 hover:border-stone-300 disabled:opacity-40 text-stone-700 rounded-xl text-sm font-medium transition-colors"
          >
            {testing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Gửi thử
          </button>
        </div>
      </div>
    </div>
  );
}
