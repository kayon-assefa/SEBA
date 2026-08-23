import type { Product } from "../types/product";

const EXPORT_COLUMNS: Array<{ key: keyof Product; label: string }> = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "sku", label: "SKU" },
  { key: "barcode", label: "Barcode" },
  { key: "price", label: "Price" },
  { key: "cost_price", label: "Cost Price" },
  { key: "stock", label: "Stock" },
  { key: "unit", label: "Unit" },
  { key: "status", label: "Status" },
  { key: "currency", label: "Currency" },
];

function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);

  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Feature #28 - CSV export. Fully working: builds a CSV in-memory and
 * triggers a browser download, no server round trip needed.
 */
export function exportProductsToCsv(products: Product[], filename = "products.csv") {
  const header = EXPORT_COLUMNS.map((c) => c.label).join(",");

  const rows = products.map((product) =>
    EXPORT_COLUMNS.map((c) => escapeCsvValue(product[c.key])).join(",")
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Feature #27 - CSV import. Marked "Coming soon" per your request -
 * this is intentionally a stub, not wired into the UI. Left here so the
 * real implementation is a small follow-up (parse with a CSV lib,
 * validate rows against ProductForm, batch-insert via productService).
 */
export function importProductsFromCsv(_file: File): Promise<never> {
  return Promise.reject(
    new Error("CSV import is coming soon and is not yet implemented.")
  );
}
