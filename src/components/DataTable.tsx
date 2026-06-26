"use client";

import type { ReactNode } from "react";
import { cx, EmptyState } from "./ui";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyMessage = "데이터가 없습니다.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
            {columns.map((c, i) => (
              <th
                key={i}
                className={cx("whitespace-nowrap px-3 py-2 font-medium", c.headerClassName)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cx(
                "border-b border-gray-100 hover:bg-blue-50/40",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((c, i) => (
                <td
                  key={i}
                  className={cx("whitespace-nowrap px-3 py-2 align-middle", c.className)}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
