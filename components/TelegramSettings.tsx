"use client";

import {
  saveTelegramSettings,
  saveZaloSettings,
  saveNotifyTriggers,
  testTelegramConnection,
  testZaloConnection,
} from "@/app/dashboard/settings/telegram/actions";
import { Bell, CheckCircle2, Send, XCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  initialTelegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    phone: string;
  };
  initialZalo: {
    enabled: boolean;
    webhookUrl: string;
  };
  initialTriggers: {
    onMemberAdded: boolean;
    onFamilyEvent: boolean;
    onBirthday: boolean;
  };
}

export default function TelegramSettings({
  initialTelegram,
  initialZalo,
  initialTriggers,
}: Props) {
  const [tgEnabled, setTgEnabled] = useState(initialTelegram.enabled);
  const [tgToken, setTgToken] = useState(initialTelegram.botToken);
  const [tgChatId, setTgChatId] = useState(initialTelegram.chatId);
  const [tgPhone, setTgPhone] = useState(initialTelegram.phone);

  const [zaloEnabled, setZaloEnabled] = useState(initialZalo.enabled);
  const [zaloUrl, setZaloUrl] = useState(initialZalo.webhookUrl);

  const [triggers, setTriggers] = useState(initialTriggers);

  const [savingTg, setSavingTg] = useState(false);
  const [savingZalo, setSavingZalo] = useState(false);
  const [savingTriggers, setSavingTriggers] = useState(false);
  const [testingTg, setTestingTg] = useState(false);
  const [testingZalo, setTestingZalo] = useState(false);

  const [tgStatus, setTgStatus] = useState<"idle" | "ok" | "error">("idle");
  const [tgError, setTgError] = useState("");
  const [zaloStatus, setZaloStatus] = useState<"idle" | "ok" | "error">("idle");
  const [zaloError, setZaloError] = useState("");
  const [triggersStatus, setTriggersStatus] = useState<"idle" | "ok">("idle");

  async function handleSaveTelegram() {
    setSavingTg(true);
    setTgStatus("idle");
    try {
      await saveTelegramSettings({
        enabled: tgEnabled,
        botToken: tgToken,
        chatId: tgChatId,
        phone: tgPhone,
      });
      setTgStatus("ok");
    } catch (e) {
      setTgStatus("error");
      setTgError(e instanceof Error ? e.message : "Lỗi lưu cài đặt");
    } finally {
      setSavingTg(false);
    }
  }

  async function handleTestTelegram() {
    setTestingTg(true);
    setTgStatus("idle");
    try {
      const result = await testTelegramConnection(tgToken, tgChatId);
      if (result.ok) {
        setTgStatus("ok");
      } else {
        setTgStatus("error");
        setTgError(result.error ?? "Lỗi kết nối Telegram");
      }
    } finally {
      setTestingTg(false);
    }
  }

  async function handleSaveZalo() {
    setSavingZalo(true);
    setZaloStatus("idle");
    try {
      await saveZaloSettings({ enabled: zaloEnabled, webhookUrl: zaloUrl });
      setZaloStatus("ok");
    } catch (e) {
      setZaloStatus("error");
      setZaloError(e instanceof Error ? e.message : "Lỗi lưu cài đặt");
    } finally {
      setSavingZalo(false);
    }
  }

  async function handleTestZalo() {
    setTestingZalo(true);
    setZaloStatus("idle");
    try {
      const result = await testZaloConnection(zaloUrl);
      if (result.ok) {
        setZaloStatus("ok");
      } else {
        setZaloStatus("error");
        setZaloError(result.error ?? "Lỗi kết nối Zalo webhook");
      }
    } finally {
      setTestingZalo(false);
    }
  }

  async function handleSaveTriggers() {
    setSavingTriggers(true);
    try {
      await saveNotifyTriggers(triggers);
      setTriggersStatus("ok");
      setTimeout(() => setTriggersStatus("idle"), 3000);
    } finally {
      setSavingTriggers(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100">
        <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
          <Bell className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-stone-800">
            Thông báo Telegram &amp; Zalo
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Nhận thông báo tự động qua Telegram bot và nhóm Zalo
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* ── Telegram ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-stone-700 flex items-center gap-2">
              <span>🤖</span> Telegram Bot
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-stone-500">
                {tgEnabled ? "Đang bật" : "Tắt"}
              </span>
              <button
                type="button"
                onClick={() => setTgEnabled((v) => !v)}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                  tgEnabled ? "bg-blue-500" : "bg-stone-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${
                    tgEnabled ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Bot Token
              </label>
              <input
                type="password"
                value={tgToken}
                onChange={(e) => setTgToken(e.target.value)}
                placeholder="1234567890:AAF..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Chat ID (group / channel)
              </label>
              <input
                type="text"
                value={tgChatId}
                onChange={(e) => setTgChatId(e.target.value)}
                placeholder="-1001234567890"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Số điện thoại liên kết (không bắt buộc)
              </label>
              <input
                type="tel"
                value={tgPhone}
                onChange={(e) => setTgPhone(e.target.value)}
                placeholder="+84901234567"
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-xs text-stone-400">
            Tạo bot qua <strong>@BotFather</strong> trên Telegram. Thêm bot vào nhóm và lấy Chat ID
            bằng cách gửi tin nhắn rồi gọi{" "}
            <code className="bg-stone-100 px-1 rounded">
              getUpdates
            </code>
            .
          </p>

          {tgStatus === "ok" && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" /> Thành công!
            </p>
          )}
          {tgStatus === "error" && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <XCircle className="size-4" /> {tgError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveTelegram}
              disabled={savingTg}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {savingTg ? "Đang lưu…" : "Lưu cài đặt"}
            </button>
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testingTg || !tgToken || !tgChatId}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-40 transition-colors"
            >
              <Send className="size-3.5" />
              {testingTg ? "Đang gửi…" : "Gửi thử"}
            </button>
          </div>
        </section>

        <hr className="border-stone-100" />

        {/* ── Zalo ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-stone-700 flex items-center gap-2">
              <span>💬</span> Zalo Nhóm (Webhook)
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-stone-500">
                {zaloEnabled ? "Đang bật" : "Tắt"}
              </span>
              <button
                type="button"
                onClick={() => setZaloEnabled((v) => !v)}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                  zaloEnabled ? "bg-emerald-500" : "bg-stone-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${
                    zaloEnabled ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Webhook URL
            </label>
            <input
              type="url"
              value={zaloUrl}
              onChange={(e) => setZaloUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <p className="text-xs text-stone-400">
            Sử dụng Zalo OA Webhook hoặc dịch vụ tích hợp như{" "}
            <strong>n8n</strong> / <strong>Make</strong> để chuyển tiếp vào
            nhóm Zalo. Webhook phải là HTTPS.
          </p>

          {zaloStatus === "ok" && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" /> Thành công!
            </p>
          )}
          {zaloStatus === "error" && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <XCircle className="size-4" /> {zaloError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveZalo}
              disabled={savingZalo}
              className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {savingZalo ? "Đang lưu…" : "Lưu cài đặt"}
            </button>
            <button
              type="button"
              onClick={handleTestZalo}
              disabled={testingZalo || !zaloUrl}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 disabled:opacity-40 transition-colors"
            >
              <Send className="size-3.5" />
              {testingZalo ? "Đang gửi…" : "Gửi thử"}
            </button>
          </div>
        </section>

        <hr className="border-stone-100" />

        {/* ── Triggers ── */}
        <section className="space-y-3">
          <h3 className="font-medium text-stone-700">Khi nào gửi thông báo</h3>
          {(
            [
              {
                key: "onMemberAdded" as const,
                label: "Thêm thành viên mới",
                desc: "Gửi khi admin/editor thêm một thành viên mới vào gia phả",
              },
              {
                key: "onFamilyEvent" as const,
                label: "Sự kiện họ tộc mới",
                desc: "Gửi khi tạo sự kiện như giỗ họ, họp mặt, đám cưới…",
              },
              {
                key: "onBirthday" as const,
                label: "Sinh nhật & ngày giỗ sắp tới",
                desc: "Gửi mỗi sáng nếu có sinh nhật / giỗ trong ngày hôm đó",
              },
            ] as const
          ).map((t) => (
            <label
              key={t.key}
              className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-200 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={triggers[t.key]}
                onChange={(e) =>
                  setTriggers((prev) => ({ ...prev, [t.key]: e.target.checked }))
                }
                className="mt-0.5 accent-amber-600"
              />
              <div>
                <p className="text-sm font-medium text-stone-700">{t.label}</p>
                <p className="text-xs text-stone-400 mt-0.5">{t.desc}</p>
              </div>
            </label>
          ))}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveTriggers}
              disabled={savingTriggers}
              className="px-4 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {savingTriggers ? "Đang lưu…" : "Lưu cấu hình"}
            </button>
            {triggersStatus === "ok" && (
              <p className="flex items-center gap-1 text-sm text-emerald-600">
                <CheckCircle2 className="size-4" /> Đã lưu
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
