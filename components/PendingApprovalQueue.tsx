"use client";

import { approveUser, batchApproveUsers, rejectUser } from "@/app/actions/user";
import { AdminUserData } from "@/types";
import { CheckCheck, Loader2, UserCheck, UserX, X } from "lucide-react";
import { useState } from "react";

interface PendingApprovalQueueProps {
  pendingUsers: AdminUserData[];
}

export default function PendingApprovalQueue({
  pendingUsers: initialUsers,
}: PendingApprovalQueueProps) {
  const [users, setUsers] = useState<AdminUserData[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  if (users.length === 0) return null;

  const notify = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleApprove = async (userId: string) => {
    setLoadingId(userId);
    const result = await approveUser(userId);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelected((prev) => { prev.delete(userId); return new Set(prev); });
      notify("Đã phê duyệt tài khoản thành công.", "success");
    }
    setLoadingId(null);
  };

  const handleReject = async (userId: string) => {
    setLoadingId(userId + "_reject");
    const result = await rejectUser(userId);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelected((prev) => { prev.delete(userId); return new Set(prev); });
      notify("Đã từ chối tài khoản.", "success");
    }
    setLoadingId(null);
  };

  const handleBatchApprove = async () => {
    if (selected.size === 0) return;
    setBatchLoading(true);
    const ids = Array.from(selected);
    const result = await batchApproveUsers(ids);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      setUsers((prev) => prev.filter((u) => !selected.has(u.id)));
      setSelected(new Set());
      notify(`Đã phê duyệt ${ids.length} tài khoản.`, "success");
    }
    setBatchLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-amber-200 bg-amber-100/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserCheck className="size-5 text-amber-700" />
            <span className="absolute -top-1.5 -right-1.5 size-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {users.length}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-amber-900 text-sm">
              Tài khoản chờ phê duyệt
            </h2>
            <p className="text-xs text-amber-700/70">
              Xem xét và phê duyệt các tài khoản mới đăng ký
            </p>
          </div>
        </div>
        {selected.size > 0 && (
          <button
            onClick={handleBatchApprove}
            disabled={batchLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {batchLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            Duyệt {selected.size} tài khoản
          </button>
        )}
      </div>

      {/* Notification */}
      {message && (
        <div
          className={`mx-4 mt-3 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {message.text}
          <button onClick={() => setMessage(null)}>
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Select All */}
      <div className="px-5 py-2 flex items-center gap-2 border-b border-amber-100">
        <input
          type="checkbox"
          checked={selected.size === users.length && users.length > 0}
          onChange={toggleAll}
          className="rounded border-amber-300 accent-amber-500"
          id="select-all-pending"
        />
        <label htmlFor="select-all-pending" className="text-xs font-medium text-amber-700 cursor-pointer">
          Chọn tất cả
        </label>
      </div>

      {/* User list */}
      <ul className="divide-y divide-amber-100">
        {users.map((user) => (
          <li
            key={user.id}
            className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
              selected.has(user.id) ? "bg-amber-50" : "bg-white hover:bg-amber-50/30"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(user.id)}
              onChange={() => toggleSelect(user.id)}
              className="rounded border-stone-300 accent-amber-500 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{user.email}</p>
              <p className="text-xs text-stone-400">
                Đăng ký: {new Date(user.created_at).toLocaleDateString("vi-VN")}
                {" · "}{user.role}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleApprove(user.id)}
                disabled={loadingId === user.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {loadingId === user.id ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <UserCheck className="size-3" />
                )}
                Duyệt
              </button>
              <button
                onClick={() => handleReject(user.id)}
                disabled={loadingId === user.id + "_reject"}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {loadingId === user.id + "_reject" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <UserX className="size-3" />
                )}
                Từ chối
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
