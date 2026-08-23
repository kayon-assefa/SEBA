export type StaffRole = "receptionist" | "manager" | "accountant" | "custom";

export type StaffPermission =
  | "dashboard.view"
  | "appointments.view"
  | "appointments.create"
  | "appointments.edit"
  | "appointments.cancel"
  | "appointments.check_in"
  | "appointments.complete"
  | "appointments.scan_qr"
  | "orders.view"
  | "orders.create"
  | "orders.edit"
  | "orders.cancel"
  | "orders.complete"
  | "orders.scan_qr"
  | "customers.view"
  | "customers.create"
  | "customers.edit"
  | "customers.view_history"
  | "customers.create_appointment"
  | "analytics.view"
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "notifications.view"
  | "customer_records.view"
  | "customer_records.create"
  | "customer_records.edit";

export type StaffPermissions = Partial<Record<StaffPermission, boolean>>;

export type StaffMember = {
  id: string;
  business_id: string;
  user_id: string | null;
  branch_id?: string | null;
  full_name: string;
  email: string;
  role: StaffRole;
  permissions?: StaffPermissions | null;
  is_active: boolean;
  invitation_status?: "pending" | "accepted" | "disabled" | null;
  created_at: string;
  updated_at: string;
};

export type CreateStaffInput = {
  full_name: string;
  email: string;
  role: StaffRole;
  branch_id?: string | null;
  permissions: StaffPermissions;
  password: string;
};

export type UpdateStaffInput = Partial<Pick<
  StaffMember,
  "full_name" | "email" | "role" | "branch_id" | "permissions" | "is_active"
>>;

export type StaffRolePermissions = {
  role: StaffRole;
  permissions: StaffPermissions;
  password: string;
};
