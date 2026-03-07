"use client";

import { Person, Relationship } from "@/types";
import { BookOpen, ChevronDown, ChevronUp, Download, Loader2, Settings2 } from "lucide-react";
import { useState } from "react";

interface Props {
  persons: Person[];
  relationships: Relationship[];
  familyName?: string;
}

/** BFS to find all descendant IDs (inclusive) of a root person */
function getSubtreeIds(rootId: string, relationships: Relationship[], maxDepth: number): Set<string> {
  const childrenMap = new Map<string, string[]>();
  for (const r of relationships) {
    if (r.type === "biological_child" || r.type === "adopted_child") {
      const children = childrenMap.get(r.person_a) ?? [];
      children.push(r.person_b);
      childrenMap.set(r.person_a, children);
    }
  }
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: rootId, depth: 0 }];
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    if (depth < maxDepth) {
      for (const child of childrenMap.get(id) ?? []) {
        queue.push({ id: child, depth: depth + 1 });
      }
    }
  }
  return visited;
}

export default function FamilyBookExport({ persons, relationships, familyName = "Gia Phả Dòng Họ" }: Props) {
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [rootPersonId, setRootPersonId] = useState<string>("");
  const [maxDepth, setMaxDepth] = useState<number>(99);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");

      // Filter persons by branch if a root is selected
      let filteredPersons = persons;
      if (rootPersonId) {
        const subtreeIds = getSubtreeIds(rootPersonId, relationships, maxDepth);
        filteredPersons = persons.filter((p) => subtreeIds.has(p.id));
      } else if (maxDepth < 99) {
        // Only depth limit, no root — filter by generation
        const rootGen = Math.min(...persons.map((p) => p.generation ?? 0).filter(Boolean));
        filteredPersons = persons.filter((p) => (p.generation ?? rootGen) <= rootGen + maxDepth);
      }

      const filteredRelationships = relationships.filter(
        (r) =>
          filteredPersons.some((p) => p.id === r.person_a) &&
          filteredPersons.some((p) => p.id === r.person_b),
      );

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = 0;

      // ── Cover page ────────────────────────────────────────────────────
      doc.setFillColor(245, 240, 230);
      doc.rect(0, 0, pageW, pageH, "F");

      // Decorative border
      doc.setDrawColor(180, 140, 80);
      doc.setLineWidth(0.8);
      doc.rect(10, 10, pageW - 20, pageH - 20);
      doc.setLineWidth(0.3);
      doc.rect(13, 13, pageW - 26, pageH - 26);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(100, 70, 20);
      doc.text(familyName, pageW / 2, 80, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 90, 40);
      doc.text("Ho So Gia Dinh", pageW / 2, 96, { align: "center" });

      // Stats summary on cover
      const totalLiving = filteredPersons.filter((p) => !p.is_deceased).length;
      const totalDeceased = filteredPersons.filter((p) => p.is_deceased).length;
      const generations = new Set(filteredPersons.map((p) => p.generation).filter(Boolean));

      doc.setFontSize(11);
      doc.setTextColor(80, 60, 30);
      const stats = [
        `Tong so thanh vien: ${filteredPersons.length}`,
        `Con song: ${totalLiving}  |  Da mat: ${totalDeceased}`,
        `So the he: ${generations.size}`,
        `So moi quan he: ${filteredRelationships.length}`,
      ];
      stats.forEach((line, i) => {
        doc.text(line, pageW / 2, 140 + i * 10, { align: "center" });
      });

      doc.setFontSize(10);
      doc.setTextColor(140, 110, 60);
      doc.text(`Xuat ngay: ${new Date().toLocaleDateString("vi-VN")}`, pageW / 2, pageH - 30, { align: "center" });
      doc.text("Tao boi Giapha-OS  |  giapha-os-rose.vercel.app", pageW / 2, pageH - 22, { align: "center" });

      // ── Member list pages ─────────────────────────────────────────────
      doc.addPage();

      // Group members by generation
      const byGeneration = new Map<number, Person[]>();
      const noGen: Person[] = [];
      filteredPersons.forEach((p) => {
        if (p.generation != null) {
          const arr = byGeneration.get(p.generation) ?? [];
          arr.push(p);
          byGeneration.set(p.generation, arr);
        } else {
          noGen.push(p);
        }
      });
      const sortedGens = Array.from(byGeneration.keys()).sort((a, b) => a - b);
      if (noGen.length > 0) sortedGens.push(-1);

      const addPageHeader = (title: string) => {
        doc.setFillColor(180, 140, 80);
        doc.rect(margin, 15, contentW, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 4, 21);
        return 30;
      };

      const addTableHeader = (yPos: number) => {
        doc.setFillColor(245, 235, 210);
        doc.rect(margin, yPos - 4, contentW, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(80, 60, 20);
        doc.text("Ho va ten", margin + 2, yPos);
        doc.text("Nam sinh", margin + 70, yPos);
        doc.text("Gioi tinh", margin + 95, yPos);
        doc.text("Tinh trang", margin + 120, yPos);
        doc.text("The he", margin + 155, yPos);
        return yPos + 5;
      };

      y = addPageHeader("DANH SACH THANH VIEN THEO THE HE");
      y = addTableHeader(y);

      let rowIndex = 0;
      for (const gen of sortedGens) {
        const members = gen === -1 ? noGen : (byGeneration.get(gen) ?? []);
        if (members.length === 0) continue;

        // Section header
        if (y > pageH - 40) {
          doc.addPage();
          y = addPageHeader("DANH SACH THANH VIEN THEO THE HE (tiep)");
          y = addTableHeader(y);
          rowIndex = 0;
        }

        doc.setFillColor(235, 220, 190);
        doc.rect(margin, y - 3, contentW, 6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(100, 70, 20);
        const genLabel = gen === -1 ? "Chua xac dinh the he" : `The he ${gen}  (${members.length} nguoi)`;
        doc.text(genLabel, margin + 2, y + 1);
        y += 8;

        // Member rows
        for (const p of members.sort((a, b) => (a.birth_year ?? 9999) - (b.birth_year ?? 9999))) {
          if (y > pageH - 25) {
            doc.addPage();
            y = addPageHeader("DANH SACH THANH VIEN (tiep)");
            y = addTableHeader(y);
            rowIndex = 0;
          }

          if (rowIndex % 2 === 0) {
            doc.setFillColor(252, 249, 244);
            doc.rect(margin, y - 3.5, contentW, 6.5, "F");
          }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(40, 30, 10);

          // Truncate long names
          const nameStr = p.full_name.length > 28 ? p.full_name.slice(0, 27) + "…" : p.full_name;
          doc.text(nameStr, margin + 2, y);
          doc.text(p.birth_year?.toString() ?? "—", margin + 70, y);
          doc.text(p.gender === "male" ? "Nam" : p.gender === "female" ? "Nu" : "—", margin + 95, y);
          doc.text(p.is_deceased ? "Da mat" : "Con song", margin + 120, y);
          doc.text(p.generation?.toString() ?? "—", margin + 155, y);

          y += 6.5;
          rowIndex++;
        }
        y += 2;
      }

      // ── Stats page ────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(245, 240, 230);
      doc.rect(0, 0, pageW, pageH, "F");

      doc.setFillColor(180, 140, 80);
      doc.rect(margin, 15, contentW, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("THONG KE TONG QUAN", margin + 4, 21);

      y = 38;
      const statItems = [
        ["Tong so thanh vien", String(filteredPersons.length)],
        ["Con song", String(totalLiving)],
        ["Da mat", String(totalDeceased)],
        ["So the he", String(generations.size)],
        ["So moi quan he", String(filteredRelationships.length)],
        ["Nam sinh som nhat", String(Math.min(...filteredPersons.map((p) => p.birth_year ?? 9999).filter((y) => y < 9999)) || "—")],
        ["Nam sinh muon nhat", String(Math.max(...filteredPersons.map((p) => p.birth_year ?? 0).filter((y) => y > 0)) || "—")],
      ];

      statItems.forEach(([label, value], i) => {
        if (i % 2 === 0) {
          doc.setFillColor(245, 235, 210);
          doc.rect(margin, y - 4, contentW, 9, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(60, 40, 10);
        doc.text(label, margin + 4, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 80, 20);
        doc.text(value, margin + 130, y);
        y += 11;
      });

      // Page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(160, 140, 100);
        doc.text(`Trang ${i} / ${totalPages}`, pageW - margin, pageH - 8, { align: "right" });
      }

      doc.save(`gia-pha-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Đã xảy ra lỗi khi xuất PDF. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Settings panel */}
      <div>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
        >
          <Settings2 className="size-3.5" />
          <span>Tuỳ chọn xuất</span>
          {showConfig ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>

        {showConfig && (
          <div className="mt-2 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Xuất từ người gốc (theo nhánh)
              </label>
              <select
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                value={rootPersonId}
                onChange={(e) => setRootPersonId(e.target.value)}
              >
                <option value="">— Toàn bộ dòng họ —</option>
                {persons
                  .slice()
                  .sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99) || a.full_name.localeCompare(b.full_name))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}{p.generation ? ` (Đ${p.generation})` : ""}
                      {p.birth_year ? ` — ${p.birth_year}` : ""}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Số đời xuất (tính từ người gốc)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                value={maxDepth === 99 ? "" : maxDepth}
                placeholder="Không giới hạn"
                onChange={(e) => setMaxDepth(e.target.value ? parseInt(e.target.value) : 99)}
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm w-fit"
        title="Xuất Sách Gia Phả PDF"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <BookOpen className="size-4" />
            <Download className="size-3" />
          </>
        )}
        <span>{loading ? "Đang xuất..." : "Xuất PDF Gia Phả"}</span>
      </button>
    </div>
  );
}
