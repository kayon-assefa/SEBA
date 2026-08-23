export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type DeliveryType = "pickup" | "delivery";

export type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock_quantity?: number | null;
  track_stock?: boolean;
  in_stock?: boolean;
};

export type CreateOrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
};

export type StatusHistoryEntry = {
  status: OrderStatus;
  changed_at: string;
  changed_by?: string | null;
};

export type Order = {
  id: string;
  order_number?: string | null;

  business_id: string;

  customer_name: string;
  customer_phone: string;

  status: OrderStatus;
  payment_status: PaymentStatus;

  notes?: string | null;

  total?: number | null;

  delivery_type?: DeliveryType | null;
  delivery_address?: string | null;
  scheduled_at?: string | null;
  estimated_ready_at?: string | null;

  discount?: number | null;
  tax?: number | null;
  amount_paid?: number | null;

  telegram_chat_id?: string | null;
  status_history?: StatusHistoryEntry[] | null;

  created_at: string;
  updated_at?: string | null;

  order_items?: OrderItem[];
};

export type CreateOrderInput = {
  customer_name: string;
  customer_phone: string;

  payment_status: PaymentStatus;

  notes?: string;

  delivery_type?: DeliveryType;
  delivery_address?: string;
  scheduled_at?: string | null;
  estimated_ready_at?: string | null;

  discount?: number;
  tax?: number;
  amount_paid?: number;

  items: CreateOrderItem[];
};

export type SortKey =
  | "newest"
  | "oldest"
  | "total_high"
  | "total_low";

export type DateFilter =
  | "all"
  | "today"
  | "week"
  | "month"
  | "custom";

export type ViewMode = "table" | "kanban" | "cards";
