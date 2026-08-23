export type UserRole = "owner" | "staff";

export type StockHistoryEntry = {
  id: string;
  product_id: string;
  change: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  created_at: string;
};

export type ActivityLogEntry = {
  id: string;
  product_id: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "archived"
    | "restored"
    | "approved"
    | "rejected";
  actor_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  product_id: string | null;
  is_read: boolean;
  created_at: string;
};
