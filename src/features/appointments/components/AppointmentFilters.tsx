// src/features/Appointments/components/AppointmentFilters.tsx

import { Search } from "lucide-react";
import type { Appointment, AppointmentStatus } from "../types/appointment";

export type SortKey = "date_asc" | "date_desc" | "price_asc" | "price_desc" | "customer_asc";

export type FiltersState = {
  search: string;
  status: AppointmentStatus | "All";
  staff: string | "All";
  service: string | "All";
  dateFrom: string;
  dateTo: string;
  sort: SortKey;
};

export const DEFAULT_FILTERS: FiltersState = {
  search: "",
  status: "All",
  staff: "All",
  service: "All",
  dateFrom: "",
  dateTo: "",
  sort: "date_asc",
};

type Props = {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  appointments: Appointment[];
  dark: boolean;
};

const STATUSES: (AppointmentStatus | "All")[] = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "No-show",
  "Waitlisted",
];

export default function AppointmentFilters({ filters, onChange, appointments, dark }: Props) {
  const staffOptions = Array.from(
    new Set(appointments.flatMap((a) => (a.staff_members?.length ? a.staff_members : a.staff ? [a.staff] : [])))
  ).filter(Boolean);

  const serviceOptions = Array.from(
    new Set(appointments.flatMap((a) => (a.services?.length ? a.services : a.service ? [a.service] : [])))
  ).filter(Boolean);

  const inputClass = `rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10 ${
    dark ? "border-white/10 bg-[#242424] text-gray-100 placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
  }`;

  function set<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 ${dark ? "border-white/10 bg-[#1c1c1c]" : "border-gray-200 bg-white"}`}>
      <div className="relative min-w-[200px] flex-1">
        <Search size={16} className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${dark ? "text-gray-500" : "text-gray-400"}`} />
        <input
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search customer, phone, service..."
          className={`${inputClass} w-full pl-10`}
        />
      </div>

      <select value={filters.status} onChange={(e) => set("status", e.target.value as FiltersState["status"])} className={inputClass}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
        ))}
      </select>

      <select value={filters.staff} onChange={(e) => set("staff", e.target.value)} className={inputClass}>
        <option value="All">All staff</option>
        {staffOptions.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select value={filters.service} onChange={(e) => set("service", e.target.value)} className={inputClass}>
        <option value="All">All services</option>
        {serviceOptions.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className={inputClass} />
        <span className={dark ? "text-gray-500" : "text-gray-400"}>to</span>
        <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)} className={inputClass} />
      </div>

      <select value={filters.sort} onChange={(e) => set("sort", e.target.value as SortKey)} className={inputClass}>
        <option value="date_asc">Date (earliest)</option>
        <option value="date_desc">Date (latest)</option>
        <option value="price_asc">Price (low to high)</option>
        <option value="price_desc">Price (high to low)</option>
        <option value="customer_asc">Customer (A-Z)</option>
      </select>

      {(filters.search || filters.status !== "All" || filters.staff !== "All" || filters.service !== "All" || filters.dateFrom || filters.dateTo) && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className={`text-sm font-medium underline-offset-2 hover:underline ${dark ? "text-gray-400" : "text-gray-500"}`}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export function applyFilters(appointments: Appointment[], filters: FiltersState): Appointment[] {
  let result = appointments.filter((a) => {
    if (filters.status !== "All" && a.status !== filters.status) return false;

    if (filters.staff !== "All") {
      const staffList = a.staff_members?.length ? a.staff_members : a.staff ? [a.staff] : [];
      if (!staffList.includes(filters.staff)) return false;
    }

    if (filters.service !== "All") {
      const serviceList = a.services?.length ? a.services : a.service ? [a.service] : [];
      if (!serviceList.includes(filters.service)) return false;
    }

    if (filters.dateFrom && a.date < filters.dateFrom) return false;
    if (filters.dateTo && a.date > filters.dateTo) return false;

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const haystack = [a.customer, a.phone, a.service, ...(a.services || []), a.staff, ...(a.staff_members || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "date_desc":
        return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "customer_asc":
        return a.customer.localeCompare(b.customer);
      case "date_asc":
      default:
        return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
    }
  });

  return result;
}
