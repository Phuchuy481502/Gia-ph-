"use client";

import { useDashboard } from "./DashboardContext";
import { Layers } from "lucide-react";

const ALL_VALUE = "all";

export default function LevelGraphSelector() {
  const { levelGraph, setLevelGraph } = useDashboard();

  const current = levelGraph ?? Infinity;
  const selectValue = current === Infinity ? ALL_VALUE : String(current);

  const levels = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="relative flex items-center gap-2 bg-white border border-stone-200 rounded-2xl shadow-sm px-3 py-2 min-w-[140px] hover:border-stone-300 transition-colors">
      {/* Icon */}
      <div className="shrink-0 size-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
        <Layers className="size-4" />
      </div>

      {/* Label + Select */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider leading-none mb-1">
          Số thế hệ hiển thị
        </span>
        <select
          value={selectValue}
          onChange={(e) => {
            const val = e.target.value;
            setLevelGraph(val === ALL_VALUE ? null : Number(val));
          }}
          className="text-sm font-semibold text-stone-800 bg-transparent border-none outline-none cursor-pointer appearance-none leading-tight w-full"
        >
          <option value={ALL_VALUE}>Tất cả</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level} thế hệ
            </option>
          ))}
        </select>
      </div>

      {/* Chevron */}
      <svg
        className="shrink-0 size-4 text-stone-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
