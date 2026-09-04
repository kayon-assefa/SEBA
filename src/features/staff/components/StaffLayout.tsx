import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import { StaffProvider, useStaff } from "../context/StaffContext";
import { LanguageProvider, useLanguage, LANGUAGES } from "../i18n";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import { Icon } from "./Icons";
import { Avatar } from "./UIKit";
import { getNotifications, markAllNotificationsRead, markNotificationRead, updateStaffLanguage } from "../services/staffData";
import { useRealtime } from "../hooks/useRealtime";
import { relativeTime } from "../utils/format";
import type { StaffNotification } from "../types";
import "../styles/theme.css";

export default function StaffLayout() {
  return (
    <ThemeProvider>
      <StaffProvider>
        <StaffLanguageBoundary>
          <ToastProvider>
            <StaffLayoutInner />
          </ToastProvider>
        </StaffLanguageBoundary>
      </StaffProvider>
    </ThemeProvider>
  );
}

/** Seeds the language provider from the staff row's saved `language` column
 *  (falls back to English / whatever's in localStorage until that loads). */
function StaffLanguageBoundary({ children }: { children: ReactNode }) {
  const { staff } = useStaff();
  return <LanguageProvider initialLang={staff?.language}>{children}</LanguageProvider>;
}

function StaffLayoutInner() {
  const { staff, loading, error } = useStaff();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const { open: cmdOpen, setOpen: setCmdOpen, navItems } = useCommandPalette();

  const LINKS: { to: string; label: string; icon: (s?: number) => ReactNode }[] = [
    { to: "/staff/dashboard", label: t("nav.dashboard"), icon: s => <Icon.Dashboard size={s} /> },
    { to: "/staff/appointments", label: t("nav.appointments"), icon: s => <Icon.Calendar size={s} /> },
    { to: "/staff/orders", label: t("nav.orders"), icon: s => <Icon.Bag size={s} /> },
    { to: "/staff/customers", label: t("nav.customers"), icon: s => <Icon.Users size={s} /> },
    { to: "/staff/schedule", label: t("nav.schedule"), icon: s => <Icon.Clock size={s} /> },
    { to: "/staff/scan", label: t("nav.scan"), icon: s => <Icon.QR size={s} /> },
    { to: "/staff/notifications", label: t("nav.notifications"), icon: s => <Icon.Bell size={s} /> },
    { to: "/staff/settings", label: t("nav.settings"), icon: s => <Icon.Settings size={s} /> },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  async function loadNotifications() {
    if (!staff) return;
    try {
      const n = await getNotifications(staff.business_id, staff.id);
      setNotifications(n);
    } catch { /* non-fatal — bell just stays empty */ }
  }

  useEffect(() => { loadNotifications(); }, [staff?.id]); // eslint-disable-line
  useRealtime(["staff_notifications"], staff?.business_id, loadNotifications);

  function changeLanguage(code: string) {
    setLang(code as any);
    setLangOpen(false);
    if (staff) updateStaffLanguage(staff.id, code).catch(() => { /* local pref still applies */ });
  }

  if (error) {
    return (
      <div className="seba-staff" data-theme={theme}>
        <div style={{ padding: 40, maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
          <Icon.AlertTriangle size={36} />
          <h2 className="ss-h1" style={{ marginTop: 12 }}>Couldn't load your staff account</h2>
          <p className="ss-sub">{error}</p>
        </div>
      </div>
    );
  }
  if (loading || !staff) {
    return (
      <div className="seba-staff" data-theme={theme}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, color: "var(--text-muted)" }}>
          <Icon.RefreshCw size={18} className="ss-spin" />
          {t("common.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="seba-staff" data-theme={theme}>
      <div className="ss-shell">
        <div className={`ss-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        <aside className={`ss-sidebar scrollbar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
          <div className="ss-sidebar-brand">
            {!collapsed ? (
              <div><div className="name">SEBA</div><div className="tag">Staff</div></div>
            ) : (
              <div className="name">S</div>
            )}
          </div>

          {!collapsed && (
            <div className="ss-sidebar-user">
              <Avatar name={staff.full_name} />
              <div className="info">
                <div className="full-name">{staff.full_name}</div>
                <div className="role">{staff.role}</div>
              </div>
            </div>
          )}

          <nav className="ss-nav">
            {LINKS.map(link => (
              <NavLink
                key={link.to} to={link.to}
                className={({ isActive }) => `ss-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? link.label : undefined}
              >
                {link.icon(18)}
                {!collapsed && <span>{link.label}</span>}
                {!collapsed && link.to === "/staff/notifications" && unreadCount > 0 && (
                  <span className="badge-count">{unreadCount}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ss-sidebar-footer">
            <button
              className="ss-signout"
              onClick={async () => { await supabase.auth.signOut(); navigate("/login", { replace: true }); }}
            >
              <Icon.LogOut size={16} /> {!collapsed && t("nav.signOut")}
            </button>
          </div>
        </aside>

        <div className="ss-main">
          <header className="ss-topbar">
            <button className="ss-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon.Menu size={18} />
            </button>
            <button
              className="ss-icon-btn ss-collapse-btn" onClick={() => setCollapsed(c => !c)}
              aria-label="Toggle sidebar"
            >
              <Icon.ChevronLeft size={16} style={{ transform: collapsed ? "rotate(180deg)" : "none" }} />
            </button>

            <div className="ss-search" onClick={() => setCmdOpen(true)}>
              <Icon.Search size={16} />
              <input readOnly placeholder={t("common.searchOrJump")} />
              <kbd>⌘K</kbd>
            </div>

            <div className="ss-topbar-right">
              <div style={{ position: "relative" }}>
                <button className="ss-icon-btn" onClick={() => { setLangOpen(o => !o); setNotifOpen(false); setProfileOpen(false); }} aria-label="Change language">
                  <Icon.Globe size={17} />
                </button>
                {langOpen && (
                  <div className="ss-dropdown" style={{ width: 200 }}>
                    <div style={{ padding: 8 }}>
                      {LANGUAGES.map(l => (
                        <button
                          key={l.code}
                          className="ss-btn ss-btn-ghost"
                          style={{ width: "100%", justifyContent: "space-between", background: lang === l.code ? "var(--surface-hover)" : "transparent" }}
                          onClick={() => changeLanguage(l.code)}
                        >
                          <span>{l.native}</span>
                          {lang === l.code && <Icon.Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="ss-icon-btn" onClick={toggle} aria-label="Toggle dark mode">
                {theme === "dark" ? <Icon.Sun size={17} /> : <Icon.Moon size={17} />}
              </button>

              <div style={{ position: "relative" }}>
                <button className="ss-icon-btn" onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); setLangOpen(false); }} aria-label="Notifications">
                  <Icon.Bell size={17} />
                  {unreadCount > 0 && <span className="ss-badge-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="ss-dropdown scrollbar">
                    <div className="ss-dropdown-header">
                      <strong style={{ fontSize: 13.5 }}>{t("notifications.title")}</strong>
                      {unreadCount > 0 && (
                        <button className="ss-btn ss-btn-ghost ss-btn-sm" onClick={async () => {
                          await markAllNotificationsRead(staff.business_id, staff.id); loadNotifications();
                        }}>{t("common.markAllRead")}</button>
                      )}
                    </div>
                    {notifications.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{t("notifications.caughtUp")}</div>}
                    {notifications.slice(0, 12).map(n => (
                      <div
                        key={n.id} className={`ss-notif-item ${n.is_read ? "" : "unread"}`}
                        onClick={async () => {
                          if (!n.is_read) { await markNotificationRead(n.id); loadNotifications(); }
                          if (n.link) navigate(n.link);
                          setNotifOpen(false);
                        }}
                      >
                        <span className="ss-notif-dot" style={{ opacity: n.is_read ? 0 : 1 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                          <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{n.body}</div>
                          <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{relativeTime(n.created_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <button className="ss-profile-btn" onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setLangOpen(false); }}>
                  <Avatar name={staff.full_name} size="sm" />
                  <Icon.ChevronDown size={14} />
                </button>
                {profileOpen && (
                  <div className="ss-dropdown" style={{ width: 220 }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{staff.full_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{staff.email}</div>
                    </div>
                    <div style={{ padding: 8 }}>
                      <button
                        className="ss-btn ss-btn-ghost" style={{ width: "100%", justifyContent: "flex-start" }}
                        onClick={() => { setProfileOpen(false); navigate("/staff/settings"); }}
                      >
                        <Icon.Settings size={15} /> {t("nav.settings")}
                      </button>
                      <button
                        className="ss-btn ss-btn-ghost" style={{ width: "100%", justifyContent: "flex-start", color: "var(--danger)" }}
                        onClick={async () => { await supabase.auth.signOut(); navigate("/login", { replace: true }); }}
                      >
                        <Icon.LogOut size={15} /> {t("nav.signOut")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="ss-content">
            <div className="ss-content-narrow">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} items={navItems} />
    </div>
  );
}
