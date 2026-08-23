export type DangerZoneAction =
  | "pause_business"
  | "resume_business"
  | "unpublish_business"
  | "delete_business";

export type BusinessPauseState = {
  appointments_paused: boolean;
  orders_paused: boolean;
};

export type DeleteBusinessConfirmation = {
  confirmation: string;
};

export const DELETE_BUSINESS_TEXT =
  "DELETE BUSINESS";