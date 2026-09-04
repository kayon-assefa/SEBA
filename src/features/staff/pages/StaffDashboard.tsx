import { useEffect, useMemo, useState } from "react";
import { useStaff } from "../context/StaffContext";
import { useToast } from "../context/ToastContext";
import { getAppointments, getOrders } from "../services/staffData";
import { useRealtime } from "../hooks/useRealtime";
import { StatCard, StatusPill, SkeletonRows, EmptyState } from "../components/UIKit";
import { BarChart } from "../components/BarChart";
import { Icon } from "../components/Icons";
import { useLanguage } from "../i18n";
import { formatTime, todayISO, serviceLabel } from "../utils/format";
import type { Appointment, Order } from "../types";

export default function StaffDashboard() {
  const { staff } = useStaff();
  const toast = useToast();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(showToast = false) {
    if (!staff) return;
    try {
      const [a, o] = await Promise.all([getAppointments(staff.business_id), getOrders(staff.business_id)]);
      setAppointments(a); setOrders(o);
      if (showToast) toast.show("Dashboard refreshed.", "success");
    } catch (e: any) {
      toast.show(e.message || "Couldn't refresh the dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [staff?.id]); // eslint-disable-line
  useRealtime(["appointments", "orders"], staff?.business_id, () => load());

  const today = todayISO();
  const todayA = appointments.filter(a => a.date === today);
  const pendingA = appointments.filter(a => a.status === "Pending");
  const todayO = orders.filter(o => String(o.created_at).slice(0, 10) === today);
  const noShows = appointments.filter(a => a.status === "No-show").length;
  const completed = appointments.filter(a => a.status === "Completed").length;
  const noShowRate = completed + noShows > 0 ? Math.round((noShows / (completed + noShows)) * 100) : 0;

  const nextUp = useMemo(() => {
    const now = new Date();
    return todayA
      .filter(a => {
        const [h, m] = a.time?.split(":").map(Number) ?? [0, 0];
        const t2 = new Date(); t2.setHours(h, m, 0, 0);
        return t2 >= now && a.status !== "Cancelled" && a.status !== "Completed";
      })
      .sort((a, b) => a.time.localeCompare(b.time))[0];
  }, [todayA]);

  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    return days.map(d => ({
      label: new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" })[0],
      value: appointments.filter(a => a.date === d).length,
    }));
  }, [appointments]);

  const firstName = staff?.full_name?.split(" ")[0] || "";

  return (
    <div>
      <div className="ss-hero">
        <div className="ss-hero-row">
          <div>
            <h1>{t("dashboard.greeting", { name: firstName })}</h1>
            <p>{t("dashboard.subtitle")}</p>
          </div>
          <button className="ss-btn" style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: "1px solid rgba(255,255,255,.35)" }} onClick={() => load(true)}>
            <Icon.RefreshCw size={15} /> {t("common.refresh")}
          </button>
        </div>
      </div>

      <div className="ss-stats-grid">
        <StatCard label={t("dashboard.todaysAppointments")} value={todayA.length} icon={<Icon.Calendar size={18} />} tint="coral" />
        <StatCard label={t("dashboard.pendingAppointments")} value={pendingA.length} icon={<Icon.Clock size={18} />} tint="gold" />
        <StatCard label={t("dashboard.todaysOrders")} value={todayO.length} icon={<Icon.Bag size={18} />} tint="deepred" />
        <StatCard label={t("dashboard.noShowRate")} value={`${noShowRate}%`} icon={<Icon.AlertTriangle size={18} />} tint="info"
          trend={completed + noShows > 0 ? { direction: noShowRate > 15 ? "down" : "up", text: `${completed + noShows} ${t("dashboard.tracked")}` } : undefined}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 16 }} className="ss-dash-grid">
        <section className="ss-card ss-card-pad">
          <div className="ss-row-between" style={{ marginBottom: 14 }}>
            <h2 className="ss-h2">{t("dashboard.last7Days")}</h2>
          </div>
          {loading ? <SkeletonRows rows={3} /> : <BarChart data={last7} height={150} />}
        </section>

        <section className="ss-card ss-card-pad">
          <h2 className="ss-h2" style={{ marginBottom: 14 }}>{t("dashboard.nextUp")}</h2>
          {nextUp ? (
            <div>
              <div className="ss-eyebrow">{t("common.today")} · {formatTime(nextUp.time)}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{nextUp.customer}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{serviceLabel(nextUp)}</div>
              <div style={{ marginTop: 10 }}><StatusPill status={nextUp.status} /></div>
            </div>
          ) : <EmptyState title={t("dashboard.nothingLeftToday")} subtitle={t("dashboard.enjoyQuiet")} icon={<Icon.CheckCircle size={36} />} />}
        </section>
      </div>

      <section className="ss-card ss-card-pad" style={{ marginTop: 16 }}>
        <div className="ss-row-between" style={{ marginBottom: 12 }}>
          <h2 className="ss-h2">{t("dashboard.upcomingAppointments")}</h2>
          {pendingA.length > 0 && <span className="ss-pill ss-pill-pending">{pendingA.length} {t("status.pending").toLowerCase()}</span>}
        </div>
        {loading ? <SkeletonRows rows={4} /> : appointments.length ? (
          <div>
            {appointments.slice(0, 8).map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <b>{a.customer}</b> <span style={{ color: "var(--text-muted)" }}>— {serviceLabel(a)}</span>
                  <div style={{ fontSize: 12.5, color: "var(--text-faint)" }}>{a.date} · {formatTime(a.time)}</div>
                </div>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
        ) : <EmptyState title={t("dashboard.noAppointmentsYet")} />}
      </section>

      <section className="ss-card ss-card-pad" style={{ marginTop: 16 }}>
        <h2 className="ss-h2" style={{ marginBottom: 12 }}>{t("dashboard.todaysOrdersSection")}</h2>
        {loading ? <SkeletonRows rows={3} /> : todayO.length ? (
          <div>
            {todayO.map(o => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)", gap: 10, flexWrap: "wrap" }}>
                <b>{o.customer_name || t("common.customer")}</b>
                <div style={{ display: "flex", gap: 8 }}><StatusPill status={o.status} /><StatusPill status={o.payment_status} /></div>
              </div>
            ))}
          </div>
        ) : <EmptyState title={t("dashboard.noOrdersToday")} />}
      </section>

      <style>{`@media (max-width: 900px) { .ss-dash-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
