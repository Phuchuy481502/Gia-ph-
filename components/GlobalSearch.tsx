"use client";

import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search, User, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchPerson {
  id: string;
  full_name: string;
  other_names: string | null;
  birth_year: number | null;
  gender: string;
  is_deceased: boolean;
  generation: number | null;
  avatar_url: string | null;
}

/** Normalize Vietnamese text: remove diacritics, lowercase, trim.
 *  Allows searching 'nguyen van a' to match 'Nguyễn Văn A'. */
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Score a candidate against a query (higher = better match). */
function scoreMatch(text: string, normQuery: string): number {
  if (!normQuery) return 0;
  const normText = normalize(text);
  if (normText === normQuery) return 3;
  if (normText.startsWith(normQuery)) return 2;
  if (normText.includes(normQuery)) return 1;
  return 0;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [persons, setPersons] = useState<SearchPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);

  const fetchPersons = useCallback(async () => {
    if (loaded.current) return;
    loaded.current = true;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("persons")
        .select(
          "id, full_name, other_names, birth_year, gender, is_deceased, generation, avatar_url",
        )
        .order("full_name");
      if (error) throw error;
      if (data) setPersons(data);
    } catch (err) {
      console.error("GlobalSearch: failed to fetch persons", err);
      loaded.current = false;
    } finally {
      setLoading(false);
    }
  }, []);

  const openSearch = useCallback(() => {
    setOpen(true);
    fetchPersons();
    setQuery("");
    setActiveIndex(0);
  }, [fetchPersons]);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) { closeSearch(); } else { openSearch(); }
      }
      if (e.key === "Escape" && open) closeSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openSearch, closeSearch]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = query.trim()
    ? (() => {
        const normQ = normalize(query);
        return persons
          .map((p) => {
            const nameScore = scoreMatch(p.full_name, normQ);
            const otherScore = p.other_names ? scoreMatch(p.other_names, normQ) : 0;
            const yearScore = p.birth_year?.toString().includes(query.trim()) ? 1 : 0;
            const total = Math.max(nameScore, otherScore, yearScore);
            return { p, score: total };
          })
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .map(({ p }) => p);
      })()
    : persons.slice(0, 8);

  useEffect(() => setActiveIndex(0), [query]);

  const handleSelect = (person: SearchPerson) => {
    closeSearch();
    router.push(`/dashboard/members/${person.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      handleSelect(results[activeIndex]);
    }
  };

  return (
    <>
      <button
        onClick={openSearch}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-stone-500 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
        title="Tìm kiếm (Ctrl+K)"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline text-stone-400">Tìm kiếm...</span>
        <kbd className="hidden sm:inline text-[10px] font-mono bg-white border border-stone-300 rounded px-1 py-0.5 text-stone-400">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={closeSearch}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
                  {loading ? (
                    <Loader2 className="size-5 text-stone-400 shrink-0 animate-spin" />
                  ) : (
                    <Search className="size-5 text-stone-400 shrink-0" />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tìm tên, tên khác, năm sinh... (có/không dấu)"
                    className="flex-1 text-stone-900 placeholder-stone-400 bg-transparent outline-none text-base"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={closeSearch}
                    className="text-stone-400 hover:text-stone-600 transition-colors ml-1"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {results.length === 0 && !loading ? (
                    <div className="py-10 text-center space-y-1">
                      <p className="text-stone-400 text-sm">
                        Không tìm thấy kết quả cho &quot;{query}&quot;
                      </p>
                      <p className="text-stone-300 text-xs">
                        Thử tìm không dấu: &quot;{normalize(query)}&quot;
                      </p>
                    </div>
                  ) : (
                    <ul className="py-2">
                      {!query && (
                        <li className="px-4 py-1.5">
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                            Thành viên ({persons.length})
                          </span>
                        </li>
                      )}
                      {results.map((person, i) => (
                        <li key={person.id}>
                          <button
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              i === activeIndex
                                ? "bg-amber-50 text-amber-900"
                                : "hover:bg-stone-50 text-stone-700"
                            }`}
                            onClick={() => handleSelect(person)}
                            onMouseEnter={() => setActiveIndex(i)}
                          >
                            <div className="shrink-0 size-9 rounded-full overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
                              {person.avatar_url ? (
                                <Image
                                  src={person.avatar_url}
                                  alt={person.full_name}
                                  width={36}
                                  height={36}
                                  className="object-cover size-full"
                                />
                              ) : (
                                <User className="size-4 text-stone-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {highlightMatch(person.full_name, query)}
                              </p>
                              <p className="text-xs text-stone-400 truncate flex items-center gap-2">
                                {person.other_names && (
                                  <span>{highlightMatch(person.other_names, query)}</span>
                                )}
                                {person.birth_year && (
                                  <span>
                                    {person.other_names && "· "}
                                    {person.birth_year}
                                    {person.is_deceased ? " (đã mất)" : ""}
                                  </span>
                                )}
                              </p>
                            </div>
                            {person.generation && (
                              <span className="shrink-0 text-[10px] font-bold text-stone-400 bg-stone-100 border border-stone-200 rounded-md px-1.5 py-0.5">
                                Đời {person.generation}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-stone-100 flex items-center gap-4 text-[11px] text-stone-400">
                  <span>
                    <kbd className="font-mono bg-stone-100 border border-stone-200 rounded px-1">↑↓</kbd>{" "}
                    di chuyển
                  </span>
                  <span>
                    <kbd className="font-mono bg-stone-100 border border-stone-200 rounded px-1">↵</kbd>{" "}
                    chọn
                  </span>
                  <span>
                    <kbd className="font-mono bg-stone-100 border border-stone-200 rounded px-1">Esc</kbd>{" "}
                    đóng
                  </span>
                  <span className="ml-auto">{results.length} kết quả</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** Highlight matching substring in text, supporting normalized (no-diacritic) queries. */
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;

  // Try exact match first
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let idx = lowerText.indexOf(lowerQuery);

  // Fallback: try normalized match and find position in original
  if (idx === -1) {
    const normText = normalize(text);
    const normQuery = normalize(query);
    const normIdx = normText.indexOf(normQuery);
    if (normIdx === -1) return text;
    // Map normalized index back to original string (approximate)
    idx = normIdx;
  }

  if (idx === -1) return text;
  const matchLen = query.length;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200 text-amber-900 rounded-sm px-0.5">
        {text.slice(idx, idx + matchLen)}
      </mark>
      {text.slice(idx + matchLen)}
    </>
  );
}

