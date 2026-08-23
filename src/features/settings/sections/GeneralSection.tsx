import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { SettingsCard, SettingsInput, SettingsSelect, SettingsButton, ImageUpload } from "../components";
import { securitySettingsService } from "../services/security-settings.service";
import { uploadCompanyImage } from "../services/settings.service";

export default function GeneralSection() {
  const [user, setUser] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyImage, setCompanyImage] = useState<string | null>(null);

  // snapshot used to detect real changes (so Save only appears when something changed)
  const [savedProfile, setSavedProfile] = useState({ name: "", email: "", companyImage: null as string | null });

  const [language, setLanguage] = useState("en");
  const [savedLanguage, setSavedLanguage] = useState("en");

  const [currency, setCurrency] = useState("ETB");
  const [timezone, setTimezone] = useState("Africa/Addis_Ababa");
  const [calendar, setCalendar] = useState("gregorian");
  const [savedRegion, setSavedRegion] = useState({ currency: "ETB", timezone: "Africa/Addis_Ababa", calendar: "gregorian" });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    securitySettingsService
      .getUser()
      .then((u) => {
        const fullName = u.user_metadata?.full_name ?? u.user_metadata?.name ?? "";
        const img = u.user_metadata?.company_image_url ?? null;
        setUser(u);
        setName(fullName);
        setEmail(u.email ?? "");
        setCompanyImage(img);
        setSavedProfile({ name: fullName, email: u.email ?? "", companyImage: img });

        const lang = u.user_metadata?.language ?? "en";
        setLanguage(lang);
        setSavedLanguage(lang);

        const region = {
          currency: u.user_metadata?.currency ?? "ETB",
          timezone: u.user_metadata?.timezone ?? "Africa/Addis_Ababa",
          calendar: u.user_metadata?.calendar ?? "gregorian",
        };
        setCurrency(region.currency);
        setTimezone(region.timezone);
        setCalendar(region.calendar);
        setSavedRegion(region);
      })
      .catch((e) => setMsg(e.message));
  }, []);

  const profileDirty =
    editingProfile &&
    (name !== savedProfile.name || email !== savedProfile.email || companyImage !== savedProfile.companyImage);
  const languageDirty = language !== savedLanguage;
  const regionDirty =
    currency !== savedRegion.currency || timezone !== savedRegion.timezone || calendar !== savedRegion.calendar;

  const saveProfile = async () => {
    setSaving(true);
    setMsg("");
    try {
      const updated = await securitySettingsService.updateMetadata({
        full_name: name,
        name,
        company_image_url: companyImage,
      });

      if (email.trim().toLowerCase() !== (user?.email ?? "").toLowerCase()) {
        await securitySettingsService.changeEmail(email);
        setMsg("Profile saved. Check your inbox to confirm the new email.");
      } else {
        setMsg("Profile saved.");
      }

      setUser(updated);
      setSavedProfile({ name, email, companyImage });
      setEditingProfile(false);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditProfile = () => {
    setName(savedProfile.name);
    setEmail(savedProfile.email);
    setCompanyImage(savedProfile.companyImage);
    setEditingProfile(false);
  };

  const saveLanguage = async () => {
    setSaving(true);
    setMsg("");
    try {
      const updated = await securitySettingsService.updateMetadata({ language });
      setUser(updated);
      setSavedLanguage(language);
      setMsg("Language saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save language");
    } finally {
      setSaving(false);
    }
  };

  const saveRegion = async () => {
    setSaving(true);
    setMsg("");
    try {
      const updated = await securitySettingsService.updateMetadata({ currency, timezone, calendar });
      setUser(updated);
      setSavedRegion({ currency, timezone, calendar });
      setMsg("Region preferences saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save region");
    } finally {
      setSaving(false);
    }
  };

  const onImage = async (file: File | null) => {
    if (!file) {
      setCompanyImage(null);
      return;
    }
    try {
      setMsg("Uploading image…");
      const url = await uploadCompanyImage(file);
      // Cache-bust so the new image shows immediately instead of the old cached one.
      setCompanyImage(`${url}?t=${Date.now()}`);
      setMsg("Image uploaded — click Save profile to keep it.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Image upload failed");
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Profile" description="Your SEBA account profile.">
        {!editingProfile ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {companyImage ? (
                <img src={companyImage} alt="Profile" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-400">
                  {(name || email || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">{name || "No name set"}</p>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
            </div>
            <SettingsButton variant="secondary" onClick={() => setEditingProfile(true)}>
              <Pencil size={16} />
              Edit
            </SettingsButton>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
              <ImageUpload label="Profile image" value={companyImage} onChange={onImage} />
              <div className="grid gap-4">
                <SettingsInput label="Profile name" value={name} onChange={(e) => setName(e.target.value)} />
                <SettingsInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              {profileDirty && (
                <SettingsButton onClick={saveProfile} loading={saving}>
                  Save profile
                </SettingsButton>
              )}
              <SettingsButton variant="secondary" onClick={cancelEditProfile} disabled={saving}>
                Cancel
              </SettingsButton>
            </div>
          </>
        )}
        {msg && <p className="mt-4 text-sm text-gray-600">{msg}</p>}
      </SettingsCard>

      <SettingsCard title="Language" description="Choose the language used by your dashboard.">
        <SettingsSelect
          label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          options={[
            { label: "English", value: "en" },
            { label: "አማርኛ", value: "am" },
            { label: "Afaan Oromoo", value: "om" },
          ]}
        />
        {languageDirty && (
          <div className="mt-4">
            <SettingsButton onClick={saveLanguage} loading={saving}>
              Save language
            </SettingsButton>
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Region" description="Configure your regional preferences.">
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsInput label="Country" value="Ethiopia" disabled />
          <SettingsSelect
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { label: "ETB — Ethiopian Birr", value: "ETB" },
              { label: "USD — US Dollar", value: "USD" },
            ]}
          />
          <SettingsSelect
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            options={[{ label: "Africa/Addis_Ababa", value: "Africa/Addis_Ababa" }]}
          />
          <SettingsSelect
            label="Calendar"
            value={calendar}
            onChange={(e) => setCalendar(e.target.value)}
            options={[
              { label: "Gregorian", value: "gregorian" },
              { label: "Ethiopian", value: "ethiopian" },
            ]}
          />
        </div>
        {regionDirty && (
          <div className="mt-4">
            <SettingsButton onClick={saveRegion} loading={saving}>
              Save preferences
            </SettingsButton>
          </div>
        )}
      </SettingsCard>
    </div>
  );
}
