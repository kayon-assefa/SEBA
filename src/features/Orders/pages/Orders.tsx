import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import AddOrderButton from "../components/AddOrderButton";
import ManualOrderModal from "../components/ManualOrderModal";
import EditOrderItemsModal from "../components/EditOrderItemsModal";
import OrderDrawer from "../components/OrderDrawer";
import OrderReceiptModal from "../components/OrderReceiptModal";
import OrderFilters from "../components/OrderFilters";
import OrderTable from "../components/OrderTable";
import OrderCardGrid from "../components/OrderCardGrid";
import OrderKanbanBoard from "../components/OrderKanbanBoard";
import ViewToggle from "../components/ViewToggle";
import BulkActionsBar from "../components/BulkActionsBar";

import { orderService } from "../services/orders.service";

import type {
  DateFilter,
  Order,
  OrderStatus as OrderStatusType,
  PaymentStatus,
  SortKey,
  ViewMode,
} from "../types/order";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatusType | "all">(
    "all"
  );
  const [paymentStatus, setPaymentStatus] = useState<
    PaymentStatus | "all"
  >("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const [view, setView] = useState<ViewMode>("table");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editItemsOpen, setEditItemsOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set()
  );
  const [newOrderId, setNewOrderId] = useState<string | null>(
    null
  );

  const [business, setBusiness] = useState({
    name: "My Shop",
    slug: "shop",
  });

  useEffect(() => {
    loadOrders();
    orderService
      .getBusinessInfo()
      .then(setBusiness)
      .catch(() => {});

    let unsubscribe: (() => void) | undefined;

    orderService
      .subscribeToOrders(() => loadOrders())
      .then((fn) => {
        unsubscribe = fn;
      })
      .catch(() => {});

    function handleKeydown(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";

      if (event.key === "n" && !typing) {
        event.preventDefault();
        setManualModalOpen(true);
      }

      if (event.key === "/" && !typing) {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>(
            'input[placeholder^="Search orders"]'
          )
          ?.focus();
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      unsubscribe?.();
    };
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Orders load error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOrder(order: Order) {
    setSelectedOrder(order);
    setDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedOrder(null);
  }

  function handleCreatedOrder(order: Order) {
    setOrders((current) => [order, ...current]);
    setSelectedOrder(order);
    setNewOrderId(order.id);
    setTimeout(() => setNewOrderId(null), 1500);
    setReceiptOpen(true);
  }

  function handleOrderChange(updatedOrder: Order) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== updatedOrder.id) return order;

        const nextItems =
          updatedOrder.order_items &&
          updatedOrder.order_items.length > 0
            ? updatedOrder.order_items
            : (order.order_items ?? []);

        return { ...order, ...updatedOrder, order_items: nextItems };
      })
    );

    setSelectedOrder((current) => {
      if (current?.id !== updatedOrder.id) return current;

      const nextItems =
        updatedOrder.order_items &&
        updatedOrder.order_items.length > 0
          ? updatedOrder.order_items
          : (current.order_items ?? []);

      return { ...current, ...updatedOrder, order_items: nextItems };
    });
  }

  function handleDeleteOrder() {
    if (!selectedOrder) return;
    const deletedId = selectedOrder.id;
    setOrders((current) =>
      current.filter((order) => order.id !== deletedId)
    );
    handleCloseDrawer();
  }

  function handleToggleSelect(orderId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  }

  function handleToggleSelectAll(checked: boolean) {
    setSelectedIds(
      checked ? new Set(filteredOrders.map((o) => o.id)) : new Set()
    );
  }

  async function handleBulkStatus(newStatus: OrderStatusType) {
    try {
      await orderService.bulkUpdateStatus(
        Array.from(selectedIds),
        newStatus
      );
      toast.success("Orders updated");
      setSelectedIds(new Set());
      loadOrders();
    } catch (error) {
      console.error(error);
      toast.error("Bulk update failed");
    }
  }

  async function handleBulkDelete() {
    const confirmed = window.confirm(
      `Delete ${selectedIds.size} order(s)? This can't be undone.`
    );
    if (!confirmed) return;

    try {
      await orderService.bulkDelete(Array.from(selectedIds));
      toast.success("Orders deleted");
      setOrders((current) =>
        current.filter((o) => !selectedIds.has(o.id))
      );
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
      toast.error("Bulk delete failed");
    }
  }

  async function handleKanbanStatusChange(
    orderId: string,
    newStatus: OrderStatusType
  ) {
    setOrders((current) =>
      current.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      )
    );

    try {
      await orderService.updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error(error);
      toast.error("Failed to move order");
      loadOrders();
    }
  }

  function handleSortChange(key: "date" | "total") {
    if (key === "date") {
      setSort((current) =>
        current === "newest" ? "oldest" : "newest"
      );
    } else {
      setSort((current) =>
        current === "total_high" ? "total_low" : "total_high"
      );
    }
  }

  const filteredOrders = useMemo(() => {
    const now = new Date();

    const list = orders.filter((order) => {
      const query = search.trim().toLowerCase();

      if (query) {
        const orderNumber = (
          order.order_number ?? order.id
        ).toLowerCase();
        const customer = order.customer_name.toLowerCase();
        const phone = order.customer_phone.toLowerCase();
        const products = (order.order_items ?? [])
          .map((item) => item.product_name.toLowerCase())
          .join(" ");

        const matches =
          orderNumber.includes(query) ||
          customer.includes(query) ||
          phone.includes(query) ||
          products.includes(query);

        if (!matches) return false;
      }

      if (status !== "all" && order.status !== status) {
        return false;
      }

      if (
        paymentStatus !== "all" &&
        order.payment_status !== paymentStatus
      ) {
        return false;
      }

      if (dateFilter !== "all") {
        const orderDate = new Date(order.created_at);

        if (dateFilter === "today") {
          if (orderDate.toDateString() !== now.toDateString()) {
            return false;
          }
        }

        if (dateFilter === "week") {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (orderDate < sevenDaysAgo) return false;
        }

        if (dateFilter === "month") {
          const sameMonth =
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear();
          if (!sameMonth) return false;
        }

        if (dateFilter === "custom") {
          if (customFrom && orderDate < new Date(customFrom)) {
            return false;
          }
          if (customTo && orderDate > new Date(customTo)) {
            return false;
          }
        }
      }

      const orderTotal = (order.order_items ?? []).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (minTotal && orderTotal < Number(minTotal)) return false;
      if (maxTotal && orderTotal > Number(maxTotal)) return false;

      return true;
    });

    const sorted = [...list].sort((a, b) => {
      const totalA = (a.order_items ?? []).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const totalB = (b.order_items ?? []).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      switch (sort) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        case "total_high":
          return totalB - totalA;
        case "total_low":
          return totalA - totalB;
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });

    return sorted;
  }, [
    orders,
    search,
    status,
    paymentStatus,
    dateFilter,
    customFrom,
    customTo,
    minTotal,
    maxTotal,
    sort,
  ]);

  const customerOrderCount = useMemo(() => {
    if (!selectedOrder) return undefined;
    return orders.filter(
      (o) => o.customer_phone === selectedOrder.customer_phone
    ).length;
  }, [orders, selectedOrder]);

  const summary = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing")
        .length,
      completed: orders.filter((o) => o.status === "completed")
        .length,
      cancelled: orders.filter((o) => o.status === "cancelled")
        .length,
    };
  }, [orders]);

  return (
    <div className="min-h-screen space-y-6 bg-[#FBF7F0] p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage orders from your SEBA shop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle value={view} onChange={setView} />
          <AddOrderButton onClick={() => setManualModalOpen(true)} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryCard label="All Orders" value={summary.all} />
        <SummaryCard label="Pending" value={summary.pending} />
        <SummaryCard label="Processing" value={summary.processing} />
        <SummaryCard label="Completed" value={summary.completed} />
        <SummaryCard label="Cancelled" value={summary.cancelled} />
      </div>

      {/* Filters */}
      <OrderFilters
        search={search}
        status={status}
        paymentStatus={paymentStatus}
        dateFilter={dateFilter}
        customFrom={customFrom}
        customTo={customTo}
        minTotal={minTotal}
        maxTotal={maxTotal}
        sort={sort}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPaymentStatusChange={setPaymentStatus}
        onDateChange={setDateFilter}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onMinTotalChange={setMinTotal}
        onMaxTotalChange={setMaxTotal}
        onSortChange={setSort}
        onClearAll={() => {
          setStatus("all");
          setPaymentStatus("all");
          setDateFilter("all");
          setMinTotal("");
          setMaxTotal("");
        }}
      />

      <BulkActionsBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onBulkStatus={handleBulkStatus}
        onBulkDelete={handleBulkDelete}
      />

      {/* Content */}
      {loading ? (
        view === "table" ? (
          <OrderTable
            orders={[]}
            loading
            selectedIds={selectedIds}
            onSelect={() => {}}
            onToggleSelect={() => {}}
            onToggleSelectAll={() => {}}
            onSortChange={() => {}}
          />
        ) : (
          <div className="flex min-h-75 items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <p className="text-sm text-gray-500">
              Loading orders...
            </p>
          </div>
        )
      ) : view === "table" ? (
        <OrderTable
          orders={filteredOrders}
          selectedIds={selectedIds}
          newOrderId={newOrderId}
          onSelect={handleSelectOrder}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onSortChange={handleSortChange}
        />
      ) : view === "cards" ? (
        <OrderCardGrid
          orders={filteredOrders}
          onSelect={handleSelectOrder}
        />
      ) : (
        <OrderKanbanBoard
          orders={filteredOrders}
          onSelect={handleSelectOrder}
          onStatusChange={handleKanbanStatusChange}
        />
      )}

      {/* Drawer */}
      <OrderDrawer
        order={selectedOrder}
        open={drawerOpen}
        customerOrderCount={customerOrderCount}
        onClose={handleCloseDrawer}
        onOrderUpdated={handleOrderChange}
        onOrderDeleted={handleDeleteOrder}
        onViewReceipt={() => setReceiptOpen(true)}
        onDuplicated={handleCreatedOrder}
        onEditItems={() => setEditItemsOpen(true)}
      />

      {/* Receipt */}
      <OrderReceiptModal
        order={selectedOrder}
        open={receiptOpen}
        businessName={business.name}
        businessSlug={business.slug}
        onClose={() => setReceiptOpen(false)}
      />

      {/* Edit items */}
      <EditOrderItemsModal
        order={selectedOrder}
        open={editItemsOpen}
        onClose={() => setEditItemsOpen(false)}
        onSaved={handleOrderChange}
      />

      {/* Manual order */}
      <ManualOrderModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onCreated={handleCreatedOrder}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
