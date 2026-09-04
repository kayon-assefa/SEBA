import { useEffect, useMemo, useState } from "react";
import { useStaff } from "../context/StaffContext";
import { useToast } from "../context/ToastContext";
import { getAppointments, updateAppointment, bulkUpdateAppointments, hasConflict, friendlyDbError } from "../services/staffData";
import { useRealtime } from "../hooks/useRealtime";
import { DataTable } from "../components/DataTable";
import type { Column } from "../components/DataTable";
import { StatusPill, Tabs, FilterChips, StatCard } from "../components/UIKit";
import { Modal, ConfirmDialog } from "../components/Modal";
import { AddAppointmentModal } from "../components/AddEntityModals";
import { Icon } from "../components/Icons";
import { useLanguage } from "../i18n";
import { formatDate, formatTime, todayISO, serviceLabel, staffLabel } from "../utils/format";
import { toEthiopian } from "../utils/ethiopianCalendar";
import type { Appointment, AppointmentStatus } from "../types";

/**
 * Exact case-sensitive match to features/appointments/types/appointment.ts.
 * Writing anything other than these exact strings is what made the owner
 * app and the staff app silently disagree about an appointment's status.
 */
const APPT_STATUSES: AppointmentStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled", "No-show", "Waitlisted"];

export default function StaffAppointments() {
  const { staff } = useStaff();
  const toast = useToast();
  const { t } = useLanguage();
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "calendar">("table");
  const [tab, setTab] = useState<"today" | "upcoming" | "past" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [staffFilter, setStaffFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Appointment | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const STATUS_OPTIONS = APPT_STATUSES.map(s => ({ value: s.toLowerCase(), label: t(`status.${s.toLowerCase()}`) }));

  async function load() {
    if (!staff) return;
    try { setRows(await getAppointments(staff.business_id)); }
    catch (e: any) { toast.show(friendlyDbError(e, "Couldn't load appointments."), "error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [staff?.id]); // eslint-disable-line
  useRealtime(["appointments"], staff?.business_id, load);

  const staffNames = useMemo(() => Array.from(new Set(rows.map(a => staffLabel(a)).filter(s => s && s !== "Unassigned"))), [rows]);

  const today = todayISO();
  const filtered = useMemo(() => {
    let r = rows;
    if (tab === "today") r = r.filter(a => a.date === today);
    if (tab === "upcoming") r = r.filter(a => a.date > today);
    if (tab === "past") r = r.filter(a => a.date < today);
    if (statusFilter.length) r = r.filter(a => statusFilter.includes(String(a.status).toLowerCase()));
    if (staffFilter) r = r.filter(a => staffLabel(a) === staffFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter(a =>
        a.customer?.toLowerCase().includes(s) ||
        serviceLabel(a).toLowerCase().includes(s) ||
        staffLabel(a).toLowerCase().includes(s) ||
        a.phone?.includes(s));
    }
    return r;
  }, [rows, tab, statusFilter, staffFilter, search, today]);

  const counts = useMemo(() => ({
    today: rows.filter(a => a.date === today).length,
    upcoming: rows.filter(a => a.date > today).length,
    noShow: rows.filter(a => a.status === "No-show").length,
    pending: rows.filter(a => a.status === "Pending").length,
  }), [rows, today]);

  async function setStatus(a: Appointment, status: AppointmentStatus) {
    try {
      await updateAppointment(a.id, { status });
      toast.show(`Marked as ${t(`status.${status.toLowerCase()}`)}.`, "success");
      load();
    } catch (e: any) { toast.show(friendlyDbError(e, "Update failed."), "error"); }
  }

  async function bulkSetStatus(status: AppointmentStatus) {
    if (!selected.size) return;
    try {
      await bulkUpdateAppointments([...selected], { status });
      toast.show(`${selected.size} appointments updated.`, "success");
      setSelected(new Set());
      load();
    } catch (e: any) { toast.show(friendlyDbError(e, "Bulk update failed."), "error"); }
  }

  const columns: Column<Appointment>[] = [
    {
      key: "select", header: "", width: "34px",
      render: a => (
        <input type="checkbox" checked={selected.has(a.id)} onClick={e => e.stopPropagation()}
          onChange={e => {
            const next = new Set(selected);
            e.target.checked ? next.add(a.id) : next.delete(a.id);
            setSelected(next);
          }} />
      ),
    },
    { key: "customer", header: t("common.customer"), sortValue: a => a.customer || "", render: a => (
      <div><b>{a.customer}</b>{a.phone && <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{a.phone}</div>}</div>
    ) },
    { key: "service", header: t("common.service"), sortValue: a => serviceLabel(a), render: a => serviceLabel(a) },
    { key: "staff", header: t("common.staff"), sortValue: a => staffLabel(a), render: a => staffLabel(a) },
    { key: "when", header: t("common.date"), sortValue: a => `${a.date}${a.time}`, render: a => <>{formatDate(a.date)} · {formatTime(a.time)}</> },
    { key: "status", header: t("common.status"), sortValue: a => a.status || "", render: a => <StatusPill status={a.status} /> },
    { key: "payment", header: t("common.payment"), sortValue: a => a.payment_status || "", render: a => a.payment_status ? <StatusPill status={a.payment_status} /> : "—" },
    {
      key: "actions", header: "", render: a => (
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          {a.status !== "Confirmed" && a.status !== "Completed" && (
            <button className="ss-btn ss-btn-secondary ss-btn-sm" onClick={() => setStatus(a, "Confirmed")}>{t("appointments.confirm")}</button>
          )}
          {a.status !== "Completed" && (
            <button className="ss-btn ss-btn-secondary ss-btn-sm" onClick={() => setStatus(a, "Completed")}>{t("appointments.complete")}</button>
          )}
          <button className="ss-btn ss-btn-secondary ss-btn-sm" onClick={() => setReschedule(a)}>{t("appointments.reschedule")}</button>
          <button className="ss-btn ss-btn-danger ss-btn-sm" onClick={() => setConfirmCancel(a)}>{t("appointments.cancel")}</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="ss-row-between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="ss-h1">{t("appointments.title")}</h1>
          <p className="ss-sub">{filtered.length} {t("common.shown")}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div className="ss-view-toggle">
            <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><Icon.Rows size={14} />{t("common.table")}</button>
            <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}><Icon.Calendar size={14} />{t("common.calendar")}</button>
          </div>
          <button className="ss-btn ss-btn-primary" onClick={() => setShowAdd(true)}><Icon.Plus size={15} />{t("appointments.addAppointment")}</button>
        </div>
      </div>

      <div className="ss-stats-grid" style={{ marginBottom: 18 }}>
        <StatCard label={t("dashboard.todaysAppointments")} value={counts.today} icon={<Icon.Calendar size={18} />} tint="coral" />
        <StatCard label={t("common.upcoming")} value={counts.upcoming} icon={<Icon.Clock size={18} />} tint="info" />
        <StatCard label={t("status.pending")} value={counts.pending} icon={<Icon.AlertTriangle size={18} />} tint="gold" />
        <StatCard label={t("status.no-show")} value={counts.noShow} icon={<Icon.XCircle size={18} />} tint="deepred" />
      </div>

      <div className="ss-row-between" style={{ marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <Tabs
          value={tab} onChange={(v: typeof tab) => setTab(v)}
          options={[
            { value: "today", label: t("common.today") }, { value: "upcoming", label: t("common.upcoming") },
            { value: "past", label: t("common.past") }, { value: "all", label: t("common.all") },
          ] as const}
        />
        <input className="ss-input" placeholder={t("appointments.searchPlaceholder")} style={{ maxWidth: 240 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="ss-filter-bar" style={{ marginBottom: 16 }}>
        <select className="ss-select" value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
          <option value="">{t("common.allStaff")}</option>
          {staffNames.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <FilterChips value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
      </div>

      {selected.size > 0 && (
        <div className="ss-card ss-card-pad" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{selected.size} {t("appointments.selected")}</span>
          <button className="ss-btn ss-btn-secondary ss-btn-sm" onClick={() => bulkSetStatus("Confirmed")}>{t("appointments.confirmAll")}</button>
          <button className="ss-btn ss-btn-secondary ss-btn-sm" onClick={() => bulkSetStatus("Completed")}>{t("appointments.completeAll")}</button>
          <button className="ss-btn ss-btn-danger ss-btn-sm" onClick={() => bulkSetStatus("Cancelled")}>{t("appointments.cancelAll")}</button>
          <button className="ss-btn ss-btn-ghost ss-btn-sm" style={{ marginLeft: "auto" }} onClick={() => setSelected(new Set())}>{t("appointments.clear")}</button>
        </div>
      )}

      {view === "table" ? (
        <DataTable
          columns={columns} rows={filtered} loading={loading}
          emptyTitle={t("appointments.noMatch")} emptySubtitle={t("appointments.tryClearingFilters")}
          pageSize={9}
        />
      ) : (
        <WeekCalendar
          rows={rows} onDropAppointment={async (a, newDate) => {
            if (hasConflict(rows, a.id, newDate, a.time)) {
              toast.show(`${a.customer} already has something at ${formatTime(a.time)} that day — pick another time.`, "error");
              return;
            }
            await updateAppointment(a.id, { date: newDate });
            toast.show("Rescheduled.", "success");
            load();
          }}
          dragOverDay={dragOverDay} setDragOverDay={setDragOverDay}
          onOpen={setReschedule}
        />
      )}

      {reschedule && (
        <RescheduleModal
          appointment={reschedule} allAppointments={rows}
          onClose={() => setReschedule(null)}
          onSaved={() => { setReschedule(null); load(); }}
        />
      )}

      {confirmCancel && (
        <ConfirmDialog
          title={t("appointments.cancelConfirmTitle")}
          message={`This marks ${confirmCancel.customer}'s appointment as cancelled. This can't be undone from here.`}
          confirmLabel={t("appointments.cancel")} danger
          onCancel={() => setConfirmCancel(null)}
          onConfirm={async () => { await setStatus(confirmCancel, "Cancelled"); setConfirmCancel(null); }}
        />
      )}

      {showAdd && staff && (
        <AddAppointmentModal businessId={staff.business_id} onClose={() => setShowAdd(false)} onCreated={load} />
      )}

      <div className="ss-mobile-add-bar">
        <button className="ss-btn ss-btn-primary" onClick={() => setShowAdd(true)}><Icon.Plus size={15} />{t("appointments.addAppointment")}</button>
      </div>
    </div>
  );
}

function RescheduleModal({
  appointment, allAppointments, onClose, onSaved,
}: { appointment: Appointment; allAppointments: Appointment[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const { t } = useLanguage();
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);
  const [saving, setSaving] = useState(false);
  const conflict = hasConflict(allAppointments, appointment.id, date, time);

  async function save() {
    setSaving(true);
    try {
      await updateAppointment(appointment.id, { date, time });
      toast.show("Appointment rescheduled.", "success");
      onSaved();
    } catch (e: any) { toast.show(friendlyDbError(e, "Couldn't reschedule."), "error"); }
    finally { setSaving(false); }
  }

  return (
    <Modal
      title={`${t("appointments.rescheduleTitle")} — ${appointment.customer}`} onClose={onClose}
      footer={<>
        <button className="ss-btn ss-btn-secondary" onClick={onClose}>{t("common.cancel")}</button>
        <button className="ss-btn ss-btn-primary" disabled={saving || conflict} onClick={save}>{saving ? t("common.saving") : t("appointments.newTime")}</button>
      </>}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div className="ss-field" style={{ flex: 1 }}><label>{t("common.date")}</label>
          <input type="date" className="ss-input" value={date} onChange={e => setDate(e.target.value)} />
          {date && (() => { try { const eth = toEthiopian(date); return <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>Ethiopian: {eth.day} {eth.monthName} {eth.year}</div>; } catch { return null; } })()}
        </div>
        <div className="ss-field" style={{ flex: 1 }}><label>{t("common.time")}</label>
          <input type="time" className="ss-input" value={time} onChange={e => setTime(e.target.value)} />
        </div>
      </div>
      {conflict && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: 12, background: "var(--danger-bg)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: 13 }}>
          <Icon.AlertTriangle size={16} /> {t("appointments.slotTaken")}
        </div>
      )}
    </Modal>
  );
}

function WeekCalendar({
  rows, onDropAppointment, dragOverDay, setDragOverDay, onOpen,
}: {
  rows: Appointment[];
  onDropAppointment: (a: Appointment, newDate: string) => void;
  dragOverDay: string | null;
  setDragOverDay: (d: string | null) => void;
  onOpen: (a: Appointment) => void;
}) {
  const days = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  return (
    <div className="ss-week-grid">
      {days.map(day => {
        const dayRows = rows.filter(a => a.date === day).sort((a, b) => a.time.localeCompare(b.time));
        return (
          <div
            key={day}
            className={`ss-card ss-card-pad ss-week-day ${dragOverDay === day ? "ss-drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOverDay(day); }}
            onDragLeave={() => setDragOverDay(null)}
            onDrop={e => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/appointment-id");
              const a = rows.find(x => x.id === id);
              setDragOverDay(null);
              if (a) onDropAppointment(a, day);
            }}
          >
            <div className="ss-eyebrow" style={{ marginBottom: 8 }}>{formatDate(day)}</div>
            <div style={{ display: "grid", gap: 6 }}>
              {dayRows.map(a => (
                <div
                  key={a.id} draggable
                  onDragStart={e => e.dataTransfer.setData("text/appointment-id", a.id)}
                  onClick={() => onOpen(a)}
                  style={{
                    padding: "8px 10px", borderRadius: 10, background: "var(--surface-2)",
                    border: "1px solid var(--border)", cursor: "grab", fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{formatTime(a.time)}</div>
                  <div style={{ color: "var(--text-muted)" }}>{a.customer}</div>
                </div>
              ))}
              {!dayRows.length && <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>Nothing scheduled</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
