"use client";

import type { GraveEvent, GraveEventType } from "@/types";
import { Trash2, Plus } from "lucide-react";

const EVENT_CONFIG: Record<GraveEventType, { emoji: string; label: string }> = {
  burial:             { emoji: "⚰️", label: "Chôn cất" },
  exhumation:         { emoji: "🏚️", label: "Bốc mộ" },
  grave_construction: { emoji: "🏗️", label: "Xây mộ" },
  grave_renovation:   { emoji: "🔨", label: "Tu sửa mộ" },
  cremation:          { emoji: "🔥", label: "Hỏa táng" },
  urn_placement:      { emoji: "🏺", label: "Đặt bình tro cốt" },
  cleaning:           { emoji: "🧹", label: "Vệ sinh mộ" },
  other:              { emoji: "📌", label: "Khác" },
};

function formatEventDate(ev: GraveEvent): string {
  if (ev.event_date) {
    return new Date(ev.event_date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  if (ev.event_lunar_year) {
    const day = ev.event_lunar_day ?? "?";
    const month = ev.event_lunar_month ?? "?";
    const leap = ev.event_lunar_is_leap ? " (nhuận)" : "";
    return `Mùng ${day} tháng ${month}${leap} năm ${ev.event_lunar_year} (âm)`;
  }
  return "Không rõ ngày";
}

interface GraveTimelineProps {
  events: GraveEvent[];
  canEdit: boolean;
  onAddEvent?: () => void;
  onDeleteEvent?: (id: string) => void;
}

export default function GraveTimeline({
  events,
  canEdit,
  onAddEvent,
  onDeleteEvent,
}: GraveTimelineProps) {
  if (events.length === 0 && !canEdit) {
    return (
      <p className="text-sm text-stone-400 italic">Chưa có sự kiện nào được ghi nhận.</p>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((ev, idx) => {
        const cfg = EVENT_CONFIG[ev.event_type] ?? EVENT_CONFIG.other;
        return (
          <div key={ev.id} className="flex gap-3 group">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-base flex-shrink-0 shadow-sm">
                {cfg.emoji}
              </div>
              {idx < events.length - 1 && (
                <div className="w-px flex-1 bg-stone-200 my-1" />
              )}
            </div>
            {/* Content */}
            <div className="pb-5 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 text-sm">{cfg.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{formatEventDate(ev)}</p>
                  {ev.notes && (
                    <p className="text-sm text-stone-600 italic mt-1">{ev.notes}</p>
                  )}
                  {ev.conducted_by && (
                    <p className="text-xs text-stone-400 mt-0.5">Thực hiện: {ev.conducted_by}</p>
                  )}
                </div>
                {canEdit && onDeleteEvent && (
                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                    title="Xóa sự kiện"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {canEdit && onAddEvent && (
        <button
          onClick={onAddEvent}
          className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 font-medium mt-2 transition-colors"
        >
          <Plus className="size-4" />
          Thêm sự kiện
        </button>
      )}
    </div>
  );
}
