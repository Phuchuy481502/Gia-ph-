import type { BurialType, GraveStatus, RemainsStatus } from "@/types";

const GRAVE_STATUS_CONFIG: Record<GraveStatus, { label: string; className: string }> = {
  no_grave:     { label: "Chưa có mộ",  className: "bg-red-100 text-red-700 border-red-200" },
  has_grave:    { label: "Đã xây mộ",   className: "bg-green-100 text-green-700 border-green-200" },
  grave_moved:  { label: "Đã cải táng", className: "bg-orange-100 text-orange-700 border-orange-200" },
  cremated_urn: { label: "Tro cốt",     className: "bg-blue-100 text-blue-700 border-blue-200" },
  unknown:      { label: "Chưa rõ",     className: "bg-stone-100 text-stone-500 border-stone-200" },
};

const BURIAL_TYPE_CONFIG: Record<BurialType, { label: string; className: string }> = {
  burial:        { label: "Địa táng",        className: "bg-amber-100 text-amber-700 border-amber-200" },
  cremation:     { label: "Hỏa táng",        className: "bg-orange-100 text-orange-700 border-orange-200" },
  cremation_urn: { label: "Hỏa táng (bình)", className: "bg-orange-100 text-orange-700 border-orange-200" },
  sea_burial:    { label: "Thủy táng",       className: "bg-sky-100 text-sky-700 border-sky-200" },
  other:         { label: "Khác",            className: "bg-stone-100 text-stone-500 border-stone-200" },
};

const REMAINS_STATUS_CONFIG: Record<RemainsStatus, { label: string; className: string }> = {
  in_ground:       { label: "Còn trong đất", className: "bg-stone-100 text-stone-600 border-stone-200" },
  exhumed:         { label: "Đã bốc mộ",     className: "bg-amber-100 text-amber-700 border-amber-200" },
  cremated_ashes:  { label: "Tro cốt",       className: "bg-orange-100 text-orange-700 border-orange-200" },
  urn_home:        { label: "Bình tại nhà",  className: "bg-blue-100 text-blue-700 border-blue-200" },
  unknown:         { label: "Chưa rõ",       className: "bg-stone-100 text-stone-500 border-stone-200" },
};

const baseCls = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border";

export function GraveStatusBadge({ status }: { status: GraveStatus }) {
  const cfg = GRAVE_STATUS_CONFIG[status] ?? GRAVE_STATUS_CONFIG.unknown;
  return <span className={`${baseCls} ${cfg.className}`}>{cfg.label}</span>;
}

export function BurialTypeBadge({ type }: { type: BurialType }) {
  const cfg = BURIAL_TYPE_CONFIG[type] ?? BURIAL_TYPE_CONFIG.other;
  return <span className={`${baseCls} ${cfg.className}`}>{cfg.label}</span>;
}

export function RemainsStatusBadge({ status }: { status: RemainsStatus }) {
  const cfg = REMAINS_STATUS_CONFIG[status] ?? REMAINS_STATUS_CONFIG.unknown;
  return <span className={`${baseCls} ${cfg.className}`}>{cfg.label}</span>;
}
