export type IntegrationStatus =
  | "connected"
  | "disconnected"
  | "error";

export type IntegrationProvider =
  | "chapa"
  | "afripay"
  | "google_calendar"
  | "google_analytics"
  | "instagram"
  | "facebook"
  | "tiktok";

export type BusinessIntegration = {
  id: string;
  business_id: string;

  provider: string;

  status: IntegrationStatus;

  external_account_id: string | null;

  connected_at: string | null;

  metadata: Record<
    string,
    unknown
  >;

  created_at: string;
  updated_at: string;
};

export type ConnectIntegrationInput = {
  provider: IntegrationProvider;

  externalAccountId?: string | null;

  metadata?: Record<
    string,
    unknown
  >;
};

export type IntegrationCard = {
  provider: IntegrationProvider;

  name: string;
  description: string;

  status: IntegrationStatus;

  connected: boolean;
};