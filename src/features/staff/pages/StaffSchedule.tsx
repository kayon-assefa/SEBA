import { useEffect, useState } from "react";
import { useStaff } from "../context/StaffContext";
import { useToast } from "../context/ToastContext";
import { getAppointments, getShifts, getTimeOffRequests, requestTimeOff } from "../services/staffData";
import { EmptyState, SkeletonRows, StatusPill } from "../components/UIKit";
import { Modal } from "../components/Modal";
import { Icon } from "../components/Icons";
import { useLanguage } from "../i18n";
import { formatDate, formatTime, todayISO, serviceLabel } from "../utils/format";
import type { Appointment, StaffShift, TimeOffRequest } from "../types";

export default function StaffSchedule() {
  const { staff } = useStaff();
  const toast = useToast();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestOpen, setRequestOpen] = useState(false);

  async function load() {
    if (!staff) return;
    try {
      const [a, s, r] = await Promise.all([
        getAppointments(staff.business_id),
        getShifts(staff.business_id).catch(() => []),
        getTimeOffRequests(staff.business_id, staff.id).catch(() => []),
      ]);
      setAppointments(a); setShifts(s); setTimeOff(r);
    } catch (e: any) { toast.show(e.message || "Couldn't load your schedule.", "error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [staff?.id]); // eslint-disable-line

  const myShifts = shifts.filter(s => s.staff_id === staff?.id && s.date >= todayISO());

  if (loading) return <SkeletonRows rows={5} />;

  return (
    <div>
      <div className="ss-row-between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div><h1 className="ss-h1">{t("schedule.title")}</h1><p className="ss-sub">{t("schedule.subtitle")}</p></div>
        <button className="ss-btn ss-btn-primary" onClick={() => setRequestOpen(true)}><Icon.Plus size={14} /> {t("schedule.requestTimeOff")}</button>
      </div>

      <section className="ss-card ss-card-pad" style={{ marginBottom: 16 }}>
        <h2 className="ss-h2" style={{ marginBottom: 12 }}>{t("schedule.yourShifts")}</h2>
        {myShifts.length === 0 ? (
          <EmptyState title={t("schedule.noShifts")} subtitle={t("schedule.askManager")} icon={<Icon.Clock size={32} />} />
        ) : myShifts.map(s => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <b>{formatDate(s.date)}</b>
            <span style={{ color: "var(--text-muted)" }}>{formatTime(s.start_time)} – {formatTime(s.end_time)}</span>
          </div>
        ))}
      </section>

      <section className="ss-card ss-card-pad" style={{ marginBottom: 16 }}>
        <h2 className="ss-h2" style={{ marginBottom: 12 }}>{t("schedule.appointmentSchedule")}</h2>
        {appointments.length === 0 ? <EmptyState title={t("schedule.nothingBooked")} /> : appointments.slice(0, 20).map(a => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 10, flexWrap: "wrap" }}>
            <span>{formatDate(a.date)} · {formatTime(a.time)} — <b>{a.customer}</b> — {serviceLabel(a)}</span>
            <StatusPill status={a.status} />
          </div>
        ))}
      </section>

      <section className="ss-card ss-card-pad">
        <h2 className="ss-h2" style={{ marginBottom: 12 }}>{t("schedule.timeOffRequests")}</h2>
        {timeOff.length === 0 ? <EmptyState title={t("schedule.noRequestsYet")} /> : timeOff.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 10, flexWrap: "wrap" }}>
            <span>{formatDate(r.start_date)} → {formatDate(r.end_date)} {r.reason ? `· ${r.reason}` : ""}</span>
            <StatusPill status={r.status} />
          </div>
        ))}
      </section>

      {requestOpen && staff && (
        <TimeOffModal businessId={staff.business_id} staffId={staff.id} onClose={() => setRequestOpen(false)} onSaved={() => { setRequestOpen(false); load(); }} />
      )}
    </div>
  );
}

function TimeOffModal({
  businessId, staffId, onClose, onSaved,
}: { businessId: string; staffId: string; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await requestTimeOff(businessId, staffId, { start_date: startDate, end_date: endDate, reason });
      toast.show("Time-off request submitted.", "success");
      onSaved();
    } catch (e: any) { toast.show(e.message || "Couldn't submit — has the time-off migration been run?", "error"); }
    finally { setSaving(false); }
  }

  return (
    <Modal
      title={t("schedule.requestTimeOff")} onClose={onClose}
      footer={<>
        <button className="ss-btn ss-btn-secondary" onClick={onClose}>{t("common.cancel")}</button>
        <button className="ss-btn ss-btn-primary" disabled={saving} onClick={save}>{saving ? t("schedule.submitting") : t("schedule.submitRequest")}</button>
      </>}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div className="ss-field" style={{ flex: 1 }}><label>{t("common.from")}</label>
          <input type="date" className="ss-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="ss-field" style={{ flex: 1 }}><label>{t("common.to")}</label>
          <input type="date" className="ss-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="ss-field"><label>{t("common.reason")}</label>
        <textarea className="ss-textarea" rows={3} value={reason} onChange={e => setReason(e.target.value)} />
      </div>
    </Modal>
  );
}
