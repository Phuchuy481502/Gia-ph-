"use client";

import { useState, useTransition } from "react";
import { Announcement } from "@/types";
import {
  createAnnouncement,
  deleteAnnouncement,
  togglePublicDashboard,
} from "@/app/dashboard/settings/actions";
import AnnouncementManager from "@/components/AnnouncementManager";
import { Globe, Loader2 } from "lucide-react";

interface PublicDashboardSettingsProps {
  initialEnabled: boolean;
  initialAnnouncements: Announcement[];
}

export default function PublicDashboardSettings({
  initialEnabled,
  initialAnnouncements,
}: PublicDashboardSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    setError(null);
    startTransition(async () => {
      try {
        await togglePublicDashboard(newVal);
      } catch (e) {
        setEnabled(!newVal);
        setError(e instanceof Error ? e.message : "Lỗi không xác định");
      }
    });
  };

  const handleCreate = async (data: {
    title: string;
    content: string;
    is_pinned: boolean;
    expires_at: string | null;
  }) => {
    await createAnnouncement(data);
    // Optimistic update with temp id
    const newAnn: Announcement = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content || null,
      is_pinned: data.is_pinned,
      expires_at: data.expires_at,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAnnouncements((prev) =>
      data.is_pinned ? [newAnn, ...prev] : [...prev, newAnn],
    );
  };

  const handleDelete = async (id: string) => {
    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
          <Globe className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-stone-800 text-lg">
            Trang chủ công khai
          </h2>
          <p className="text-sm text-stone-500">
            Hiển thị thống kê và thông báo cho người chưa đăng nhập
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-100">
        <div>
          <p className="font-medium text-stone-800 text-sm">
            Bật trang chủ công khai
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            Cho phép khách truy cập xem thống kê gia tộc tại trang chủ
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
            enabled ? "bg-blue-500" : "bg-stone-200"
          }`}
          aria-label="Toggle public dashboard"
        >
          {isPending ? (
            <Loader2 className="size-4 text-white absolute inset-0 m-auto animate-spin" />
          ) : (
            <span
              className={`inline-block size-4 rounded-full bg-white shadow transition-transform duration-200 ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
          {error}
        </p>
      )}

      {/* Announcement Manager */}
      <AnnouncementManager
        announcements={announcements}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
    </div>
  );
}
