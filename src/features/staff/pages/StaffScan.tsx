import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaff } from "../context/StaffContext";
import { useToast } from "../context/ToastContext";
import { QRScanner } from "../components/QRScanner";
import { resolveScannedCode } from "../utils/qr";
import { updateAppointment, updateOrder, friendlyDbError } from "../services/staffData";
import { Icon } from "../components/Icons";
import { StatusPill } from "../components/UIKit";
import { formatDate, formatTime, formatDateTime, formatCurrency, serviceLabel, staffLabel } from "../utils/format";
import { useLanguage } from "../i18n";
import type { ScanResult, Appointment, Order } from "../types";

export default function StaffScan() {
  const { staff } = useStaff();
  const { t } = useLanguage();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleDetect(raw: string) {
    if (!staff || checking) return;
    setChecking(true);
    try {
      const r = await resolveScannedCode(raw, staff.business_id);
      setResult(r);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <h1 className="ss-h1">{t("scan.title")}</h1>
        <p className="ss-sub">{t("scan.subtitle")}</p>
      </div>

      {!result && <QRScanner onDetect={handleDetect} />}

      {checking && (
        <div style={{ textAlign: "center", marginTop: 20, color: "var(--text-muted)", fontSize: 13.5 }}>
          {t("scan.lookingUp")}
        </div>
      )}

      {result && !checking && (
        <ScanResultView
          result={result}
          onRescan={() => setResult(null)}
          onChanged={updated => setResult(updated)}
        />
      )}
    </div>
  );
}

function ScanResultView({
  result, onRescan, onChanged,
}: { result: ScanResult; onRescan: () => void; onChanged: (r: ScanResult) => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (result.kind === "not_found") {
    return (
      <div className="ss-card ss-card-pad" style={{ textAlign: "center", marginTop: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "var(--danger-bg)", color: "var(--danger)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
        }}>
          <Icon.XCircle size={30} />
        </div>
        <h2 className="ss-h2" style={{ marginBottom: 6 }}>{t("scan.scannedNotFound")}</h2>
        <p className="ss-sub" style={{ marginBottom: 18 }}>{t("scan.notFoundBody")}</p>
        <button className="ss-btn ss-btn-primary" onClick={onRescan}>{t("scan.scanAgain")}</button>
      </div>
    );
  }

  if (result.kind === "appointment") {
    const a = result.record as Appointment;

    async function setStatus(status: Appointment["status"]) {
      setBusy(true);
      try {
        await updateAppointment(a.id, { status });
        toast.show(`Marked as ${status}.`, "success");
        onChanged({ kind: "appointment", record: { ...a, status } });
      } catch (e: any) {
        toast.show(friendlyDbError(e, "Update failed."), "error");
      } finally { setBusy(false); }
    }

    return (
      <div className="ss-card ss-card-pad" style={{ marginTop: 20 }}>
        <ResultHeader label={t("scan.appointmentFound")} />
        <h2 className="ss-h2" style={{ marginTop: 10 }}>{a.customer}</h2>
        <p className="ss-sub">{serviceLabel(a)}{a.staff || a.staff_members?.length ? ` · ${staffLabel(a)}` : ""}</p>
        {a.phone && <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>{a.phone}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
          <StatusPill status={a.status} />
          {a.payment_status && <StatusPill status={a.payment_status} />}
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{formatDate(a.date)} · {formatTime(a.time)}</span>
        </div>
        {a.notes && <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}><b>{t("common.notes")}:</b> {a.notes}</p>}

        {/* Same actions as the Appointments table row — no need to leave this page to act on what you scanned. */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {a.status !== "Confirmed" && a.status !== "Completed" && (
            <button className="ss-btn ss-btn-secondary ss-btn-sm" disabled={busy} onClick={() => setStatus("Confirmed")}>{t("appointments.confirm")}</button>
          )}
          {a.status !== "Completed" && (
            <button className="ss-btn ss-btn-secondary ss-btn-sm" disabled={busy} onClick={() => setStatus("Completed")}>{t("appointments.complete")}</button>
          )}
          {a.status !== "Cancelled" && (
            <button className="ss-btn ss-btn-danger ss-btn-sm" disabled={busy} onClick={() => setStatus("Cancelled")}>{t("appointments.cancel")}</button>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="ss-btn ss-btn-secondary" onClick={onRescan}>{t("scan.scanAnother")}</button>
          <button className="ss-btn ss-btn-primary" onClick={() => navigate("/staff/appointments")}>
            {t("nav.appointments")} <Icon.ChevronDown size={13} style={{ transform: "rotate(-90deg)" }} />
          </button>
        </div>
      </div>
    );
  }

  const o = result.record as Order;

  async function setOrderStatus(status: Order["status"]) {
    setBusy(true);
    try {
      await updateOrder(o.id, { status });
      toast.show(`Marked as ${status}.`, "success");
      onChanged({ kind: "order", record: { ...o, status } });
    } catch (e: any) {
      toast.show(friendlyDbError(e, "Update failed."), "error");
    } finally { setBusy(false); }
  }

  return (
    <div className="ss-card ss-card-pad" style={{ marginTop: 20 }}>
      <ResultHeader label={t("scan.orderFound")} />
      <h2 className="ss-h2" style={{ marginTop: 10 }}>{o.customer_name || t("common.customer")}</h2>
      {o.customer_phone && <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>{o.customer_phone}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
        <StatusPill status={o.status} /><StatusPill status={o.payment_status} />
      </div>
      <p style={{ marginTop: 10, fontSize: 13, color: "var(--text-muted)" }}>
        {t("common.placed")} {formatDateTime(o.created_at)} {o.total_amount != null ? `· ${formatCurrency(o.total_amount)}` : ""}
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        {o.status !== "processing" && o.status !== "completed" && (
          <button className="ss-btn ss-btn-secondary ss-btn-sm" disabled={busy} onClick={() => setOrderStatus("processing")}>{t("status.processing")}</button>
        )}
        {o.status !== "ready" && (
          <button className="ss-btn ss-btn-secondary ss-btn-sm" disabled={busy} onClick={() => setOrderStatus("ready")}>{t("status.ready")}</button>
        )}
        {o.status !== "completed" && (
          <button className="ss-btn ss-btn-secondary ss-btn-sm" disabled={busy} onClick={() => setOrderStatus("completed")}>{t("status.completed")}</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="ss-btn ss-btn-secondary" onClick={onRescan}>{t("scan.scanAnother")}</button>
        <button className="ss-btn ss-btn-primary" onClick={() => navigate("/staff/orders")}>
          {t("nav.orders")} <Icon.ChevronDown size={13} style={{ transform: "rotate(-90deg)" }} />
        </button>
      </div>
    </div>
  );
}

function ResultHeader({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--success)", fontWeight: 700, fontSize: 13 }}>
      <Icon.CheckCircle size={17} /> {label}
    </div>
  );
}
