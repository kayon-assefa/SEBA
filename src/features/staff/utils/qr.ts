import { supabase } from "../../../lib/supabase";
import type { ScanResult } from "../types";

/**
 * SEBA pass QR format
 * ---------------------------------------------------------------
 * Every appointment/order gets a short unique `qr_code` (see the SQL
 * migration). A customer-facing "SEBA pass" can encode ANY of:
 *
 *   SEBA:APPT:<qr_code>            -> looked up against appointments.qr_code
 *   SEBA:ORDER:<qr_code>           -> looked up against orders.qr_code
 *   https://.../order/<uuid>       -> the order receipt URL the Orders
 *                                      feature actually prints today
 *                                      (see Orders/lib/receipt.ts) — looked
 *                                      up against orders.id
 *   a bare code / bare uuid        -> tries qr_code, then id, on both tables
 *
 * WHY THIS MATTERS (the fix): the printed order receipt QR does NOT encode
 * a short qr_code — it encodes `https://seba.com/{slug}/order/{orderId}`
 * (the order's UUID). The old scanner only ever checked `qr_code`, so a
 * real customer receipt would never resolve — every scan of an actual
 * printed pass came back "not found". This version pulls the id out of
 * that URL and also matches by `orders.id`, so today's real receipts work
 * without waiting on any change to the Orders feature. If you later add a
 * dedicated `qr_code` column value to that same QR, this keeps working too.
 */

export type ParsedCode =
  | { kind: "appointment" | "order"; matchBy: "qr_code" | "id"; code: string }
  | { kind: "unknown"; matchBy: "qr_code" | "id"; code: string };

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function parseSebaCode(raw: string): ParsedCode {
  const text = raw.trim();

  // 1. Explicit SEBA:APPT:<code> / SEBA:ORDER:<code>
  const prefixed = /^SEBA:(APPT|ORDER):(.+)$/i.exec(text);
  if (prefixed) {
    const kind = prefixed[1].toUpperCase() === "APPT" ? "appointment" : "order";
    return { kind, matchBy: "qr_code", code: prefixed[2].trim() };
  }

  // 2. A URL — pull the UUID out of it and figure out order vs appointment
  //    from the path (works with the current .../order/<uuid> receipt link,
  //    and with a hypothetical .../appointment/<uuid> link too).
  if (/^https?:\/\//i.test(text)) {
    const uuidMatch = UUID_RE.exec(text);
    if (uuidMatch) {
      const isAppointment = /appointment/i.test(text);
      return { kind: isAppointment ? "appointment" : "order", matchBy: "id", code: uuidMatch[0] };
    }
    return { kind: "unknown", matchBy: "id", code: text };
  }

  // 3. A bare UUID (no URL wrapper) — treat as an id, try both tables.
  if (UUID_RE.test(text) && text.length <= 40) {
    return { kind: "unknown", matchBy: "id", code: UUID_RE.exec(text)![0] };
  }

  // 4. A bare short code — try both tables against qr_code.
  return { kind: "unknown", matchBy: "qr_code", code: text };
}

export async function resolveScannedCode(raw: string, businessId: string): Promise<ScanResult> {
  const parsed = parseSebaCode(raw);

  async function tryAppointment(code: string, matchBy: "qr_code" | "id") {
    const { data } = await supabase
      .from("appointments").select("*")
      .eq("business_id", businessId).eq(matchBy, code).maybeSingle();
    return data;
  }
  async function tryOrder(code: string, matchBy: "qr_code" | "id") {
    const { data } = await supabase
      .from("orders").select("*")
      .eq("business_id", businessId).eq(matchBy, code).maybeSingle();
    return data;
  }

  if (parsed.kind === "appointment") {
    const record = await tryAppointment(parsed.code, parsed.matchBy);
    if (record) return { kind: "appointment", record };
    return { kind: "not_found", raw };
  }
  if (parsed.kind === "order") {
    const record = await tryOrder(parsed.code, parsed.matchBy);
    if (record) return { kind: "order", record };
    return { kind: "not_found", raw };
  }

  // Unknown shape — try both tables, both match strategies, before giving up.
  const order = await tryOrder(parsed.code, parsed.matchBy);
  if (order) return { kind: "order", record: order };
  const appt = await tryAppointment(parsed.code, parsed.matchBy);
  if (appt) return { kind: "appointment", record: appt };

  // Last resort: if we guessed "id" but it was actually a short qr_code
  // (or vice versa), try the other match strategy once before failing.
  const altBy = parsed.matchBy === "id" ? "qr_code" : "id";
  const orderAlt = await tryOrder(parsed.code, altBy);
  if (orderAlt) return { kind: "order", record: orderAlt };
  const apptAlt = await tryAppointment(parsed.code, altBy);
  if (apptAlt) return { kind: "appointment", record: apptAlt };

  return { kind: "not_found", raw };
}
