"use client";

import { bulkDeleteMembers } from "@/app/actions/member";
import PersonCard from "@/components/PersonCard";
import VerticalText from "@/components/VerticalText";
import { Branch, Person, Relationship } from "@/types";
import {
  ArrowUpDown,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  LayoutList,
  Plus,
  Printer,
  Search,
  Square,
  Trash2,
  Type,
  Users,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useDashboard } from "./DashboardContext";
import PrintMemberList from "./PrintMemberList";
import { useUser } from "./UserProvider";

export default function DashboardMemberList({
  initialPersons,
  branches = [],
  canEdit = false,
  relationships = [],
}: {
  initialPersons: Person[];
  branches?: Branch[];
  canEdit?: boolean;
  relationships?: Relationship[];
}) {
  const { setShowCreateMember, verticalName, setVerticalName } = useDashboard();
  const { isAdmin } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("q") ?? "");
  const [sortOption, setSortOption] = useState(() => searchParams.get("sort") ?? "updated_desc");
  const [filterOption, setFilterOption] = useState(() => searchParams.get("filter") ?? "all");
  const [generationFilter, setGenerationFilter] = useState(() => searchParams.get("gen") ?? "all");
  const [branchFilter, setBranchFilter] = useState(() => searchParams.get("branch") ?? "all");
  const [birthYearMin, setBirthYearMin] = useState(() => searchParams.get("ymin") ?? "");
  const [birthYearMax, setBirthYearMax] = useState(() => searchParams.get("ymax") ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [groupByFamily, setGroupByFamily] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync filters to URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const set = (key: string, val: string, def: string) => {
      if (val && val !== def) params.set(key, val); else params.delete(key);
    };
    set("q", searchTerm, "");
    set("sort", sortOption, "updated_desc");
    set("filter", filterOption, "all");
    set("gen", generationFilter, "all");
    set("branch", branchFilter, "all");
    set("ymin", birthYearMin, "");
    set("ymax", birthYearMax, "");
    const newSearch = params.toString();
    const current = searchParams.toString();
    if (newSearch !== current) {
      router.replace(`?${newSearch}`, { scroll: false });
    }
  }, [searchTerm, sortOption, filterOption, generationFilter, branchFilter, birthYearMin, birthYearMax, router, searchParams]);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const generations = useMemo(() => {
    const gens = new Set<number>();
    initialPersons.forEach((p) => {
      if (p.generation != null) gens.add(p.generation);
    });
    return Array.from(gens).sort((a, b) => a - b);
  }, [initialPersons]);

  const filteredPersons = useMemo(() => {
    const normSearch = searchTerm
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const yMin = birthYearMin ? parseInt(birthYearMin) : null;
    const yMax = birthYearMax ? parseInt(birthYearMax) : null;
    return initialPersons.filter((person) => {
      const normName = person.full_name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const normOther = (person.other_names ?? "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const matchesSearch =
        !normSearch ||
        normName.includes(normSearch) ||
        normOther.includes(normSearch) ||
        (person.birth_year?.toString().includes(normSearch) ?? false);

      let matchesFilter = true;
      switch (filterOption) {
        case "male":
          matchesFilter = person.gender === "male";
          break;
        case "female":
          matchesFilter = person.gender === "female";
          break;
        case "in_law_female":
          matchesFilter = person.gender === "female" && person.is_in_law;
          break;
        case "in_law_male":
          matchesFilter = person.gender === "male" && person.is_in_law;
          break;
        case "alive":
          matchesFilter = !person.is_deceased;
          break;
        case "deceased":
          matchesFilter = person.is_deceased;
          break;
        case "first_child":
          matchesFilter = person.birth_order === 1;
          break;
        case "all":
        default:
          matchesFilter = true;
          break;
      }

      const matchesGeneration =
        generationFilter === "all" ||
        person.generation === parseInt(generationFilter);

      const matchesBranch =
        branchFilter === "all" ||
        (branchFilter === "none" ? !person.branch_id : person.branch_id === branchFilter);

      const matchesBirthYear =
        (yMin === null || (person.birth_year ?? 0) >= yMin) &&
        (yMax === null || (person.birth_year ?? 9999) <= yMax);

      return matchesSearch && matchesFilter && matchesGeneration && matchesBranch && matchesBirthYear;
    });
  }, [initialPersons, searchTerm, filterOption, generationFilter, branchFilter, birthYearMin, birthYearMax]);

  const sortedPersons = useMemo(() => {
    return [...filteredPersons].sort((a, b) => {
      switch (sortOption) {
        case "birth_asc":
          return (a.birth_year || 9999) - (b.birth_year || 9999);
        case "birth_desc":
          return (b.birth_year || 0) - (a.birth_year || 0);
        case "name_asc":
          return a.full_name.localeCompare(b.full_name, "vi");
        case "name_desc":
          return b.full_name.localeCompare(a.full_name, "vi");
        case "updated_desc":
          return (
            new Date(b.updated_at || 0).getTime() -
            new Date(a.updated_at || 0).getTime()
          );
        case "updated_asc":
          return (
            new Date(a.updated_at || 0).getTime() -
            new Date(b.updated_at || 0).getTime()
          );
        case "generation_asc":
          if (a.generation !== b.generation) {
            return (a.generation || 999) - (b.generation || 999);
          }
          return (a.birth_order || 999) - (b.birth_order || 999);
        case "generation_desc":
          if (b.generation !== a.generation) {
            return (b.generation || 0) - (a.generation || 0);
          }
          return (b.birth_order || 0) - (a.birth_order || 0);
        default:
          return 0;
      }
    });
  }, [filteredPersons, sortOption]);

  const handleExitBulkMode = useCallback(() => {
    setBulkMode(false);
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  const handleToggleRow = useCallback(
    (id: string, index: number, shiftKey: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (shiftKey && lastSelectedIndex !== null) {
          const start = Math.min(lastSelectedIndex, index);
          const end = Math.max(lastSelectedIndex, index);
          const rangeIds = sortedPersons.slice(start, end + 1).map((p) => p.id);
          const allSelected = rangeIds.every((rid) => next.has(rid));
          rangeIds.forEach((rid) => (allSelected ? next.delete(rid) : next.add(rid)));
        } else {
          if (next.has(id)) { next.delete(id); } else { next.add(id); }
        }
        return next;
      });
      setLastSelectedIndex(index);
    },
    [lastSelectedIndex, sortedPersons]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(sortedPersons.map((p) => p.id)));
  }, [sortedPersons]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn xoá ${ids.length} thành viên đã chọn? Hành động này không thể hoàn tác.`
      )
    )
      return;

    startTransition(async () => {
      try {
        const result = await bulkDeleteMembers(ids);
        const deletedCount = result.deleted.length;
        const failedCount = result.failed.length;

        if (deletedCount > 0 && failedCount === 0) {
          showToast("success", `Đã xoá thành công ${deletedCount} thành viên.`);
        } else if (deletedCount > 0 && failedCount > 0) {
          showToast(
            "error",
            `Đã xoá ${deletedCount} thành viên. ${failedCount} thành viên không thể xoá (có mối quan hệ gia đình).`
          );
        } else {
          showToast(
            "error",
            `Không thể xoá thành viên. ${result.failed[0]?.error ?? "Vui lòng thử lại."}`
          );
        }

        setSelectedIds(new Set());
        setLastSelectedIndex(null);
        router.refresh();
      } catch {
        showToast("error", "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    });
  }, [selectedIds, router, showToast]);

  const handleBulkExport = useCallback(() => {
    const ids = selectedIds;
    const exportData = sortedPersons
      .filter((p) => ids.has(p.id))
      .map(({ id, full_name, birth_year, gender, generation, is_deceased }) => ({
        id,
        full_name,
        birth_year,
        gender,
        generation,
        is_deceased,
      }));

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `giapha-export-selected-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedIds, sortedPersons]);

  const chevronDown = (    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      <svg className="size-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  const isFiltered =
    searchTerm !== "" || filterOption !== "all" || generationFilter !== "all" ||
    branchFilter !== "all" || birthYearMin !== "" || birthYearMax !== "";

  // Build family groups: each "parent" (or root person) + their direct children
  const familyGroups = useMemo(() => {
    if (!groupByFamily) return null;
    const personsById = new Map(sortedPersons.map((p) => [p.id, p]));
    // Build parent→children from relationships
    const childToParents = new Map<string, string[]>();
    const parentToChildren = new Map<string, string[]>();
    for (const r of relationships) {
      if (r.type === "biological_child" || r.type === "adopted_child") {
        const arr = parentToChildren.get(r.person_a) ?? [];
        arr.push(r.person_b);
        parentToChildren.set(r.person_a, arr);
        const pa = childToParents.get(r.person_b) ?? [];
        pa.push(r.person_a);
        childToParents.set(r.person_b, pa);
      }
    }
    // A "family head" is anyone in filteredPersons who has children in filteredPersons
    const groups: Array<{ head: Person; children: Person[] }> = [];
    const includedAsChild = new Set<string>();
    for (const p of sortedPersons) {
      const children = (parentToChildren.get(p.id) ?? [])
        .filter((cid) => personsById.has(cid))
        .map((cid) => personsById.get(cid)!);
      if (children.length > 0) {
        groups.push({ head: p, children });
        children.forEach((c) => includedAsChild.add(c.id));
      }
    }
    // Add persons that aren't heads or children as standalone
    const standalone = sortedPersons.filter(
      (p) => !groups.some((g) => g.head.id === p.id) && !includedAsChild.has(p.id),
    );
    return { groups, standalone };
  }, [groupByFamily, sortedPersons, relationships]);

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
          <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mb-6 relative">
        <div className="flex flex-col gap-3 bg-white/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-200/60 transition-all duration-300 relative z-10 w-full">
          {/* Row 1: search + add button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm theo tên, tên khác..."
                className="bg-white/90 text-stone-900 w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/80 shadow-sm placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !bulkMode && (
                <button
                  onClick={() => setBulkMode(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-200/80 bg-white/90 text-stone-600 hover:border-amber-400 hover:text-amber-600 text-sm font-medium shadow-sm transition-all no-print"
                >
                  <CheckSquare className="size-4" />
                  Chọn nhiều
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-200/80 bg-white/90 text-stone-600 hover:border-amber-400 hover:text-amber-600 text-sm font-medium shadow-sm transition-all no-print"
              >
                <Printer className="size-4" />
                <span className="hidden sm:inline">In danh sách</span>
              </button>
              {/* Family group view toggle */}
              <button
                onClick={() => setGroupByFamily(!groupByFamily)}
                title={groupByFamily ? "Chuyển về danh sách phẳng" : "Nhóm theo gia đình"}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium shadow-sm transition-all no-print ${
                  groupByFamily
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-stone-200/80 bg-white/90 text-stone-600 hover:border-amber-400 hover:text-amber-600"
                }`}
              >
                {groupByFamily ? <LayoutList className="size-4" /> : <Users className="size-4" />}
                <span className="hidden sm:inline">{groupByFamily ? "Danh sách" : "Theo gia đình"}</span>
              </button>
              {/* Vertical names toggle */}
              <button
                onClick={() => setVerticalName(!verticalName)}
                title={verticalName ? "Hiển thị tên ngang" : "Hiển thị tên dọc"}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium shadow-sm transition-all no-print ${
                  verticalName
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-stone-200/80 bg-white/90 text-stone-600 hover:border-amber-400 hover:text-amber-600"
                }`}
              >
                <Type className="size-4" />
                <span className="hidden sm:inline">{verticalName ? "Tên ngang" : "Tên dọc"}</span>
              </button>
              {canEdit && (
                <button
                  onClick={() => setShowCreateMember(true)}
                  className="btn-primary no-print"
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                  Thêm thành viên
                </button>
              )}
            </div>
          </div>

          {/* Bulk mode toolbar */}
          {canEdit && bulkMode && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200/60">
              <span className="text-sm font-medium text-stone-700">
                Đã chọn{" "}
                <span className="font-bold text-amber-600">{selectedIds.size}</span>{" "}
                thành viên
              </span>

              <button
                onClick={handleSelectAll}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium transition-colors"
              >
                Chọn tất cả ({sortedPersons.length})
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeselectAll}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium transition-colors"
                >
                  Bỏ chọn tất cả
                </button>
              )}

              {selectedIds.size > 0 && (
                <>
                  <button
                    onClick={handleBulkExport}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium border border-blue-200 transition-colors"
                  >
                    <Download className="size-3.5" />
                    Xuất {selectedIds.size} thành viên
                  </button>

                  {isAdmin && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="size-3.5" />
                    {isPending ? "Đang xoá..." : `Xoá ${selectedIds.size} thành viên`}
                  </button>
                  )}
                </>
              )}

              <button
                onClick={handleExitBulkMode}
                className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 font-medium transition-colors"
              >
                <X className="size-3.5" />
                Huỷ
              </button>
            </div>
          )}

          {/* Row 2: filters + sort */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Filter by category */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
              <select
                className="appearance-none bg-white/90 text-stone-700 w-full sm:w-40 pl-9 pr-8 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300 font-medium text-sm transition-all focus:bg-white"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="alive">Còn sống</option>
                <option value="deceased">Đã mất</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="in_law_female">Dâu</option>
                <option value="in_law_male">Rể</option>
                <option value="first_child">Con trưởng</option>
              </select>
              {chevronDown}
            </div>

            {/* Filter by generation */}
            {generations.length > 0 && (
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                <select
                  className="appearance-none bg-white/90 text-stone-700 w-full sm:w-40 pl-9 pr-8 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300 font-medium text-sm transition-all focus:bg-white"
                  value={generationFilter}
                  onChange={(e) => setGenerationFilter(e.target.value)}
                >
                  <option value="all">Tất cả thế hệ</option>
                  {generations.map((g) => (
                    <option key={g} value={String(g)}>
                      Đời thứ {g}
                    </option>
                  ))}
                </select>
                {chevronDown}
              </div>
            )}

            {/* Filter by branch */}
            {branches.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-amber-500 pointer-events-none" />
                <select
                  className="appearance-none bg-white/90 text-stone-700 w-full sm:w-44 pl-9 pr-8 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300 font-medium text-sm transition-all focus:bg-white"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="all">Tất cả chi/nhánh</option>
                  <option value="none">Chưa phân chi</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {chevronDown}
              </div>
            )}

            {/* Filter by birth year range */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Năm từ"
                min={1000}
                max={new Date().getFullYear()}
                className="bg-white/90 text-stone-700 w-24 px-3 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                value={birthYearMin}
                onChange={(e) => setBirthYearMin(e.target.value)}
              />
              <span className="text-stone-400 text-xs">—</span>
              <input
                type="number"
                placeholder="đến"
                min={1000}
                max={new Date().getFullYear()}
                className="bg-white/90 text-stone-700 w-20 px-3 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                value={birthYearMax}
                onChange={(e) => setBirthYearMax(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
              <select
                className="appearance-none bg-white/90 text-stone-700 w-full sm:w-52 pl-9 pr-8 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300 font-medium text-sm transition-all focus:bg-white"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="birth_asc">Năm sinh (Tăng dần)</option>
                <option value="birth_desc">Năm sinh (Giảm dần)</option>
                <option value="name_asc">Tên (A-Z)</option>
                <option value="name_desc">Tên (Z-A)</option>
                <option value="updated_desc">Cập nhật (Mới nhất)</option>
                <option value="updated_asc">Cập nhật (Cũ nhất)</option>
                <option value="generation_asc">Theo thế hệ (Tăng dần)</option>
                <option value="generation_desc">Theo thế hệ (Giảm dần)</option>
              </select>
              {chevronDown}
            </div>

            {/* Result count + clear filter */}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-stone-500">
                <span className="font-semibold text-stone-700">
                  {sortedPersons.length}
                </span>
                {isFiltered && (
                  <span className="text-stone-400"> / {initialPersons.length}</span>
                )}{" "}
                thành viên
              </span>
              {isFiltered && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterOption("all");
                    setGenerationFilter("all");
                    setBranchFilter("all");
                    setBirthYearMin("");
                    setBirthYearMax("");
                  }}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors"
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {sortedPersons.length > 0 ? (
        groupByFamily && familyGroups ? (
          /* ── Family Group View ───────────────────────────────── */
          <div className="space-y-4">
            {familyGroups.groups.map(({ head, children }) => {
              const isCollapsed = collapsedGroups.has(head.id);
              return (
                <div key={head.id} className="border border-stone-200 rounded-2xl overflow-hidden bg-white/60">
                  {/* Group header */}
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 bg-stone-50 hover:bg-amber-50 transition-colors text-left"
                    onClick={() => {
                      setCollapsedGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(head.id)) next.delete(head.id);
                        else next.add(head.id);
                        return next;
                      });
                    }}
                  >
                    {isCollapsed ? <ChevronRight className="size-4 text-stone-400 shrink-0" /> : <ChevronDown className="size-4 text-amber-500 shrink-0" />}
                    <span className="font-semibold text-stone-800 text-sm">{head.full_name}</span>
                    {head.generation && <span className="text-xs text-stone-400">Đ{head.generation}</span>}
                    {head.birth_year && <span className="text-xs text-stone-400">({head.birth_year})</span>}
                    <span className="ml-auto text-xs text-stone-400">{children.length} con</span>
                  </button>
                  {!isCollapsed && (
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Parent card */}
                      <div className="sm:col-span-2 lg:col-span-1">
                        <PersonCard person={head} showVerticalName={verticalName} />
                      </div>
                      {/* Children */}
                      {children.map((child) => (
                        <PersonCard key={child.id} person={child} showVerticalName={verticalName} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Standalone persons */}
            {familyGroups.standalone.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyGroups.standalone.map((person) => (
                  <PersonCard key={person.id} person={person} showVerticalName={verticalName} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Flat Grid View ──────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPersons.map((person, index) => (
              <div
                key={person.id}
                className={`relative rounded-2xl transition-all duration-150 ${
                  bulkMode
                    ? `cursor-pointer ring-2 ${
                        selectedIds.has(person.id)
                          ? "ring-amber-400 bg-amber-50"
                          : "ring-transparent hover:ring-amber-200"
                      }`
                    : ""
                }`}
                onClick={
                  bulkMode
                    ? (e) => handleToggleRow(person.id, index, e.shiftKey)
                    : undefined
                }
              >
                {bulkMode && (
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    {selectedIds.has(person.id) ? (
                      <CheckSquare className="size-5 text-amber-500 drop-shadow" />
                    ) : (
                      <Square className="size-5 text-stone-400 drop-shadow" />
                    )}
                  </div>
                )}
                <PersonCard person={person} showVerticalName={verticalName} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 text-stone-400 italic">
          {initialPersons.length > 0
            ? "Không tìm thấy thành viên phù hợp."
            : "Chưa có thành viên nào. Hãy thêm thành viên đầu tiên."}
        </div>
      )}

      <PrintMemberList persons={sortedPersons} />
    </>
  );
}
