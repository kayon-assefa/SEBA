import { useEffect, useState } from "react";
import { useStaff } from "../context/StaffContext";
import { useToast } from "../context/ToastContext";
import {
  getNotifications, markAllNotificationsRead, markNotificationRead,
  getNotificationPrefs, saveNotificationPrefs, savePushSubscription,
} from "../services/staffData";
import { useRealtime } from "../hooks/useRealtime";
import { EmptyState, SkeletonRows } from "../components/UIKit";
import { Icon } from "../components/Icons";
import { relativeTime } from "../utils/format";
import { useLanguage } from "../i18n";
import { enablePushNotifications, isPushSupported } from "../utils/push";
import type { StaffNotification, NotificationPrefs } from "../types";

export default function StaffNotifications() {
  const { staff } = useStaff();
  const toast = useToast();
  const { t } = useLanguage();
  const [rows, setRows] = useState<StaffNotification[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushEnabling, setPushEnabling] = useState(false);

  async function load() {
    if (!staff) return;
    try {
      const [n, p] = await Promise.all([
        getNotifications(staff.business_id, staff.id),
        getNotificationPrefs(staff.id).catch(() => null),
      ]);
      setRows(n);
      setPrefs(p || { staff_id: staff.id, sms_enabled: false, push_enabled: false });
    } catch (e: any) { toast.show(e.message || "Couldn't load notifications.", "error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [staff?.id]); // eslint-disable-line
  useRealtime(["staff_notifications"], staff?.business_id, load);

  async function updatePref(patch: Partial<NotificationPrefs>) {
    if (!staff || !prefs) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try { await saveNotificationPrefs(staff.id, staff.business_id, patch); }
    catch (e: any) { toast.show(e.message || "Couldn't save preference — has the prefs migration been run?", "error"); }
  }

  async function handleEnablePush() {
    if (!staff) return;
    setPushEnabling(true);
    try {
      const sub = await enablePushNotifications();
      if (sub) {
        await savePushSubscription(staff.id, staff.business_id, sub.toJSON() as PushSubscriptionJSON);
        await updatePref({ push_enabled: true });
        toast.show("Push notifications enabled.", "success");
      } else {
        await updatePref({ push_enabled: true });
        toast.show("Permission granted — push will start once your VAPID key is configured.", "info");
      }
    } catch (e: any) {
      toast.show(e.message || "Couldn't enable push notifications.", "error");
    } finally {
      setPushEnabling(false);
    }
  }

  const unread = rows.filter(r => !r.is_read);

  return (
    <div>
      <div className="ss-row-between" style={{ marginBottom: 18 }}>
        <div><h1 className="ss-h1">{t("notifications.title")}</h1><p className="ss-sub">{unread.length} {t("notifications.unread")}</p></div>
        {unread.length > 0 && staff && (
          <button className="ss-btn ss-btn-secondary" onClick={async () => { await markAllNotificationsRead(staff.business_id, staff.id); load(); }}>
            {t("common.markAllRead")}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }} className="ss-notif-grid">
        <section className="ss-card">
          {loading ? <div className="ss-card-pad"><SkeletonRows rows={5} /></div> : rows.length === 0 ? (
            <div className="ss-card-pad"><EmptyState title={t("notifications.noneYet")} icon={<Icon.Bell size={36} />} /></div>
          ) : rows.map(n => (
            <div
              key={n.id} className={`ss-notif-item ${n.is_read ? "" : "unread"}`}
              onClick={() => !n.is_read && markNotificationRead(n.id).then(load)}
            >
              <span className="ss-notif-dot" style={{ opacity: n.is_read ? 0 : 1 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{n.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{n.body}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 3 }}>{relativeTime(n.created_at)}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="ss-card ss-card-pad" style={{ height: "fit-content" }}>
          <h2 className="ss-h2" style={{ marginBottom: 14 }}>{t("notifications.preferences")}</h2>

          {/* No email row — SEBA staff notifications are SMS + push + in-app only. */}
          <PrefRow label={t("notifications.sms")} checked={!!prefs?.sms_enabled} onChange={v => updatePref({ sms_enabled: v })} />
          <PrefRow label={t("notifications.push")} checked={!!prefs?.push_enabled} onChange={v => v ? handleEnablePush() : updatePref({ push_enabled: false })} disabled={!isPushSupported() || pushEnabling} />

          {!isPushSupported() && (
            <p style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 6 }}>{t("notifications.pushUnsupported")}</p>
          )}
        </section>
      </div>

      <style>{`@media (max-width: 900px) { .ss-notif-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function PrefRow({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
    </label>
  );
}
