// src/features/Appointments/lib/availability.ts
//
// Pure, dependency-free scheduling logic: works off whatever appointments
// are already loaded on the page, so conflict checks and suggestions are
// instant (no extra network round trip) and always reflect the exact list
// the user is looking at.

import type { Appointment } from "../types/appointment";

export const BUSINESS_HOURS = { start: "09:00", end: "19:00" };
export const SLOT_STEP_MINUTES = 15;
export const DEFAULT_BUFFER_MINUTES = 10;

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function toTimeStr(totalMinutes: number): string {
  const clamped = Math.max(0, totalMinutes);
  const h = Math.floor(clamped / 60) % 24;
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function computeEndTime(time: string, duration: number): string {
  return toTimeStr(toMinutes(time) + Math.max(5, duration || 30));
}

interface ConflictParams {
  date: string;
  time: string;
  duration: number;
  staffMembers: string[];
  appointments: Appointment[];
  excludeId?: string | null;
  bufferMinutes?: number;
}

/** Appointments that would overlap the given slot for any of the requested staff. */
export function findConflicts({
  date,
  time,
  duration,
  staffMembers,
  appointments,
  excludeId = null,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
}: ConflictParams): Appointment[] {
  if (!staffMembers.length) return [];

  const start = toMinutes(time) - bufferMinutes;
  const end = toMinutes(time) + Math.max(5, duration || 30) + bufferMinutes;

  return appointments.filter((appointment) => {
    if (appointment.id === excludeId) return false;
    if (appointment.date !== date) return false;
    if (appointment.status === "Cancelled" || appointment.status === "Waitlisted") return false;

    const bookedStaff = appointment.staff_members?.length
      ? appointment.staff_members
      : appointment.staff
      ? [appointment.staff]
      : [];

    const sharesStaff = bookedStaff.some((s) => staffMembers.includes(s));
    if (!sharesStaff) return false;

    const aStart = toMinutes(appointment.time);
    const aEnd = toMinutes(appointment.end_time || computeEndTime(appointment.time, appointment.duration || 30));

    return start < aEnd && end > aStart;
  });
}

interface SuggestParams {
  date: string;
  duration: number;
  staffMembers: string[];
  appointments: Appointment[];
  excludeId?: string | null;
  bufferMinutes?: number;
  limit?: number;
}

/** Free slots for the given day/staff/duration, business hours aware. */
export function suggestAvailableSlots({
  date,
  duration,
  staffMembers,
  appointments,
  excludeId = null,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
  limit = 6,
}: SuggestParams): string[] {
  const dayStart = toMinutes(BUSINESS_HOURS.start);
  const dayEnd = toMinutes(BUSINESS_HOURS.end);
  const suggestions: string[] = [];

  for (let t = dayStart; t + Math.max(5, duration || 30) <= dayEnd; t += SLOT_STEP_MINUTES) {
    const time = toTimeStr(t);
    const conflicts = findConflicts({
      date,
      time,
      duration,
      staffMembers,
      appointments,
      excludeId,
      bufferMinutes,
    });
    if (conflicts.length === 0) {
      suggestions.push(time);
      if (suggestions.length >= limit) break;
    }
  }

  return suggestions;
}

/** Appointments that are still Pending/Confirmed but their end time has passed
 *  by more than `graceMinutes` - candidates to auto-flag as No-show. */
export function findOverdueForNoShow(
  appointments: Appointment[],
  graceMinutes = 30,
  now: Date = new Date()
): Appointment[] {
  return appointments.filter((a) => {
    if (a.status !== "Pending" && a.status !== "Confirmed") return false;
    const end = new Date(`${a.date}T${a.end_time || computeEndTime(a.time, a.duration || 30)}:00`);
    if (Number.isNaN(end.getTime())) return false;
    return now.getTime() - end.getTime() > graceMinutes * 60 * 1000;
  });
}

export function addDaysToDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Generates the list of dates for a recurring booking. */
export function buildRecurrenceDates(
  startDate: string,
  frequency: "none" | "weekly" | "biweekly" | "monthly",
  occurrences: number
): string[] {
  if (frequency === "none" || occurrences <= 1) return [startDate];

  const dates = [startDate];
  const stepDays = frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;

  for (let i = 1; i < occurrences; i++) {
    dates.push(addDaysToDate(startDate, stepDays * i));
  }

  return dates;
}
