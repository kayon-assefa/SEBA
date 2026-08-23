export type SecurityUser = {
  id: string;
  email: string | null;
};

export type PasswordChangeInput = {
  password: string;
  confirmPassword: string;
};

export type EmailChangeInput = {
  email: string;
};

export type SessionDevice = {
  id?: string;
  device: string;
  browser?: string;
  operating_system?: string;
  location?: string;
  last_active?: string;
  is_current?: boolean;
};

export type LoginActivity = {
  id?: string;
  date: string;
  device: string;
  location: string;
  success: boolean;
};