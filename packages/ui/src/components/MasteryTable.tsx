"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Badge } from "./Badge";
import type { LearnerState, AchievedVia } from "./types";

interface MasteryRow {
  conceptSlug: string;
  conceptTitle: string;
  state: LearnerState;
  achievedVia: AchievedVia | null;
  bestRuntimeMs: number | null;
  runCount: number;
}

interface MasteryTableProps {
  rows: MasteryRow[];
}

type SortKey = "title" | "state" | "achievedVia" | "bestRuntime";

export function MasteryTable({ rows }: MasteryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "title") cmp = a.conceptTitle.localeCompare(b.conceptTitle);
    else if (sortKey === "state") cmp = a.state.localeCompare(b.state);
    else if (sortKey === "achievedVia") cmp = (a.achievedVia ?? "").localeCompare(b.achievedVia ?? "");
    else if (sortKey === "bestRuntime")
      cmp = (a.bestRuntimeMs ?? Infinity) - (b.bestRuntimeMs ?? Infinity);
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
          {(
            [
              ["title", "Concept"],
              ["state", "Status"],
              ["achievedVia", "How achieved"],
              ["bestRuntime", "Best runtime"],
            ] as [SortKey, string][]
          ).map(([key, label]) => (
            <th
              key={key}
              className="py-2 pr-4 text-left font-medium cursor-pointer hover:text-[var(--color-text-primary)]"
              onClick={() => toggleSort(key)}
            >
              {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr
            key={row.conceptSlug}
            className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-primary)]"
          >
            <td className="py-3 pr-4 font-medium">{row.conceptTitle}</td>
            <td className="py-3 pr-4">
              <Badge variant={row.state}>{row.state}</Badge>
            </td>
            <td className="py-3 pr-4 text-[var(--color-text-secondary)]">
              {row.achievedVia ? row.achievedVia.replace("_", " ") : "—"}
            </td>
            <td className="py-3 pr-4 font-mono text-[var(--color-text-secondary)]">
              {row.bestRuntimeMs != null ? `${row.bestRuntimeMs}ms` : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
