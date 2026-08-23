export type ShopSettings = {
  business_id: string;

  shop_enabled?: boolean;

  accept_orders?: boolean;

  manual_confirmation?: boolean;
  automatic_confirmation?: boolean;

  allow_cancellation?: boolean;

  pickup_enabled?: boolean;
  delivery_enabled?: boolean;

  inventory_tracking_enabled?: boolean;

  low_stock_threshold?: number;

  allow_backorders?: boolean;

  show_stock?: boolean;
  show_product_reviews?: boolean;
  show_featured_products?: boolean;
};

export type ShopSettingsUpdate =
  Partial<
    Omit<
      ShopSettings,
      "business_id"
    >
  >;

export type OrderAcceptanceMode =
  | "manual"
  | "automatic";

export type FulfillmentMethod =
  | "pickup"
  | "delivery";

export type OutOfStockBehavior =
  | "hide"
  | "disable"
  | "allow_backorder";