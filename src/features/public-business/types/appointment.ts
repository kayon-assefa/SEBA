export type AppointmentFieldType = "text" | "phone" | "email" | "number" | "textarea" | "select";

export interface PublicAppointmentField {
  id: string;
  name: string;
  label: string;
  type: AppointmentFieldType;
  required: boolean;
  options: string[];
  placeholder: string | null;
}

export interface PublicStaffMember {
  id: string;
  name: string;
  role: string | null;
  imageUrl: string | null;
  active: boolean;
}

export interface AppointmentDraft {
  businessId: string;
  serviceId: string;
  staffId?: string | null;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  customFields: Record<string, string>;
}

export interface AppointmentConfirmation {
  id: string;
  reference: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
}
