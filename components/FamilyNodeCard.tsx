"use client";

import { Person } from "@/types";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useDashboard } from "./DashboardContext";
import DefaultAvatar from "./DefaultAvatar";

interface FamilyNodeCardProps {
  person: Person;
  role?: string; // e.g., "Chồng", "Vợ"
  note?: string | null;
  onClickCard?: () => void;
  onClickName?: (e: React.MouseEvent) => void;
  isExpandable?: boolean;
  isExpanded?: boolean;
  isRingVisible?: boolean;
  isPlusVisible?: boolean;
  level: number;
}

export default function FamilyNodeCard({
  person,
  onClickCard,
  onClickName,
  isExpandable = false,
  isExpanded = false,
  isRingVisible = false,
  isPlusVisible = false,
}: FamilyNodeCardProps) {
  const { showAvatar, setMemberModalId, verticalName } = useDashboard();

  const isDeceased = person.is_deceased;

  // Vertical writing mode when enabled and in compact (no-avatar) mode
  const nameStyle = !showAvatar && verticalName
    ? { writingMode: "vertical-rl" as const, textOrientation: "mixed" as const, maxHeight: "5rem" }
    : undefined;

  const content = (
    <div
      onClick={onClickCard}
      className={`
        group py-2 px-1 flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 rounded-2xl relative h-full
        ${isDeceased ? "grayscale-[0.4] opacity-80" : ""}
        ${showAvatar ? "w-20 sm:w-24 md:w-28 bg-white/70 hover:shadow-xl" : "px-3"}
      `}
    >
      {isRingVisible && (
        <div
          className={`
            absolute top-[15%] -left-2.5 sm:-left-3.5 size-5 sm:size-6 rounded-full z-100 flex items-center justify-center text-[10px] sm:text-sm font-medium text-stone-500
            ${showAvatar ? "shadow-sm bg-white" : ""}
          `}
        >
          <span className="leading-none">💍</span>
        </div>
      )}
      {isPlusVisible && (
        <div
          className={`
            absolute top-[15%] -left-2.5 sm:-left-3.5 size-5 sm:size-6 rounded-full z-100 flex items-center justify-center text-[10px] sm:text-sm font-medium text-stone-500
            ${showAvatar ? "shadow-sm bg-white" : ""}
          `}
        >
          <span className="leading-none">+</span>
        </div>
      )}

      {/* Generation Badge */}
      {person.generation != null && (
        <div className="absolute top-1 left-1 z-20 text-[9px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded px-1 leading-tight">
          Đ{person.generation}
        </div>
      )}

      {/* Expand/Collapse Indicator */}
      {isExpandable && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-stone-200/80 rounded-full size-6 flex items-center justify-center shadow-md z-100 text-stone-500 hover:text-amber-600 transition-colors">
          {isExpanded ? (
            <Minus className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </div>
      )}

      {/* 1. Avatar */}
      {showAvatar && (
        <div className="relative z-10 mb-1.5 sm:mb-2">
          <div
            className={`
              h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm text-white overflow-hidden shrink-0 shadow-lg ring-2 ring-white transition-transform duration-300 group-hover:scale-105
              ${
                person.gender === "male"
                  ? "bg-linear-to-br from-sky-400 to-sky-700"
                  : person.gender === "female"
                    ? "bg-linear-to-br from-rose-400 to-rose-700"
                    : "bg-linear-to-br from-stone-400 to-stone-600"
              }
            `}
          >
            {person.avatar_url ? (
              <Image
                unoptimized
                src={person.avatar_url}
                alt={person.full_name}
                className="w-full h-full object-cover"
                width={64}
                height={64}
              />
            ) : (
              <DefaultAvatar gender={person.gender} />
            )}
          </div>
        </div>
      )}

      {/* 2. Name (+ saint name prefix) */}
      <div className="flex flex-col items-center justify-center gap-0.5 w-full px-0.5 sm:px-1 relative z-10">
        {person.saint_name && (
          <div className="text-[8px] sm:text-[9px] text-violet-500 font-medium text-center leading-tight truncate w-full">
            {person.saint_name}
          </div>
        )}
        <div
          className={`
            text-[10px] sm:text-[11px] md:text-xs font-bold text-center leading-tight transition-colors cursor-pointer line-clamp-2 w-full
            ${onClickName ? "text-stone-800 group-hover:text-amber-700 hover:underline" : "text-stone-800 group-hover:text-amber-800"}
          `}
          style={nameStyle}
          title={`${person.saint_name ? person.saint_name + " " : ""}${person.full_name}`}
          onClick={(e) => {
            if (onClickName) {
              e.stopPropagation();
              e.preventDefault();
              onClickName(e);
            }
          }}
        >
          {person.full_name}
        </div>
      </div>
    </div>
  );

  if (onClickCard || onClickName) {
    return content;
  }

  return (
    <button onClick={() => setMemberModalId(person.id)} className="block w-fit">
      {content}
    </button>
  );
}
