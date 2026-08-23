import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  SettingsButton,
  SettingsCard,
  SettingsInput,
  SettingsSelect,
  SettingsToggle,
} from "../components";
import { staffSettingsService } from "../services/staff-settings.service";
import { subscriptionSettingsService } from "../services/subscription-settings.service";
import type {
  StaffMember,
  StaffPermission,
  StaffPermissions,
  StaffRole,
} from "../types/staff-settings";

// Bug fix: staff account limits now match the plan — Basic = 1, Premium = 2,
// Enterprise = 4 — and accounts are disabled entirely while a subscription is
// inactive (unpaid), instead of silently allowing unlimited staff.
const STAFF_LIMITS: Record<string, number> = { basic: 1, premium: 2, enterprise: 4 };

const ROLE_PRESETS: Record<StaffRole, StaffPermissions> = {
  receptionist: {
    "dashboard.view": true,
    "appointments.view": true,
    "appointments.create": true,
    "appointments.edit": true,
    "appointments.cancel": true,
    "appointments.check_in": true,
    "appointments.complete": true,
    "appointments.scan_qr": true,
    "orders.view": true,
    "orders.create": true,
    "orders.edit": true,
    "orders.complete": true,
    "orders.scan_qr": true,
    "customers.view": true,
    "customers.create": true,
    "customers.edit": true,
    "customers.view_history": true,
    "customers.create_appointment": true,
    "notifications.view": true,
  },
  manager: {
    "dashboard.view": true,
    "appointments.view": true,
    "appointments.create": true,
    "appointments.edit": true,
    "appointments.cancel": true,
    "appointments.check_in": true,
    "appointments.complete": true,
    "appointments.scan_qr": true,
    "orders.view": true,
    "orders.create": true,
    "orders.edit": true,
    "orders.cancel": true,
    "orders.complete": true,
    "orders.scan_qr": true,
    "customers.view": true,
    "customers.create": true,
    "customers.edit": true,
    "customers.view_history": true,
    "customers.create_appointment": true,
    "analytics.view": true,
    "products.view": true,
    "products.create": true,
    "products.edit": true,
    "notifications.view": true,
    "customer_records.view": true,
    "customer_records.create": true,
    "customer_records.edit": true,
  },
  accountant: {
    "dashboard.view": true,
    "orders.view": true,
    "orders.complete": true,
    "customers.view": true,
    "customers.view_history": true,
    "analytics.view": true,
    "notifications.view": true,
  },
  custom: {},
};

const GROUPS: Array<{
  title: string;
  permissions: Array<{ key: StaffPermission; label: string }>;
}> = [
  {
    title: "Dashboard",
    permissions: [{ key: "dashboard.view", label: "View dashboard" }],
  },
  {
    title: "Appointments",
    permissions: [
      ["appointments.view", "View"],
      ["appointments.create", "Create"],
      ["appointments.edit", "Edit"],
      ["appointments.cancel", "Cancel"],
      ["appointments.check_in", "Check in"],
      ["appointments.complete", "Complete"],
      ["appointments.scan_qr", "Scan QR"],
    ].map(([key, label]) => ({ key: key as StaffPermission, label })),
  },
  {
    title: "Orders",
    permissions: [
      ["orders.view", "View"],
      ["orders.create", "Create"],
      ["orders.edit", "Edit"],
      ["orders.cancel", "Cancel"],
      ["orders.complete", "Complete"],
      ["orders.scan_qr", "Scan QR"],
    ].map(([key, label]) => ({ key: key as StaffPermission, label })),
  },
  {
    title: "Customers",
    permissions: [
      ["customers.view", "View"],
      ["customers.create", "Create"],
      ["customers.edit", "Edit"],
      ["customers.view_history", "View history"],
      ["customers.create_appointment", "Create appointment"],
    ].map(([key, label]) => ({ key: key as StaffPermission, label })),
  },
  {
    title: "Analytics",
    permissions: [{ key: "analytics.view", label: "View analytics" }],
  },
  {
    title: "Products",
    permissions: [
      ["products.view", "View"],
      ["products.create", "Create"],
      ["products.edit", "Edit"],
      ["products.delete", "Delete"],
    ].map(([key, label]) => ({ key: key as StaffPermission, label })),
  },
  {
    title: "Notifications",
    permissions: [{ key: "notifications.view", label: "View notifications" }],
  },
  {
    title: "Customer Records",
    permissions: [
      ["customer_records.view", "View"],
      ["customer_records.create", "Create"],
      ["customer_records.edit", "Edit"],
    ].map(([key, label]) => ({ key: key as StaffPermission, label })),
  },
];

function displayRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getPreset(role: StaffRole): StaffPermissions {
  return { ...ROLE_PRESETS[role] };
}

function PermissionEditor({
  permissions,
  onChange,
}: {
  permissions: StaffPermissions;
  onChange: (next: StaffPermissions) => void;
}) {
  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <div key={group.title} className="rounded-xl border border-gray-200">
          <div className="border-b bg-gray-50 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{group.title}</p>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2">
            {group.permissions.map(({ key, label }) => (
              <SettingsToggle
                key={key}
                checked={Boolean(permissions[key])}
                onChange={(checked) =>
                  onChange({ ...permissions, [key]: checked })
                }
                label={label}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StaffSection() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "receptionist" as StaffRole,
    branch_id: "",
    permissions: getPreset("receptionist"),
  });
  const [showCreate, setShowCreate] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<any>(null);

  const load = async () => {
    try {
      setError("");
      setStaff(await staffSettingsService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff.");
    }
  };

  useEffect(() => {
    void load();
    subscriptionSettingsService
      .getContext()
      .then(setSubscription)
      .catch(() => setSubscription(null));
  }, []);

  const activeCount = useMemo(
    () => staff.filter((member) => member.is_active).length,
    [staff]
  );

  const plan: string = subscription?.subscription?.plan ?? "basic";
  const subscriptionActive =
    subscription ? subscription.subscription?.status === "active" && !subscription.trialEnded : true;
  const staffLimit = STAFF_LIMITS[plan] ?? 1;
  const limitReached = activeCount >= staffLimit;
  const creationBlocked = !subscriptionActive || limitReached;

  function changeRole(role: StaffRole) {
    setForm((current) => ({
      ...current,
      role,
      permissions:
        role === "custom"
          ? current.permissions
          : getPreset(role),
    }));
  }

  async function createStaff() {
    if (!form.full_name.trim() || !form.email.trim() || !form.password) {
      setError("Full name, email, and password are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await staffSettingsService.create({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        branch_id: form.branch_id || null,
        permissions: form.permissions,
      });

      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "receptionist",
        branch_id: "",
        permissions: getPreset("receptionist"),
      });
      setShowCreate(false);
      setShowPermissions(false);
      setMessage("Staff account created. The staff account was created successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create staff.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStaff(id: string, changes: Partial<StaffMember>) {
    try {
      setError("");
      await staffSettingsService.update(id, changes);
      if (selected?.id === id) {
        setSelected((current) => current ? { ...current, ...changes } : current);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staff.");
    }
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Staff Accounts"
        description="Create staff accounts and control exactly what each person can access."
      >
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Active staff: {activeCount} / {staffLimit}
            </p>
            <p className="mt-1 text-xs text-gray-500 capitalize">
              {plan} plan{limitReached ? " — limit reached" : ""}
            </p>
          </div>
          <SettingsButton
            onClick={() => setShowCreate((value) => !value)}
            disabled={creationBlocked}
            title={
              !subscriptionActive
                ? "Your subscription is inactive — renew to add staff."
                : limitReached
                ? "You've reached your plan's staff limit — upgrade to add more."
                : undefined
            }
          >
            <UserPlus size={16} />
            Create Staff
          </SettingsButton>
        </div>

        {!subscriptionActive && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Your subscription isn't active, so all staff accounts are disabled and can't log in until it's renewed.
          </div>
        )}
        {subscriptionActive && limitReached && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            You've reached the {staffLimit}-account limit on the {plan} plan.{" "}
            <a href="/subscription" className="font-semibold underline">
              Upgrade to add more.
            </a>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {message}
          </div>
        )}

        <div className="space-y-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setSelected(selected?.id === member.id ? null : member)}
                >
                  <p className="font-semibold text-gray-900">{member.full_name}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <Mail size={14} />
                    {member.email}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {displayRole(member.role)}
                    {member.invitation_status === "pending" ? " · Invitation pending" : ""}
                  </p>
                </button>

                <div className="flex items-center gap-4">
                  <SettingsToggle
                    checked={member.is_active && subscriptionActive}
                    disabled={!subscriptionActive}
                    onChange={(value) => void updateStaff(member.id, { is_active: value })}
                    label={!subscriptionActive ? "Disabled (no subscription)" : member.is_active ? "Active" : "Disabled"}
                  />
                  {selected?.id === member.id ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>

              {selected?.id === member.id && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <SettingsSelect
                      label="Role"
                      value={member.role}
                      options={[
                        { value: "receptionist", label: "Receptionist" },
                        { value: "manager", label: "Manager" },
                        { value: "accountant", label: "Accountant" },
                        { value: "custom", label: "Custom" },
                      ]}
                      onChange={(event) =>
                        void updateStaff(member.id, {
                          role: event.target.value as StaffRole,
                          permissions: getPreset(event.target.value as StaffRole),
                        })
                      }
                    />
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <ShieldCheck size={16} />
                        Permissions
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Permissions are enforced by the backend, not only hidden in the UI.
                      </p>
                    </div>
                  </div>

                  {/* Bug fix: permissions previously rendered from an empty object when
                      member.permissions was missing, so nothing ever showed as checked. */}
                  <PermissionEditor
                    permissions={member.permissions ?? getPreset(member.role)}
                    onChange={(permissions) =>
                      void updateStaff(member.id, { permissions })
                    }
                  />
                </div>
              )}
            </div>
          ))}

          {staff.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-900">No staff accounts yet.</p>
              <p className="mt-1 text-sm text-gray-500">
                Create your first receptionist, manager, accountant, or custom staff account.
              </p>
            </div>
          )}
        </div>
      </SettingsCard>

      {showCreate && (
        <SettingsCard
          title="Create Staff"
          description="Choose a role preset, then adjust individual permissions before creating the account."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SettingsInput
              label="Full name"
              value={form.full_name}
              onChange={(event) =>
                setForm({ ...form, full_name: event.target.value })
              }
              placeholder="Hana Bekele"
            />
            <SettingsInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="hana@example.com"
            />
            <SettingsInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              placeholder="At least 6 characters"
              description="This password is used for the staff member's SEBA login."
            />
            <SettingsSelect
              label="Role"
              value={form.role}
              options={[
                { value: "receptionist", label: "Receptionist" },
                { value: "manager", label: "Manager" },
                { value: "accountant", label: "Accountant" },
                { value: "custom", label: "Custom" },
              ]}
              onChange={(event) => changeRole(event.target.value as StaffRole)}
            />
            <SettingsInput
              label="Branch"
              value={form.branch_id}
              onChange={(event) =>
                setForm({ ...form, branch_id: event.target.value })
              }
              placeholder="Enterprise branch ID (optional)"
              description="Branch assignment is optional until branches are configured."
            />
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="mb-3 text-sm font-semibold text-gray-900 underline underline-offset-4"
              onClick={() => setShowPermissions((value) => !value)}
            >
              {showPermissions ? "Hide permissions" : "Customize permissions"}
            </button>

            {showPermissions && (
              <PermissionEditor
                permissions={form.permissions}
                onChange={(permissions) => setForm({ ...form, permissions })}
              />
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <SettingsButton onClick={() => void createStaff()} loading={saving}>
              <Check size={16} />
              Create Staff
            </SettingsButton>
            <SettingsButton
              variant="secondary"
              onClick={() => setShowCreate(false)}
              disabled={saving}
            >
              Cancel
            </SettingsButton>
          </div>
        </SettingsCard>
      )}
    </div>
  );
}
