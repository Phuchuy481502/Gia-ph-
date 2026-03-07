"use client";

import { DashboardProvider } from "@/components/DashboardContext";
import { Person, Relationship } from "@/types";
import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";

const FamilyTree = dynamic(() => import("@/components/FamilyTree"), {
  loading: () => (
    <div className="flex items-center justify-center h-64 text-stone-400">
      Đang tải sơ đồ...
    </div>
  ),
});

interface PublicTreeViewProps {
  persons: Person[];
  relationships: Relationship[];
}

function TreeInner({ persons, relationships }: PublicTreeViewProps) {
  const personsMap = useMemo(() => {
    const m = new Map<string, Person>();
    persons.forEach((p) => m.set(p.id, p));
    return m;
  }, [persons]);

  const roots = useMemo(() => {
    const childIds = new Set(
      relationships
        .filter((r) => r.type === "biological_child" || r.type === "adopted_child")
        .map((r) => r.person_b),
    );
    return persons.filter((p) => !childIds.has(p.id));
  }, [persons, relationships]);

  return (
    <FamilyTree
      personsMap={personsMap}
      relationships={relationships}
      roots={roots}
      canEdit={false}
    />
  );
}

export default function PublicTreeView({ persons, relationships }: PublicTreeViewProps) {
  return (
    <Suspense>
      <DashboardProvider>
        <TreeInner persons={persons} relationships={relationships} />
      </DashboardProvider>
    </Suspense>
  );
}
