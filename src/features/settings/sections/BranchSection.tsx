import { useEffect, useState } from "react";
import { SettingsCard, SettingsInput, SettingsToggle, SettingsButton } from "../components";
import { branchSettingsService } from "../services/branch-settings.service";
import { subscriptionSettingsService } from "../services/subscription-settings.service";

export default function BranchSection() {
  const [branches, setBranches] = useState<any[]>([]);
  const [enterprise, setEnterprise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ name: "", username: "", phone: "", city: "", address: "", latitude: null, longitude: null, is_active: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const ctx = await subscriptionSettingsService.getContext();
      const isEnt = ctx.subscription.plan === "enterprise" && ctx.subscription.status !== "expired";
      setEnterprise(isEnt);
      if (isEnt) setBranches(await branchSettingsService.list());
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to load branches");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const set = (key: string, value: any) => setForm((x: any) => ({ ...x, [key]: value }));

  const create = async () => {
    if (!form.name.trim()) return setMsg("Branch name is required");
    setSaving(true);
    try {
      await branchSettingsService.create(form);
      setForm({ name: "", username: "", phone: "", city: "", address: "", latitude: null, longitude: null, is_active: true });
      await load();
      setMsg("Branch created");
    } catch (e) { setMsg(e instanceof Error ? e.message : "Failed to create branch"); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this branch?")) return;
    try { await branchSettingsService.remove(id); await load(); }
    catch (e) { setMsg(e instanceof Error ? e.message : "Failed to delete branch"); }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  if (!enterprise) return (
    <SettingsCard title="Branches" description="Branches are available only for Enterprise.">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="font-semibold text-gray-900">Enterprise plan required</p>
        <p className="mt-1 text-sm text-gray-500">Upgrade the business subscription to Enterprise to manage branches.</p>
      </div>
    </SettingsCard>
  );

  return (
    <div className="space-y-6">
      <SettingsCard title="Branches" description="Manage your Enterprise business locations.">
        <div className="space-y-3">
          {branches.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border p-4">
              <div><p className="font-semibold">{b.name}</p><p className="text-sm text-gray-500">{b.city || b.address || "No address"}</p></div>
              <div className="flex gap-2">
                <SettingsToggle checked={b.is_active} onChange={async (v) => { await branchSettingsService.update(b.id, { is_active: v }); await load(); }} />
                <SettingsButton variant="danger" onClick={() => remove(b.id)}>Delete</SettingsButton>
              </div>
            </div>
          ))}
          {branches.length === 0 && <p className="text-sm text-gray-500">No branches yet.</p>}
        </div>
      </SettingsCard>

      <SettingsCard title="Create branch">
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsInput label="Branch name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <SettingsInput label="Username" value={form.username} onChange={(e) => set("username", e.target.value)} />
          <SettingsInput label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <SettingsInput label="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
          <SettingsInput label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />
          <SettingsInput label="Latitude" type="number" value={form.latitude ?? ""} onChange={(e) => set("latitude", e.target.value === "" ? null : Number(e.target.value))} />
          <SettingsInput label="Longitude" type="number" value={form.longitude ?? ""} onChange={(e) => set("longitude", e.target.value === "" ? null : Number(e.target.value))} />
        </div>
        <div className="mt-4"><SettingsButton onClick={create} loading={saving}>Create branch</SettingsButton>{msg && <span className="ml-3 text-sm text-gray-600">{msg}</span>}</div>
      </SettingsCard>
    </div>
  );
}
