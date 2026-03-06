"use client";

import { useState } from "react";
import { Announcement } from "@/types";
import { Bell, Pin, Plus, Trash2, X } from "lucide-react";

interface AnnouncementManagerProps {
  announcements: Announcement[];
  onCreate: (data: {
    title: string;
    content: string;
    is_pinned: boolean;
    expires_at: string | null;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AnnouncementManager({
  announcements,
  onCreate,
  onDelete,
}: AnnouncementManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreate({
        title: title.trim(),
        content: content.trim(),
        is_pinned: isPinned,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setTitle("");
      setContent("");
      setIsPinned(false);
      setExpiresAt("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-700 flex items-center gap-2">
          <Bell className="size-4 text-amber-500" />
          Thông báo công khai
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-sm font-medium transition-colors"
        >
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Hủy" : "Thêm thông báo"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề thông báo..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Nội dung
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung thông báo..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-stone-300 accent-amber-500"
              />
              <span className="text-sm text-stone-600 flex items-center gap-1">
                <Pin className="size-3.5" />
                Ghim lên đầu
              </span>
            </label>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-sm text-stone-600 whitespace-nowrap">
                Hết hạn:
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Đăng thông báo"}
            </button>
          </div>
        </form>
      )}

      {announcements.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-4">
          Chưa có thông báo nào.
        </p>
      ) : (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                ann.is_pinned
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white border-stone-200"
              }`}
            >
              {ann.is_pinned && (
                <Pin className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {ann.title}
                </p>
                {ann.content && (
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                    {ann.content}
                  </p>
                )}
                <p className="text-xs text-stone-400 mt-1">
                  {new Date(ann.created_at).toLocaleDateString("vi-VN")}
                  {ann.expires_at &&
                    ` · Hết hạn: ${new Date(ann.expires_at).toLocaleDateString("vi-VN")}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(ann.id)}
                disabled={deletingId === ann.id}
                className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                title="Xóa thông báo"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
