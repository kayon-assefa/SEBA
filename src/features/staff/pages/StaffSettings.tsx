import { useState } from "react";
import { useStaff } from "../context/StaffContext";
import { useToast } from "../context/ToastContext";
import { updateStaffProfile, changePassword } from "../services/staffData";
import { Avatar } from "../components/UIKit";
import { Icon } from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { useLanguage, LANGUAGES } from "../i18n";

export default function StaffSettings() {
  const { staff, reload } = useStaff();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const toast = useToast();

  const [fullName, setFullName] = useState(staff?.full_name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const strength = passwordStrength(newPassword);

  async function saveProfile() {
    if (!staff) return;
    setSavingProfile(true);
    try {
      await updateStaffProfile(staff.id, { full_name: fullName });
      await reload();
      toast.show("Profile updated.", "success");
    } catch (e: any) { toast.show(e.message || "Couldn't save profile.", "error"); }
    finally { setSavingProfile(false); }
  }

  async function savePassword() {
    if (newPassword.length < 8) { toast.show("Password must be at least 8 characters.", "error"); return; }
    if (newPassword !== confirmPassword) { toast.show("Passwords don't match.", "error"); return; }
    setSavingPassword(true);
    try {
      await changePassword(newPassword);
      setNewPassword(""); setConfirmPassword("");
      toast.show("Password updated.", "success");
    } catch (e: any) { toast.show(e.message || "Couldn't update password.", "error"); }
    finally { setSavingPassword(false); }
  }

  return (
    <div>
      <h1 className="ss-h1" style={{ marginBottom: 4 }}>{t("settings.title")}</h1>
      <p className="ss-sub" style={{ marginBottom: 20 }}>{t("settings.subtitle")}</p>

      <section className="ss-card ss-card-pad" style={{ marginBottom: 16 }}>
        <h2 className="ss-h2" style={{ marginBottom: 14 }}>{t("settings.profile")}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <Avatar name={fullName} size="lg" />
          {/* Staff sign-in email shown here only — this is a login identifier, not a contact channel used elsewhere in the app. */}
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{staff?.email} · <span style={{ textTransform: "capitalize" }}>{staff?.role}</span></div>
        </div>
        <div className="ss-field"><label>{t("settings.fullName")}</label>
          <input className="ss-input" value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <button className="ss-btn ss-btn-primary" disabled={savingProfile} onClick={saveProfile}>
          {savingProfile ? t("common.saving") : t("settings.saveProfile")}
        </button>
      </section>

      <section className="ss-card ss-card-pad" style={{ marginBottom: 16 }}>
        <h2 className="ss-h2" style={{ marginBottom: 14 }}>{t("settings.language")}</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`ss-btn ${lang === l.code ? "ss-btn-primary" : "ss-btn-secondary"}`}
              onClick={() => setLang(l.code)}
            >
              {l.native}
            </button>
          ))}
        </div>
      </section>

      <section className="ss-card ss-card-pad" style={{ marginBottom: 16 }}>
        <h2 className="ss-h2" style={{ marginBottom: 14 }}>{t("settings.appearance")}</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={`ss-btn ${theme === "light" ? "ss-btn-primary" : "ss-btn-secondary"}`} onClick={() => setTheme("light")}>
            <Icon.Sun size={15} /> {t("settings.light")}
          </button>
          <button className={`ss-btn ${theme === "dark" ? "ss-btn-primary" : "ss-btn-secondary"}`} onClick={() => setTheme("dark")}>
            <Icon.Moon size={15} /> {t("settings.dark")}
          </button>
        </div>
      </section>

      <section className="ss-card ss-card-pad">
        <h2 className="ss-h2" style={{ marginBottom: 14 }}>{t("settings.changePassword")}</h2>
        <div className="ss-field"><label>{t("settings.newPassword")}</label>
          <input type="password" className="ss-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        {newPassword && (
          <div style={{ marginBottom: 12 }}>
            <div className="ss-progress-track"><div className="ss-progress-bar" style={{ width: `${strength.percent}%`, background: strength.color }} /></div>
            <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 4 }}>{strength.label}</div>
          </div>
        )}
        <div className="ss-field"><label>{t("settings.confirmPassword")}</label>
          <input type="password" className="ss-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        <button className="ss-btn ss-btn-primary" disabled={savingPassword || !newPassword} onClick={savePassword}>
          <Icon.Lock size={14} /> {savingPassword ? "Updating…" : t("settings.updatePassword")}
        </button>
      </section>
    </div>
  );
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { percent: 20, label: "Very weak", color: "var(--danger)" },
    { percent: 40, label: "Weak", color: "var(--danger)" },
    { percent: 60, label: "Okay", color: "var(--warning)" },
    { percent: 80, label: "Good", color: "var(--accent)" },
    { percent: 100, label: "Strong", color: "var(--success)" },
  ];
  return levels[Math.min(score, 4)];
}
