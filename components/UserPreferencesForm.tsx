"use client";

import { saveUserPreferences } from "@/app/dashboard/preferences/actions";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";

interface Person {
  id: string;
  full_name: string;
  birth_year: number | null;
  generation: number | null;
}

interface Branch {
  id: string;
  name: string;
}

interface UserPrefs {
  default_root_person_id?: string | null;
  default_branch_id?: string | null;
  default_generation_from?: number | null;
}

interface UserPreferencesFormProps {
  persons: Person[];
  branches: Branch[];
  initialPrefs: UserPrefs | null;
}

export default function UserPreferencesForm({
  persons,
  branches,
  initialPrefs,
}: UserPreferencesFormProps) {
  const [rootPersonId, setRootPersonId] = useState(initialPrefs?.default_root_person_id ?? "");
  const [branchId, setBranchId] = useState(initialPrefs?.default_branch_id ?? "");
  const [generationFrom, setGenerationFrom] = useState<number | "">(
    initialPrefs?.default_generation_from ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClasses =
    "bg-white text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-300 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm px-4 py-2.5 transition-all outline-none!";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await saveUserPreferences({
        default_root_person_id: rootPersonId || null,
        default_branch_id: branchId || null,
        default_generation_from: generationFrom === "" ? null : Number(generationFrom),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Người gốc mặc định khi xem cây gia phả
        </label>
        <p className="text-xs text-stone-400 mb-2">Cây sẽ bắt đầu từ người này khi bạn vào xem</p>
        <select
          value={rootPersonId}
          onChange={(e) => setRootPersonId(e.target.value)}
          className={`${inputClasses} appearance-none`}
        >
          <option value="">— Mặc định hệ thống (người đời đầu tiên) —</option>
          {persons.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
              {p.birth_year ? ` (${p.birth_year})` : ""}
              {p.generation != null ? ` — Đời ${p.generation}` : ""}
            </option>
          ))}
        </select>
      </div>

      {branches.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Chi / Nhánh mặc định
          </label>
          <p className="text-xs text-stone-400 mb-2">Chỉ xem thành viên thuộc chi này</p>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className={`${inputClasses} appearance-none`}
          >
            <option value="">— Xem tất cả chi —</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Hiển thị từ đời thứ (tùy chọn)
        </label>
        <p className="text-xs text-stone-400 mb-2">Ẩn các đời trước đời này — ví dụ nhập 3 để chỉ xem từ đời thứ 3</p>
        <input
          type="number"
          min="1"
          value={generationFrom}
          onChange={(e) => setGenerationFrom(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Nhập số đời muốn bắt đầu hiển thị..."
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 p-3 rounded-xl">{error}</p>
      )}

      <div className="flex items-center justify-between pt-2">
        {saved && (
          <p className="text-emerald-600 text-sm font-medium">✓ Đã lưu tùy chọn</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary ml-auto">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Lưu tùy chọn
        </button>
      </div>
    </form>
  );
}
