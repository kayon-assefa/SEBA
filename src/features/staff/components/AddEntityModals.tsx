import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Icon } from "./Icons";
import { useLanguage } from "../i18n";
import {
  createAppointment, createOrder, createCustomer, getBookableStaff, getBookableServices,
  getOrderableProducts, getCustomers, suggestCustomersByPhone, friendlyDbError,
  type BookableStaff, type BookableService, type BookableProduct,
} from "../services/staffData";
import { useToast } from "../context/ToastContext";
import { todayISO, formatCurrency } from "../utils/format";
import { toEthiopian } from "../utils/ethiopianCalendar";
import type { Customer } from "../types";

/** Phone field with a live autosuggest dropdown pulled from the customer list —
 *  picking a suggestion fills in the customer's saved name too. */
function PhoneAutosuggest({
  phone, setPhone, customers, onPick,
}: { phone: string; setPhone: (v: string) => void; customers: Customer[]; onPick?: (c: Customer) => void }) {
  const [open, setOpen] = useState(false);
  const matches = suggestCustomersByPhone(customers, phone);

  return (
    <div style={{ position: "relative" }}>
      <input
        className="ss-input" value={phone} placeholder="+251…"
        onChange={e => { setPhone(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && matches.length > 0 && (
        <div className="ss-dropdown" style={{ position: "absolute", top: "100%", left: 0, right: 0, width: "auto" }}>
          {matches.map(c => (
            <button
              key={c.id} className="ss-btn ss-btn-ghost"
              style={{ width: "100%", justifyContent: "flex-start", gap: 8, padding: "10px 14px" }}
              onMouseDown={() => { setPhone(c.phone || ""); onPick?.(c); setOpen(false); }}
            >
              <Icon.Users size={14} />
              <span><b>{c.name}</b> <span style={{ color: "var(--text-muted)" }}>{c.phone}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EthiopianDateHint({ isoDate }: { isoDate: string }) {
  if (!isoDate) return null;
  try {
    const eth = toEthiopian(isoDate);
    return <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>Ethiopian: {eth.day} {eth.monthName} {eth.year}</div>;
  } catch { return null; }
}

const TIME_SLOTS = Array.from({ length: 24 * 2 }).map((_, i) => {
  const totalMin = i * 30;
  const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
});

export function AddAppointmentModal({
  onClose, businessId, onCreated,
}: { onClose: () => void; businessId: string; onCreated: () => void }) {
  const { t } = useLanguage();
  const toast = useToast();
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("09:00");
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [services, setServices] = useState<BookableService[]>([]);
  const [staffList, setStaffList] = useState<BookableStaff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.allSettled([
          getBookableServices(businessId), getBookableStaff(businessId), getCustomers(businessId),
        ]);
        const [servicesResult, staffResult, customersResult] = results;
        if (servicesResult.status === "fulfilled") setServices(servicesResult.value);
        if (staffResult.status === "fulfilled") setStaffList(staffResult.value);
        if (customersResult.status === "fulfilled") setCustomers(customersResult.value);
        const failed = results.find(result => result.status === "rejected");
        if (failed?.status === "rejected") {
          toast.show(friendlyDbError(failed.reason, "Some booking options could not be loaded."), "error");
        }
      } catch (e: any) {
        toast.show(friendlyDbError(e, "Couldn't load booking options."), "error");
      } finally { setLoadingOptions(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const valid = customer.trim() && serviceId && staffId;
  const selectedService = services.find(s => s.id === serviceId);
  const selectedStaff = staffList.find(s => s.id === staffId);

  async function submit() {
    if (!valid || !selectedService || !selectedStaff) return;
    setSaving(true);
    try {
      await createAppointment(businessId, {
        customer: customer.trim(), phone: phone.trim(),
        serviceId: selectedService.id, serviceName: selectedService.name,
        staffId: selectedStaff.id, staffName: selectedStaff.name,
        date, time,
      });
      toast.show("Appointment added.", "success");
      onCreated();
      onClose();
    } catch (e: any) {
      toast.show(friendlyDbError(e, "Couldn't add appointment."), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={t("appointments.addAppointment")} onClose={onClose}
      footer={<>
        <button className="ss-btn ss-btn-secondary" onClick={onClose}>{t("common.cancel")}</button>
        <button className="ss-btn ss-btn-primary" disabled={saving || !valid} onClick={submit}>
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </>}
    >
      <div className="ss-field"><label>{t("common.customer")}</label>
        <input className="ss-input" value={customer} onChange={e => setCustomer(e.target.value)} autoFocus />
      </div>
      <div className="ss-field"><label>{t("common.phone")}</label>
        <PhoneAutosuggest phone={phone} setPhone={setPhone} customers={customers} onPick={c => setCustomer(c.name)} />
      </div>

      <div className="ss-field"><label>{t("common.service")}</label>
        {loadingOptions ? (
          <div className="ss-input" style={{ color: "var(--text-faint)" }}>{t("common.loading")}</div>
        ) : services.length === 0 ? (
          <div className="ss-input" style={{ color: "var(--danger)" }}>No services available — add one from the owner app first.</div>
        ) : (
          <select className="ss-select" value={serviceId} onChange={e => setServiceId(e.target.value)}>
            <option value="" disabled>Select a service…</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}{s.price != null ? ` — ${formatCurrency(s.price)}` : ""}</option>
            ))}
          </select>
        )}
      </div>

      <div className="ss-field"><label>{t("common.staff")}</label>
        {loadingOptions ? (
          <div className="ss-input" style={{ color: "var(--text-faint)" }}>{t("common.loading")}</div>
        ) : staffList.length === 0 ? (
          <div className="ss-input" style={{ color: "var(--danger)" }}>No staff available — add one from the owner app first.</div>
        ) : (
          <select className="ss-select" value={staffId} onChange={e => setStaffId(e.target.value)}>
            <option value="" disabled>Select staff…</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.name}{s.role ? ` — ${s.role}` : ""}</option>)}
          </select>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div className="ss-field" style={{ flex: 1 }}><label style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>{t("common.date")}</span><EthiopianDateHint isoDate={date} /></label>
          <input type="date" className="ss-input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="ss-field" style={{ flex: 1 }}><label>{t("common.time")}</label>
          <select className="ss-select" value={time} onChange={e => setTime(e.target.value)}>
            {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

export function AddOrderModal({
  onClose, businessId, onCreated,
}: { onClose: () => void; businessId: string; onCreated: () => void }) {
  const { t } = useLanguage();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [products, setProducts] = useState<BookableProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [pickedProductId, setPickedProductId] = useState("");
  const [pickedQty, setPickedQty] = useState(1);
  const [items, setItems] = useState<{ name: string; qty: number; price: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const valid = name.trim() && items.length > 0;

  useEffect(() => {
    (async () => {
      try {
        const [prod, cust] = await Promise.all([getOrderableProducts(businessId), getCustomers(businessId)]);
        setProducts(prod); setCustomers(cust);
      } catch (e: any) {
        toast.show(friendlyDbError(e, "Couldn't load products."), "error");
      } finally { setLoadingOptions(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  function addPickedItem() {
    const p = products.find(x => x.id === pickedProductId);
    if (!p) return;
    setItems(list => {
      const existing = list.find(it => it.name === p.name);
      if (existing) return list.map(it => (it.name === p.name ? { ...it, qty: it.qty + pickedQty } : it));
      return [...list, { name: p.name, qty: pickedQty, price: p.price || 0 }];
    });
    setPickedProductId(""); setPickedQty(1);
  }

  const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  async function submit() {
    if (!valid) return;
    setSaving(true);
    try {
      await createOrder(businessId, { customer_name: name.trim(), customer_phone: phone.trim() || undefined, items });
      toast.show("Order added.", "success");
      onCreated();
      onClose();
    } catch (e: any) {
      toast.show(friendlyDbError(e, "Couldn't add order."), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={t("orders.addOrder")} onClose={onClose}
      footer={<>
        <button className="ss-btn ss-btn-secondary" onClick={onClose}>{t("common.cancel")}</button>
        <button className="ss-btn ss-btn-primary" disabled={saving || !valid} onClick={submit}>
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </>}
    >
      <div className="ss-field"><label>{t("common.customer")}</label>
        <input className="ss-input" value={name} onChange={e => setName(e.target.value)} autoFocus />
      </div>
      <div className="ss-field"><label>{t("common.phone")}</label>
        <PhoneAutosuggest phone={phone} setPhone={setPhone} customers={customers} onPick={c => setName(c.name)} />
      </div>

      <div className="ss-field"><label>Items</label>
        {loadingOptions ? (
          <div className="ss-input" style={{ color: "var(--text-faint)" }}>{t("common.loading")}</div>
        ) : products.length === 0 ? (
          <div className="ss-input" style={{ color: "var(--danger)" }}>No products available — add one from the owner app first.</div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <select className="ss-select" style={{ flex: 1 }} value={pickedProductId} onChange={e => setPickedProductId(e.target.value)}>
              <option value="" disabled>Select a product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}{p.price != null ? ` — ${formatCurrency(p.price)}` : ""}</option>)}
            </select>
            <input className="ss-input" style={{ width: 64 }} type="number" min={1} value={pickedQty} onChange={e => setPickedQty(Math.max(1, Number(e.target.value) || 1))} />
            <button className="ss-btn ss-btn-secondary" disabled={!pickedProductId} onClick={addPickedItem}><Icon.Plus size={14} /></button>
          </div>
        )}

        {items.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span>{it.qty}× {it.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{formatCurrency(it.qty * it.price)}</span>
                  <button className="ss-icon-btn" style={{ width: 24, height: 24 }} onClick={() => setItems(list => list.filter((_, idx) => idx !== i))}><Icon.X size={12} /></button>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, paddingTop: 8 }}>
              <span>{t("common.total")}</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function AddCustomerModal({
  onClose, businessId, onCreated,
}: { onClose: () => void; businessId: string; onCreated: () => void }) {
  const { t } = useLanguage();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const valid = name.trim();

  async function submit() {
    if (!valid) return;
    setSaving(true);
    try {
      await createCustomer(businessId, { name: name.trim(), phone: phone.trim() || undefined, notes: notes.trim() || undefined });
      toast.show("Customer added.", "success");
      onCreated();
      onClose();
    } catch (e: any) {
      toast.show(friendlyDbError(e, "Couldn't add customer."), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={t("customers.addCustomer")} onClose={onClose}
      footer={<>
        <button className="ss-btn ss-btn-secondary" onClick={onClose}>{t("common.cancel")}</button>
        <button className="ss-btn ss-btn-primary" disabled={saving || !valid} onClick={submit}>
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </>}
    >
      {/* No email field, intentionally — SEBA is phone-first, not email-first. */}
      <div className="ss-field"><label>{t("common.name")}</label>
        <input className="ss-input" value={name} onChange={e => setName(e.target.value)} autoFocus />
      </div>
      <div className="ss-field"><label>{t("common.phone")}</label>
        <input className="ss-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251…" />
      </div>
      <div className="ss-field"><label>{t("common.notes")}</label>
        <textarea className="ss-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
}
