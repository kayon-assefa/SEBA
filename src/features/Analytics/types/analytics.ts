export type AnalyticsRange =
  | "today"
  | "7d"
  | "30d"
  | "3m"
  | "custom";

export type AnalyticsEventType =
  | "page_view"
  | "visitor"
  | "appointment_click"
  | "shop_visit"
  | "appointment"
  | "order"
  | "customer";

export type AnalyticsOverview = {
  visitors: number;
  appointments: number;
  orders: number;
  newCustomers: number;

  visitorsChange: number;
  appointmentsChange: number;
  ordersChange: number;
  newCustomersChange: number;
};

export type TrafficPoint = {
  label: string;
  visitors: number;
  pageViews: number;
};

export type DayTraffic = {
  day: string;
  visitors: number;
};

export type PeakHour = {
  day: string;
  hour: number;
  value: number;
};

export type BreakdownItem = {
  label: string;
  value: number;
  percentage: number;
};

export type AppointmentAnalytics = {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  noShow: number;
};

export type CustomerAnalytics = {
  newCustomers: number;
  returningCustomers: number;
};

export type PagePerformance = {
  pageViews: number;
  uniqueVisitors: number;
  appointmentClicks: number;
  shopVisits: number;
  bookingConversion: number;
};

export type AnalyticsData = {
  overview: AnalyticsOverview;

  traffic: TrafficPoint[];

  trafficByDay: DayTraffic[];

  peakHours: PeakHour[];

  geography: BreakdownItem[];

  sources: BreakdownItem[];

  appointments: AppointmentAnalytics;

  customers: CustomerAnalytics;

  popularServices: BreakdownItem[];

  topProducts: {
    label: string;
    value: number;
  }[];

  pagePerformance: PagePerformance;
};