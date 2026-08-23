// File: src/features/onboarding/types/appointmentField.ts
export interface AppointmentFieldData {
  label: string;
  field_type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}