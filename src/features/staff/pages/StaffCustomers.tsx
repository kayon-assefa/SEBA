import { useEffect, useMemo, useState } from "react";
import { useStaff } from "../context/StaffContext";
import { useToast } from "../context/ToastContext";
import { getCustomers, updateCustomer, getAppointments, friendlyDbError } from "../services/staffData";
import { useRealtime } from "../hooks/useRealtime";
import { Avatar, EmptyState, SkeletonRows } from "../components/UIKit";
import { Modal } from "../components/Modal";
import { AddCustomerModal } from "../components/AddEntityModals";
import { Icon } from "../components/Icons";
import { useLanguage } from "../i18n";
import { formatDate, serviceLabel } from "../utils/format";
import type { Customer, Appointment } from "../types";

export default function StaffCustomers() {
  const { staff } = useStaff();
  const toast = useToast();
  const { t } = useLanguage();
  const [rows, setRows] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    if (!staff) return;
    try {
      const [c, a] = await Promise.all([getCustomers(staff.business_id), getAppointments(staff.business_id)]);
      setRows(c); setAppointments(a);
    } catch (e: any) { toast.show(friendlyDbError(e, "Couldn't load customers."), "error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [staff?.id]); // eslint-disable-line
  useRealtime(["customers"], staff?.business_id, load);

  const filtered = useMemo(() => {
    // Phone-first: SEBA doesn't use email as a customer identifier or search field.
    if (!search.trim()) return rows;
    const s = search.toLowerCase();
    return rows.filter(c => c.name?.toLowerCase().includes(s) || c.phone?.includes(s));
  }, [rows, search]);

  function visitsFor(c: Customer) {
    // Bug fix: appointments store the phone column as `phone`, not
    // `customer_phone` — matching on the wrong field name meant repeat
    // customers were never detected and visit history was always empty.
    return appointments.filter(a => a.customer?.toLowerCase() === c.name?.toLowerCase() || (c.phone && a.phone === c.phone));
  }

  return (
    <div>
      <div className="ss-row-between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div><h1 className="ss-h1">{t("customers.title")}</h1><p className="ss-sub">{filtered.length} {t("common.shown")}</p></div>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="ss-input" placeholder={t("customers.searchPlaceholder")} style={{ maxWidth: 240 }} value={search} onChange={e => setSearch(e.target.value)} />
          <button className="ss-btn ss-btn-primary" onClick={() => setShowAdd(true)}><Icon.Plus size={15} />{t("customers.addCustomer")}</button>
        </div>
      </div>

      {loading ? <SkeletonRows rows={5} /> : filtered.length === 0 ? (
        <div className="ss-card ss-card-pad"><EmptyState title={t("customers.noMatch")} icon={<Icon.Users size={36} />} /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {filtered.map(c => {
            const visits = visitsFor(c);
            return (
              <div key={c.id} className="ss-card ss-card-pad" style={{ cursor: "pointer" }} onClick={() => setActive(c)}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar name={c.name} size="lg" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{c.phone || t("common.noContactInfo")}</div>
                  </div>
                </div>
                {c.tags?.length ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {c.tags.map(tag => <span key={tag} className="ss-chip active" style={{ cursor: "default" }}>{tag}</span>)}
                  </div>
                ) : null}
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-faint)" }}>
                  {visits.length} {visits.length === 1 ? t("customers.visit") : t("customers.visits")}{visits.length > 1 ? ` · ${t("customers.repeatCustomer")}` : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {active && (
        <CustomerModal
          customer={active} visits={visitsFor(active)}
          onClose={() => setActive(null)}
          onSaved={() => { setActive(null); load(); }}
        />
      )}
      {showAdd && staff && (
        <AddCustomerModal businessId={staff.business_id} onClose={() => setShowAdd(false)} onCreated={load} />
      )}

      <div className="ss-mobile-add-bar">
        <button className="ss-btn ss-btn-primary" onClick={() => setShowAdd(true)}><Icon.Plus size={15} />{t("customers.addCustomer")}</button>
      </div>
    </div>
  );
}

function CustomerModal({
  customer, visits, onClose, onSaved,
}: { customer: Customer; visits: Appointment[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const { t } = useLanguage();
  const [notes, setNotes] = useState(customer.notes || "");
  const [tagsInput, setTagsInput] = useState((customer.tags || []).join(", "));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const tags = tagsInput.split(",").map(t2 => t2.trim()).filter(Boolean);
      await updateCustomer(customer.id, { notes, tags });
      toast.show("Customer updated.", "success");
      onSaved();
    } catch (e: any) { toast.show(friendlyDbError(e, "Couldn't save — has the `tags`/`notes` migration been run?"), "error"); }
    finally { setSaving(false); }
  }

  return (
    <Modal
      title={customer.name} onClose={onClose}
      footer={<>
        <button className="ss-btn ss-btn-secondary" onClick={onClose}>{t("common.close")}</button>
        <button className="ss-btn ss-btn-primary" disabled={saving} onClick={save}>{saving ? t("common.saving") : t("common.save")}</button>
      </>}
    >
      {/* No email row — SEBA is phone-first, so only the phone number is shown here. */}
      {customer.phone && (
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          <span><Icon.Phone size={13} /> {customer.phone}</span>
        </div>
      )}

      <div className="ss-field"><label>{t("customers.tagsLabel")}</label>
        <input className="ss-input" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="VIP, prefers evenings" />
      </div>
      <div className="ss-field"><label>{t("customers.notesLabel")}</label>
        <textarea className="ss-textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything staff should know before their next visit…" />
      </div>

      <hr className="ss-divider" />
      <div className="ss-eyebrow" style={{ marginBottom: 8 }}>{t("customers.visitHistory")} ({visits.length})</div>
      {visits.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>{t("customers.noVisitsYet")}</p>
      ) : (
        <div style={{ maxHeight: 180, overflowY: "auto" }} className="scrollbar">
          {visits.map(v => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span>{serviceLabel(v)}</span><span style={{ color: "var(--text-muted)" }}>{formatDate(v.date)}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
