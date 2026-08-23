import { useState } from "react";

import { dataSettingsService } from "../services/data-settings.service";

type ExportType =
  | "customers"
  | "appointments"
  | "orders"
  | "products";

export function useDataSettings() {
  const [exporting, setExporting] =
    useState<ExportType | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function exportData(
    type: ExportType
  ) {
    try {
      setExporting(type);
      setError(null);

      const rows = await dataSettingsService.exportTable(type);
      const headers = Array.from(
        new Set(rows.flatMap((row) => Object.keys(row))),
      );
      const escape = (value: unknown) =>
        `"${String(value ?? "").replaceAll('"', '""')}"`;
      const csv = [
        headers.join(","),
        ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

      const url =
        window.URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = `${type}.csv`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to export data";

      setError(message);
      throw new Error(message);
    } finally {
      setExporting(null);
    }
  }

  return {
    exporting,
    error,
    exportData,
  };
}
