import { useEffect, useMemo, useState } from "react";
import { useStaff } from "../context/StaffContext";
import { useToast } from "../context/ToastContext";
import { getOrders, updateOrder, friendlyDbError } from "../services/staffData";
import { useRealtime } from "../hooks/useRealtime";
import { DataTable } from "../components/DataTable";
import type { Column } from "../components/DataTable";
import { StatusPill, FilterChips, StatCard } from "../components/UIKit";
import { Modal } from "../components/Modal";
import { AddOrderModal } from "../components/AddEntityModals";
import { Icon } from "../components/Icons";
import { useLanguage } from "../i18n";
import { formatDateTime, formatCurrency } from "../utils/format";
import type { Order, OrderStatus, PaymentStatus } from "../types";

/** Exact match to features/Orders/types/order.ts — see UIKit.tsx StatusPill comment. */
const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "ready", "completed", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export default function StaffOrders() {
  const { staff } = useStaff();
  const toast = useToast();
  const { t } = useLanguage();
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [view, setView] = useState<"table" | "board">("table");
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    if (!staff) return;
    try { setRows(await getOrders(staff.business_id)); }
    catch (e: any) { toast.show(friendlyDbError(e, "Couldn't load orders."), "error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [staff?.id]); // eslint-disable-line
  useRealtime(["orders"], staff?.business_id, load);

  const filtered = useMemo(() => {
    let r = rows;
    if (statusFilter.length) r = r.filter(o => statusFilter.includes(String(o.status).toLowerCase()));
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter(o => o.customer_name?.toLowerCase().includes(s) || o.customer_phone?.includes(s));
    }
    return r;
  }, [rows, statusFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of ORDER_STATUSES) c[s] = rows.filter(o => String(o.status).toLowerCase() === s).length;
    return c;
  }, [rows]);

  const STATUS_OPTIONS = ORDER_STATUSES.map(s => ({ value: s, label: t(`status.${s}`) }));

  const columns: Column<Order>[] = [
    { key: "customer", header: t("common.customer"), sortValue: o => o.customer_name || "", render: o => <b>{o.customer_name || t("common.customer")}</b> },
    { key: "phone", header: t("common.phone"), render: o => o.customer_phone || "—" },
    { key: "total", header: t("common.total"), sortValue: o => o.total_amount || 0, render: o => formatCurrency(o.total_amount) },
    { key: "status", header: t("common.status"), sortValue: o => o.status || "", render: o => <StatusPill status={o.status} /> },
    { key: "payment", header: t("common.payment"), sortValue: o => o.payment_status || "", render: o => <StatusPill status={o.payment_status} /> },
    { key: "created", header: t("common.placed"), sortValue: o => o.created_at, render: o => formatDateTime(o.created_at) },
  ];

  return (
    <div>
      <div className="ss-row-between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div><h1 className="ss-h1">{t("orders.title")}</h1><p className="ss-sub">{filtered.length} {t("common.shown")}</p></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input className="ss-input" placeholder={t("orders.searchPlaceholder")} style={{ maxWidth: 220 }} value={search} onChange={e => setSearch(e.target.value)} />
          <div className="ss-view-toggle">
            <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><Icon.Rows size={14} />{t("common.table")}</button>
            <button className={view === "board" ? "active" : ""} onClick={() => setView("board")}><Icon.Columns size={14} />{t("common.board")}</button>
          </div>
          <button className="ss-btn ss-btn-primary" onClick={() => setShowAdd(true)}><Icon.Plus size={15} />{t("orders.addOrder")}</button>
        </div>
      </div>

      <div className="ss-stats-grid" style={{ marginBottom: 18 }}>
        <StatCard label={t("orders.allOrders")} value={counts.all} icon={<Icon.Bag size={18} />} tint="coral" />
        <StatCard label={t("status.pending")} value={counts.pending} icon={<Icon.Clock size={18} />} tint="gold" />
        <StatCard label={t("status.processing")} value={counts.processing} icon={<Icon.RefreshCw size={18} />} tint="info" />
        <StatCard label={t("status.completed")} value={counts.completed} icon={<Icon.CheckCircle size={18} />} tint="deepred" />
        <StatCard label={t("status.cancelled")} value={counts.cancelled} icon={<Icon.XCircle size={18} />} tint="info" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <FilterChips value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
      </div>

      {view === "table" ? (
        <DataTable columns={columns} rows={filtered} loading={loading} onRowClick={(row: Order) => setDetail(row)} pageSize={9}
          emptyTitle={t("orders.noMatch")} emptySubtitle={t("appointments.tryClearingFilters")} />
      ) : (
        <div className="ss-board">
          {ORDER_STATUSES.map(s => (
            <div key={s} className="ss-board-col">
              <div className="ss-board-col-title"><span>{t(`status.${s}`)}</span><span>{filtered.filter(o => String(o.status).toLowerCase() === s).length}</span></div>
              {filtered.filter(o => String(o.status).toLowerCase() === s).map(o => (
                <div key={o.id} className="ss-board-card" onClick={() => setDetail(o)}>
                  <div className="name">{o.customer_name || t("common.customer")}</div>
                  <div className="meta">{formatCurrency(o.total_amount)} · {formatDateTime(o.created_at)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {detail && (
        <OrderDetailModal order={detail} statusOptions={STATUS_OPTIONS} onClose={() => setDetail(null)} onSaved={() => { setDetail(null); load(); }} />
      )}
      {showAdd && staff && (
        <AddOrderModal businessId={staff.business_id} onClose={() => setShowAdd(false)} onCreated={load} />
      )}

      {/* Mirrors the header button on phone-size screens, where a header
          button can scroll out of view — this one stays reachable. */}
      <div className="ss-mobile-add-bar">
        <button className="ss-btn ss-btn-primary" onClick={() => setShowAdd(true)}><Icon.Plus size={15} />{t("orders.addOrder")}</button>
      </div>
    </div>
  );
}

function OrderDetailModal({
  order, statusOptions, onClose, onSaved,
}: { order: Order; statusOptions: { value: string; label: string }[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const { t } = useLanguage();
  const [status, setStatus] = useState(order.status);
  const [payment, setPayment] = useState(order.payment_status);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateOrder(order.id, { status, payment_status: payment });
      toast.show("Order updated.", "success");
      onSaved();
    } catch (e: any) { toast.show(friendlyDbError(e, "Couldn't update order."), "error"); }
    finally { setSaving(false); }
  }

  return (
    <Modal
      title={`${t("orders.orderDetail")} — ${order.customer_name || t("common.customer")}`} onClose={onClose}
      footer={<>
        <button className="ss-btn ss-btn-secondary" onClick={onClose}>{t("common.close")}</button>
        <button className="ss-btn ss-btn-primary" disabled={saving} onClick={save}>{saving ? t("common.saving") : t("common.saveChanges")}</button>
      </>}
    >
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
        {t("common.placed")} {formatDateTime(order.created_at)} {order.customer_phone ? `· ${order.customer_phone}` : ""}
      </div>

      {order.items?.length ? (
        <div style={{ marginBottom: 16 }}>
          {order.items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span>{it.qty}× {it.name}</span><span>{formatCurrency(it.price * it.qty)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, paddingTop: 8 }}>
            <span>{t("common.total")}</span><span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 12.5, color: "var(--text-faint)", marginBottom: 16 }}>{t("orders.noItemsYet")}</p>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <div className="ss-field" style={{ flex: 1 }}><label>{t("common.status")}</label>
          <select className="ss-select" value={status} onChange={e => setStatus(e.target.value)}>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="ss-field" style={{ flex: 1 }}><label>{t("common.payment")}</label>
          <select className="ss-select" value={payment} onChange={e => setPayment(e.target.value)}>
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </select>
        </div>
      </div>

      {order.notes && (
        <div style={{ marginTop: 4, fontSize: 13, color: "var(--text-muted)" }}><b>{t("common.notes")}:</b> {order.notes}</div>
      )}
    </Modal>
  );
}
