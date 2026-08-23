import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";
import type {
  CreateOrderInput,
  Order,
  OrderStatus,
  PaymentStatus,
  ProductOption,
} from "../types/order";

async function getBusinessId(): Promise<string> {
  return getActiveBusinessId();
}

const ORDER_SELECT = `
  *,
  order_items (
    id,
    product_id,
    product_name,
    quantity,
    price
  )
`;

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get orders database error:", error);
      throw new Error(error.message);
    }

    return (data ?? []) as Order[];
  },

  /**
   * Returns the current business's display name + URL slug, used to
   * build the receipt QR link (seba.com/{slug}/order/{id}) and the
   * receipt header. Falls back gracefully if the businesses table
   * doesn't have a `slug` column yet — run the SQL migration in
   * /sql/migration.sql to add it.
   */
  async getBusinessInfo(): Promise<{
    name: string;
    slug: string;
  }> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("businesses")
      .select("name, slug")
      .eq("id", businessId)
      .single();

    if (error || !data) {
      return { name: "My Shop", slug: businessId.slice(0, 8) };
    }

    return {
      name: data.name ?? "My Shop",
      slug: data.slug ?? businessId.slice(0, 8),
    };
  },

  async getProducts(): Promise<ProductOption[]> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, track_stock")
      .eq("business_id", businessId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Get products database error:", error);
      throw new Error(error.message);
    }

    return (data ?? []).map((product: any) => {
      const trackStock = Boolean(product.track_stock);
      const stockQuantity =
        product.stock_quantity === null ||
        product.stock_quantity === undefined
          ? null
          : Number(product.stock_quantity);

      const inStock = trackStock
        ? (stockQuantity ?? 0) > 0
        : true;

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price ?? 0),
        stock_quantity: stockQuantity,
        track_stock: trackStock,
        in_stock: inStock,
      };
    });
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const businessId = await getBusinessId();

    if (!input.items.length) {
      throw new Error(
        "An order must contain at least one product."
      );
    }

    /*
     * IMPORTANT: `total` is intentionally not sent — it is derived
     * from order_items on the client. The `orders` table does not
     * have a `total` column.
     */

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        business_id: businessId,
        customer_name: input.customer_name.trim(),
        customer_phone: input.customer_phone.trim(),
        status: "pending",
        payment_status: input.payment_status,
        notes: input.notes?.trim() || null,
        delivery_type: input.delivery_type ?? "pickup",
        delivery_address: input.delivery_address?.trim() || null,
        scheduled_at: input.scheduled_at || null,
        estimated_ready_at: input.estimated_ready_at || null,
        discount: input.discount ?? 0,
        tax: input.tax ?? 0,
        amount_paid: input.amount_paid ?? 0,
        status_history: [
          { status: "pending", changed_at: new Date().toISOString() },
        ],
      })
      .select("*")
      .single();

    if (orderError) {
      console.error("Create order database error:", orderError);
      throw new Error(orderError.message);
    }

    if (!order) {
      throw new Error(
        "Order was created but no order was returned."
      );
    }

    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    const { data: createdItems, error: itemsError } =
      await supabase
        .from("order_items")
        .insert(orderItems)
        .select(`id, product_id, product_name, quantity, price`);

    if (itemsError) {
      console.error(
        "Create order items database error:",
        itemsError
      );

      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error(itemsError.message);
    }

    return {
      ...(order as Order),
      order_items: ((createdItems ?? []) as any[]).map(
        (item) => ({ ...item, order_id: order.id })
      ),
    } as Order;
  },

  async duplicateOrder(orderId: string): Promise<Order> {
    const businessId = await getBusinessId();

    const { data: source, error: sourceError } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", orderId)
      .eq("business_id", businessId)
      .single();

    if (sourceError || !source) {
      throw new Error(
        sourceError?.message ?? "Order not found."
      );
    }

    return this.createOrder({
      customer_name: source.customer_name,
      customer_phone: source.customer_phone,
      payment_status: "pending",
      notes: source.notes ?? undefined,
      delivery_type: source.delivery_type ?? "pickup",
      delivery_address: source.delivery_address ?? undefined,
      discount: source.discount ?? 0,
      tax: source.tax ?? 0,
      items: (source.order_items ?? []).map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  },

  async updateOrderItems(
    orderId: string,
    items: { product_id: string; product_name: string; quantity: number; price: number }[]
  ): Promise<Order> {
    const businessId = await getBusinessId();

    const { error: deleteError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (items.length > 0) {
      const { error: insertError } = await supabase
        .from("order_items")
        .insert(
          items.map((item) => ({
            order_id: orderId,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: Number(item.quantity),
            price: Number(item.price),
          }))
        );

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", orderId)
      .eq("business_id", businessId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Order;
  },

  async updateStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    return this.updateOrderStatus(orderId, status);
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    const businessId = await getBusinessId();

    const { data: existing } = await supabase
      .from("orders")
      .select("status_history")
      .eq("id", orderId)
      .single();

    const history = Array.isArray(existing?.status_history)
      ? existing.status_history
      : [];

    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        status_history: [
          ...history,
          { status, changed_at: new Date().toISOString() },
        ],
      })
      .eq("id", orderId)
      .eq("business_id", businessId)
      .select(ORDER_SELECT)
      .single();

    if (error) {
      console.error("Update order status error:", error);
      throw new Error(error.message);
    }

    return data as Order;
  },

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<Order> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", orderId)
      .eq("business_id", businessId)
      .select(ORDER_SELECT)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Order;
  },

  async bulkUpdateStatus(
    orderIds: string[],
    status: OrderStatus
  ): Promise<void> {
    const businessId = await getBusinessId();

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .in("id", orderIds)
      .eq("business_id", businessId);

    if (error) {
      throw new Error(error.message);
    }
  },

  async bulkDelete(orderIds: string[]): Promise<void> {
    const businessId = await getBusinessId();

    await supabase.from("order_items").delete().in("order_id", orderIds);

    const { error } = await supabase
      .from("orders")
      .delete()
      .in("id", orderIds)
      .eq("business_id", businessId);

    if (error) {
      throw new Error(error.message);
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    const businessId = await getBusinessId();

    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)
      .eq("business_id", businessId);

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Subscribes to realtime order changes for the active business.
   * Call the returned function to unsubscribe (e.g. in a useEffect cleanup).
   */
  async subscribeToOrders(
    onChange: () => void
  ): Promise<() => void> {
    const businessId = await getBusinessId();

    const channel = supabase
      .channel(`orders-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `business_id=eq.${businessId}`,
        },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
