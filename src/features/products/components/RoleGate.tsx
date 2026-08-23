import type { ReactNode } from "react";
import type { UserRole } from "../types/catalog";

type Props = {
  role: UserRole;
  allow: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

// Feature #58 - role-based permissions. Wrap any control that only
// owners (or another allowed role) should see/use.
export default function RoleGate({ role, allow, children, fallback = null }: Props) {
  if (!allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
