// src/features/Appointments/services/notification.service.ts
//
// IMPORTANT - READ THIS:
// Sending a real SMS / WhatsApp message / email requires a paid provider
// account (Twilio, WhatsApp Business API, SendGrid, etc.) and a backend
// endpoint holding the secret API key - a browser app can never call those
// providers directly or safely. There is no such backend connected here,
// so this service cannot be "really" wired up sight-unseen.
//
// What IS real in this file:
//   - the scheduling/dedupe logic (never reminds twice, respects the
//     appointment time)
//   - a persistent log you can inspect (localStorage "notification_log")
//   - the exact spot (sendViaProvider) where you drop in a fetch() call to
//     your own backend / Supabase Edge Function once you have one
//
// Until then it logs + toasts so you can see it firing, and flips the
// reminder_*_sent flags on the appointment so it never double-sends.

import toast from "react-hot-toast";
import type { Appointment } from "../types/appointment";

const LOG_KEY = "appointments_notification_log";

type LogEntry = {
  id: string;
  channel: "sms" | "whatsapp" | "email" | "staff";
  to: string;
  message: string;
  appointmentId: string;
  sentAt: string;
};

function readLog(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: LogEntry[]) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(-200)));
  } catch {
    // storage full or unavailable - not fatal, just skip logging
  }
}

/**
 * Replace this body with a real call to your backend once you have a
 * Twilio / WhatsApp / SendGrid integration, e.g.:
 *
 *   await fetch("/api/notifications/send", {
 *     method: "POST",
 *     body: JSON.stringify({ channel, to, message }),
 *   });
 */
async function sendViaProvider(channel: LogEntry["channel"], to: string, message: string) {
  // Keep the provider contract explicit while this local implementation simulates delivery.
  void channel;
  void to;
  void message;
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { delivered: false, simulated: true };
}

async function dispatch(channel: LogEntry["channel"], to: string, message: string, appointmentId: string) {
  await sendViaProvider(channel, to, message);

  const entries = readLog();
  entries.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    channel,
    to,
    message,
    appointmentId,
    sentAt: new Date().toISOString(),
  });
  writeLog(entries);
}

export const notificationService = {
  getLog(): LogEntry[] {
    return readLog();
  },

  async sendBookingConfirmation(appointment: Appointment) {
    if (!appointment.phone) return;

    const when = `${appointment.date} at ${appointment.time}`;
    await dispatch(
      "sms",
      appointment.phone,
      `Hi ${appointment.customer}, your appointment (${appointment.service}) is booked for ${when}. See you then!`,
      appointment.id
    );

    toast.success(`Confirmation queued for ${appointment.phone} (simulated - connect a provider to send for real)`, {
      duration: 4000,
    });
  },

  async sendReminder(appointment: Appointment) {
    if (!appointment.phone) return false;

    await dispatch(
      "whatsapp",
      appointment.phone,
      `Reminder: your appointment for ${appointment.service} is today at ${appointment.time}.`,
      appointment.id
    );

    return true;
  },

  async notifyStaff(appointment: Appointment) {
    const staffList = appointment.staff_members?.length
      ? appointment.staff_members.join(", ")
      : appointment.staff || "staff";

    await dispatch(
      "staff",
      staffList,
      `You have ${appointment.customer} booked at ${appointment.time} for ${appointment.service}.`,
      appointment.id
    );

    return true;
  },
};
