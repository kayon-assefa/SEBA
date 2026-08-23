export type ExportTable =
  | "customers"
  | "appointments"
  | "orders"
  | "products";

export type ExportFormat =
  | "csv"
  | "json";

export type DataExportResult = {
  table: ExportTable;
  format: ExportFormat;
  filename: string;
  rowCount: number;
  data: unknown[];
};

export type AllBusinessData = {
  customers: unknown[];
  appointments: unknown[];
  orders: unknown[];
  products: unknown[];
};