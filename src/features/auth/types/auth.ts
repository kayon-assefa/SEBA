export type AccountType = "owner" | "staff";

export type LoginMode = AccountType;

export type StaffAuthProfile = {
  user_id: string;
  business_id: string;
  full_name: string | null;
  role: string | null;
  status: string | null;
};
