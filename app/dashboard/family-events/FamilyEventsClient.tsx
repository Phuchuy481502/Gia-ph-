"use client";

import { FamilyEvent, FamilyEventType, Branch } from "@/types";
import {
  createFamilyEvent,
  deleteFamilyEvent,
  updateFamilyEvent,
} from "./actions";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

const EVENT_TYPE_LABELS: Record<FamilyEventType, string> = {
  gio_ho: "🕯️ Giỗ họ",
  wedding: "💍 Đám cưới",
  funeral: "🪷 Tang lễ",
  reunion: "🤝 Họp họ",
  ceremony: "🎋 Lễ tế",
  other: "📅 Khác",
};

const EVENT_TYPE_COLORS: Record<FamilyEventType, string> = {
  gio_ho: "bg-purple-50 text-purple-700 border-purple-200",
  wedding: "bg-pink-50 text-pink-700 border-pink-200",
  funeral: "bg-stone-50 text-stone-600 border-stone-200",
  reunion: "bg-blue-50 text-blue-700 border-blue-200",
  ceremony: "bg-amber-50 text-amber-700 border-amber-200",
  other: "bg-stone-50 text-stone-500 border-stone-200",
};

interface Props {
  initialEvents: FamilyEvent[];
  branches: Pick<Branch, "id" | "name">[];
  isAdmin: boolean;
}

const EMPTY_FORM = {
  title: "",
  event_type: "gio_ho" as FamilyEventType,
  event_date: "",
  location: "",
  description: "",
  branch_id: null as string | null,
  is_public: true,
};

export default function FamilyEventsClient({
  initialEvents,
  branches,
  isAdmin,
}: Props) {
  const [events, setEvents] = useState<FamilyEvent[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (evt: FamilyEvent) => {
    setForm({
      title: evt.title,
      event_type: evt.event_type,
      event_date: evt.event_date,
      location: evt.location ?? "",
      description: evt.description ?? "",
      branch_id: evt.branch_id ?? null,
      is_public: evt.is_public,
    });
    setEditingId(evt.id);
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.event_date) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateFamilyEvent(editingId, form);
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === editingId
              ? { ...ev, ...form, updated_at: new Date().toISOString() }
              : ev,
          ),
        );
      } else {
        const newId = await createFamilyEvent(form);
        if (newId) {
          setEvents((prev) => [
            {
              id: newId,
              ...form,
              created_at: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      }
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteFamilyEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white";

  return (
    <div className="space-y-6">
      {/* Create button */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus className="size-4" />
            Thêm sự kiện
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-stone-800">
              {editingId ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
                required
                placeholder="Ví dụ: Giỗ tổ họ Đoàn năm 2025"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Loại sự kiện
              </label>
              <select
                value={form.event_type}
                onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value as FamilyEventType }))}
                className={inputCls}
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Ngày diễn ra *
              </label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Địa điểm
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={inputCls}
                placeholder="Địa chỉ tổ chức..."
              />
            </div>
            {branches.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Chi nhánh (tuỳ chọn)
                </label>
                <select
                  value={form.branch_id ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value || null }))}
                  className={inputCls}
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Mô tả
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Nội dung, chương trình sự kiện..."
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={form.is_public}
                onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
                className="rounded accent-amber-500"
              />
              <label htmlFor="is_public" className="text-sm text-stone-600 cursor-pointer">
                Hiển thị công khai trên trang chủ
              </label>
            </div>
          </div>
          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo sự kiện"}
            </button>
          </div>
        </form>
      )}

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Calendar className="size-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Chưa có sự kiện họ tộc nào.</p>
          {isAdmin && (
            <p className="text-sm mt-1">Nhấn &ldquo;Thêm sự kiện&rdquo; để bắt đầu.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => {
            const colorCls = EVENT_TYPE_COLORS[evt.event_type] ?? EVENT_TYPE_COLORS.other;
            const isExpanded = expandedId === evt.id;
            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
              >
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-stone-50/40 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                >
                  <div className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs font-semibold ${colorCls}`}>
                    {EVENT_TYPE_LABELS[evt.event_type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{evt.title}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 text-xs text-stone-500">
                        <Calendar className="size-3" />
                        {new Date(evt.event_date).toLocaleDateString("vi-VN")}
                      </span>
                      {evt.location && (
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="size-3" />
                          {evt.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(evt); }}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-stone-400 hover:text-amber-600 transition-colors"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(evt.id); }}
                          disabled={deletingId === evt.id}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="size-4 text-stone-400" />
                    )}
                  </div>
                </div>
                {isExpanded && evt.description && (
                  <div className="px-4 pb-4 pt-0 border-t border-stone-100">
                    <p className="text-sm text-stone-600 whitespace-pre-line leading-relaxed mt-3">
                      {evt.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
