"use client";

import { useEffect, useState } from "react";
import { CreditCard, RefreshCw, CheckCircle, Loader2, AlertCircle, Zap } from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  ai_requests_limit: number;
  ai_requests_used: number;
  reset_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-stone-100 text-stone-700",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-amber-100 text-amber-700",
  enterprise: "bg-purple-100 text-purple-700",
};

const PLANS = [
  {
    id: "free",
    label: "Free",
    limit: 0,
    price: "Miễn phí",
    features: ["Gia phả cơ bản", "Tối đa 50 thành viên", "Bot Telegram (không AI)"],
  },
  {
    id: "basic",
    label: "Basic",
    limit: 100,
    price: "Liên hệ",
    features: ["100 AI requests/tháng", "Tối đa 200 thành viên", "Bot Telegram + AI", "Nhắc lịch giỗ"],
  },
  {
    id: "pro",
    label: "Pro",
    limit: 1000,
    price: "Liên hệ",
    features: [
      "1.000 AI requests/tháng",
      "Thành viên không giới hạn",
      "Bot Telegram + Zalo + AI",
      "Nhắc giỗ, sự kiện tự động",
      "Export dữ liệu",
    ],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    limit: -1,
    price: "Liên hệ",
    features: [
      "AI requests không giới hạn",
      "Thành viên không giới hạn",
      "Tất cả nền tảng bot",
      "Custom AI model/endpoint",
      "Hỗ trợ ưu tiên",
    ],
  },
];

export default function SubscriptionManager() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSub() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions");
      const json = (await res.json()) as { subscription?: Subscription; error?: string };
      setSub(json.subscription ?? null);
    } catch {
      setError("Không thể tải thông tin subscription.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetQuota() {
    setResetting(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/subscriptions", { method: "PUT" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        setMessage("✅ Đã reset quota thành công.");
        await loadSub();
      } else {
        setError(json.error ?? "Lỗi khi reset quota.");
      }
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setResetting(false);
    }
  }

  useEffect(() => {
    loadSub();
  }, []);

  const usedPercent =
    sub && sub.ai_requests_limit > 0
      ? Math.min(100, Math.round((sub.ai_requests_used / sub.ai_requests_limit) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Current status */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-blue-600" />
            <h2 className="font-semibold text-stone-800">Gói hiện tại</h2>
          </div>
          {sub && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PLAN_COLORS[sub.plan] ?? PLAN_COLORS.free}`}
            >
              {PLAN_LABELS[sub.plan] ?? sub.plan}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <Loader2 className="size-4 animate-spin" />
            <span>Đang tải...</span>
          </div>
        ) : sub ? (
          <div className="space-y-3">
            {sub.ai_requests_limit === -1 ? (
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <Zap className="size-4" />
                <span>AI requests không giới hạn (Enterprise)</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>AI requests tháng này</span>
                  <span className="font-medium">
                    {sub.ai_requests_used} / {sub.ai_requests_limit}
                  </span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${usedPercent >= 90 ? "bg-red-500" : usedPercent >= 70 ? "bg-amber-500" : "bg-blue-500"}`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
                {sub.reset_at && (
                  <p className="text-xs text-stone-400">
                    Reset vào:{" "}
                    {new Date(sub.reset_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}

            {sub.expires_at && (
              <p className="text-xs text-stone-500">
                Hết hạn:{" "}
                {new Date(sub.expires_at).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            )}

            <button
              onClick={handleResetQuota}
              disabled={resetting}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-stone-200 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              {resetting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Reset quota thủ công
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <AlertCircle className="size-4 text-amber-500" />
            <span>Chưa có subscription. Đang dùng Free tier (không có AI).</span>
          </div>
        )}

        {message && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Plan cards */}
      <div>
        <h2 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">
          Các gói dịch vụ
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const isCurrent = sub?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-xl border p-4 space-y-3 transition-all ${
                  isCurrent
                    ? "border-blue-400 bg-blue-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">{plan.label}</span>
                  <div className="flex items-center gap-1.5">
                    {isCurrent && <CheckCircle className="size-4 text-blue-600" />}
                    <span className="text-sm text-stone-500">{plan.price}</span>
                  </div>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-stone-600 flex items-start gap-1.5">
                      <span className="mt-0.5 text-stone-400">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <p className="text-xs text-stone-400 italic">
                    Liên hệ để nâng cấp lên {plan.label}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
