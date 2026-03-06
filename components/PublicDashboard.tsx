"use client";

import { maskName } from "@/utils/privacy";
import { Announcement, Person, PublicFamilyStats } from "@/types";
import {
  ArrowRight,
  Bell,
  Cake,
  Flower2,
  LogIn,
  Users,
  GitBranch,
  Layers,
  Heart,
  Pin,
} from "lucide-react";
import Link from "next/link";

interface UpcomingEvent {
  personName: string;
  type: "birthday" | "death_anniversary";
  daysUntil: number;
  dateLabel: string;
  isDeceased: boolean;
}

interface PublicDashboardProps {
  siteName: string;
  stats: PublicFamilyStats;
  announcements: Announcement[];
  upcomingEvents: UpcomingEvent[];
  recentMembers: Pick<Person, "id" | "full_name" | "is_deceased" | "gender" | "birth_year">[];
}

export default function PublicDashboard({
  siteName,
  stats,
  announcements,
  upcomingEvents,
  recentMembers,
}: PublicDashboardProps) {
  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
  const regularAnnouncements = announcements.filter((a) => !a.is_pinned);

  return (
    <div className="min-h-screen bg-[#fafaf9] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-amber-300/20 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-rose-200/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-20 space-y-12">
        {/* ── Header ── */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-2">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            Trang gia phả công khai
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-stone-800 leading-tight">
            {siteName}
          </h1>
          <p className="text-stone-500 max-w-md mx-auto">
            Lưu giữ và truyền lại ký ức gia tộc qua nhiều thế hệ
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-amber-200 hover:-translate-y-0.5"
            >
              <LogIn className="size-4" />
              Đăng nhập
            </Link>
          </div>
        </header>

        {/* ── Stats Row ── */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Thành viên", value: stats.totalMembers, icon: Users, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200/60" },
            { label: "Thế hệ", value: stats.totalGenerations, icon: Layers, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200/60" },
            { label: "Chi nhánh", value: stats.totalBranches, icon: GitBranch, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200/60" },
            { label: "Còn sống", value: stats.totalLiving, icon: Heart, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200/60" },
            { label: "Đã mất", value: stats.totalDeceased, icon: Flower2, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200/60" },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border ${s.border} shadow-sm`}
            >
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <s.icon className={`size-5 ${s.color}`} />
              </div>
              <span className="text-2xl font-bold text-stone-800">{s.value.toLocaleString("vi-VN")}</span>
              <span className="text-xs text-stone-500 font-medium">{s.label}</span>
            </div>
          ))}
        </section>

        {/* ── Pinned Announcements ── */}
        {pinnedAnnouncements.length > 0 && (
          <section className="space-y-3">
            {pinnedAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm"
              >
                <div className="p-2 rounded-xl bg-amber-100 shrink-0">
                  <Pin className="size-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">{ann.title}</h3>
                  {ann.content && (
                    <p className="text-amber-800/80 text-sm mt-0.5 leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {/* ── Upcoming Events ── */}
          {upcomingEvents.length > 0 && (
            <section className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Bell className="size-4 text-amber-500" />
                  Sự kiện sắp tới
                </h2>
                <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-100">
                  30 ngày
                </span>
              </div>
              <ul className="divide-y divide-stone-50">
                {upcomingEvents.slice(0, 6).map((evt, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/50 transition-colors">
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                        evt.type === "birthday"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {evt.type === "birthday" ? (
                        <Cake className="size-4" />
                      ) : (
                        <Flower2 className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-700 truncate">
                        {evt.isDeceased ? evt.personName : maskName(evt.personName)}
                      </p>
                      <p className="text-xs text-stone-400">
                        {evt.dateLabel}
                        {evt.daysUntil === 0
                          ? " · Hôm nay"
                          : evt.daysUntil === 1
                          ? " · Ngày mai"
                          : ` · ${evt.daysUntil} ngày nữa`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Recent Members ── */}
          {recentMembers.length > 0 && (
            <section className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Users className="size-4 text-blue-500" />
                  Thành viên mới
                </h2>
                <ArrowRight className="size-4 text-stone-300" />
              </div>
              <ul className="divide-y divide-stone-50">
                {recentMembers.map((member) => (
                  <li key={member.id} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/50 transition-colors">
                    <div className="size-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-stone-400 text-xs font-bold">
                      {member.is_deceased ? "✝" : (member.gender === "female" ? "♀" : "♂")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-700 truncate">
                        {member.is_deceased ? member.full_name : maskName(member.full_name)}
                      </p>
                      {member.birth_year && (
                        <p className="text-xs text-stone-400">Sinh {member.birth_year}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Regular Announcements ── */}
        {regularAnnouncements.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-stone-700 text-lg">Thông báo</h2>
            {regularAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone-200/60 shadow-sm"
              >
                <div className="p-2 rounded-xl bg-stone-50 shrink-0">
                  <Bell className="size-4 text-stone-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm">{ann.title}</h3>
                  {ann.content && (
                    <p className="text-stone-600 text-sm mt-0.5 leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>
                  )}
                  <p className="text-xs text-stone-400 mt-1">
                    {new Date(ann.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── Footer CTA ── */}
        <footer className="text-center py-4 text-stone-400 text-sm border-t border-stone-100">
          <p>
            Powered by{" "}
            <a
              href="https://github.com/minhtuancn/giapha-os"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:underline font-medium"
            >
              Gia Phả OS
            </a>{" "}
            · Mã nguồn mở
          </p>
        </footer>
      </div>
    </div>
  );
}
