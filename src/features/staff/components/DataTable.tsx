import React, { useMemo, useState } from "react";
import { EmptyState, SkeletonRows } from "./UIKit";
import { Icon } from "./Icons";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
};

export function DataTable<T extends { id: string }>({
  columns, rows, loading, onRowClick, pageSize = 8, emptyTitle = "Nothing here yet", emptySubtitle,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptySubtitle?: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find(c => c.key === sortKey);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a), bv = col.sortValue!(b);
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  }

  if (loading) return <div className="ss-card ss-card-pad"><SkeletonRows rows={5} /></div>;
  if (!rows.length) return <div className="ss-card ss-card-pad"><EmptyState title={emptyTitle} subtitle={emptySubtitle} /></div>;

  return (
    <div className="ss-card">
      <div className="ss-table-wrap scrollbar">
        <table className="ss-table">
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} style={{ width: c.width }} onClick={() => c.sortValue && toggleSort(c.key)}>
                  {c.header}{sortKey === c.key ? (sortDir === 1 ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
              <tr key={row.id} onClick={() => onRowClick?.(row)}>
                {columns.map(c => <td key={c.key}>{c.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            Page {page + 1} of {totalPages} · {rows.length} total
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="ss-btn ss-btn-secondary ss-btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <Icon.ChevronLeft size={14} />
            </button>
            <button className="ss-btn ss-btn-secondary ss-btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <Icon.ChevronLeft size={14} style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
