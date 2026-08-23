import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { usePublicBusiness } from "../hooks/usePublicBusiness";
import type {
  PublicAppointmentField,
  PublicStaffMember,
} from "../types/appointment";

function money(value: number | null | undefined) {
  if (value == null) return "Price on request";

  return `${new Intl.NumberFormat("en-US").format(value)} ETB`;
}

function todayString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createReference(id: string) {
  return `SEBA-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

function formatTime(time: string) {
  const [hourString, minuteString] = time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function PublicAppointmentPage() {
  const { username = "" } = useParams<{
    username: string;
  }>();

  const {
    business,
    loading,
    error: businessError,
  } = usePublicBusiness(username);

  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");

  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [customFields, setCustomFields] = useState<
    Record<string, string>
  >({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmation, setConfirmation] = useState<{
    id: string;
    reference: string;
  } | null>(null);

  const selectedService = business?.services.find(
    (service) => service.id === serviceId
  );

  const staff = useMemo(
    () =>
      ((business?.staff ?? []) as PublicStaffMember[]).filter(
        (member) => member.active !== false
      ),
    [business?.staff]
  );

  const fields = useMemo(
    () =>
      ((business?.appointmentFields ??
        []) as PublicAppointmentField[]),
    [business?.appointmentFields]
  );

  /*
   * ------------------------------------------------------------
   * AVAILABLE TIMES
   * ------------------------------------------------------------
   *
   * Uses the business_working_hours table.
   *
   * We are NOT using timezone calculations here.
   * The business hours are treated as the local business hours.
   */
  const availableTimes = useMemo(() => {
    if (!business || !date) {
      return [];
    }

    const selectedDate = new Date(`${date}T12:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      return [];
    }

    const dayOfWeek = selectedDate.getDay();

    const hours = business.workingHours.find(
      (item) => item.dayOfWeek === dayOfWeek
    );

    if (
      !hours ||
      !hours.isOpen ||
      !hours.openTime ||
      !hours.closeTime
    ) {
      return [];
    }

    const [openHour, openMinute] = hours.openTime
      .split(":")
      .map(Number);

    const [closeHour, closeMinute] = hours.closeTime
      .split(":")
      .map(Number);

    if (
      !Number.isFinite(openHour) ||
      !Number.isFinite(openMinute) ||
      !Number.isFinite(closeHour) ||
      !Number.isFinite(closeMinute)
    ) {
      return [];
    }

    const start = openHour * 60 + openMinute;
    const end = closeHour * 60 + closeMinute;

    /*
     * 30-minute booking slots.
     */
    const slots: string[] = [];

    for (let minutes = start; minutes < end; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      slots.push(
        `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}:00`
      );
    }

    return slots;
  }, [business, date]);

  /*
   * ------------------------------------------------------------
   * LOADING
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDFC] px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[#F25F5C]" />

          <p className="mt-4 text-sm text-neutral-500">
            Loading appointment booking...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------------------------
   * BUSINESS NOT FOUND
   * ------------------------------------------------------------
   */

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDFC] px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-black text-neutral-900">
            Business Not Found
          </h1>

          <p className="mt-3 text-neutral-500">
            {businessError?.message ??
              "We couldn't find this business."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-[#F25F5C] px-5 py-3 font-bold text-white"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------------------------
   * UNPUBLISHED
   * ------------------------------------------------------------
   */

  if (!business.published) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDFC] px-6">
        <div className="max-w-md text-center">
          <div className="text-5xl">🔒</div>

          <h1 className="mt-5 text-3xl font-black">
            Currently Unavailable
          </h1>

          <p className="mt-3 text-neutral-500">
            This business is currently unavailable for public
            bookings.
          </p>

          <Link
            to={`/${business.username}`}
            className="mt-6 inline-flex rounded-xl bg-[#F25F5C] px-5 py-3 font-bold text-white"
          >
            Back to Business
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------------------------
   * CLOSED / PAUSED
   * ------------------------------------------------------------
   */

  const bookingDisabled =
    business.temporarilyClosed ||
    business.appointmentsPaused === true;

  /*
   * ------------------------------------------------------------
   * CONFIRMATION
   * ------------------------------------------------------------
   */

  if (confirmation) {
    const qrText =
      `${window.location.origin}/${business.username}/book` +
      `?appointment=${encodeURIComponent(
        confirmation.reference
      )}`;

    return (
      <main className="min-h-screen bg-[#FFFDFC] px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_50px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✓
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#F25F5C]">
                SEBA Booking
              </p>

              <h1 className="mt-2 text-3xl font-black text-neutral-900 sm:text-4xl">
                Appointment Confirmed
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-neutral-500">
                Your appointment with{" "}
                <strong className="text-neutral-900">
                  {business.name}
                </strong>{" "}
                has been successfully submitted.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-neutral-50 p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Appointment ID
                  </p>

                  <p className="mt-2 break-all text-lg font-black text-neutral-900">
                    {confirmation.id}
                  </p>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    SEBA Reference
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#F25F5C]">
                    {confirmation.reference}
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    <img
                      src={`https://quickchart.io/qr?text=${encodeURIComponent(
                        qrText
                      )}&size=200`}
                      alt="Appointment QR code"
                      className="h-44 w-44"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-6">
                <p className="text-sm font-bold text-neutral-400">
                  Business
                </p>

                <p className="mt-1 text-lg font-black">
                  {business.name}
                </p>

                {selectedService && (
                  <>
                    <p className="mt-5 text-sm font-bold text-neutral-400">
                      Service
                    </p>

                    <p className="mt-1 font-bold">
                      {selectedService.name}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {money(selectedService.price)}
                      {selectedService.durationMinutes
                        ? ` · ${selectedService.durationMinutes} minutes`
                        : ""}
                    </p>
                  </>
                )}

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-bold text-neutral-400">
                      Date
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatDate(date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-neutral-400">
                      Time
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatTime(time)}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-bold text-neutral-400">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold">
                    {name}
                  </p>

                  <p className="text-sm text-neutral-500">
                    {phone}
                  </p>

                  {email && (
                    <p className="text-sm text-neutral-500">
                      {email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/${business.username}`}
                className="flex-1 rounded-xl bg-[#F25F5C] px-5 py-4 text-center font-bold text-white"
              >
                Back to Business
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded-xl border border-neutral-200 px-5 py-4 font-bold text-neutral-800"
              >
                Save / Print
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------------------------
   * SUBMIT
   * ------------------------------------------------------------
   */

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (bookingDisabled) {
      setError(
        "This business is currently not accepting appointments."
      );
      return;
    }

    if (!selectedService) {
      setError("Please choose a service.");
      return;
    }

    if (!date) {
      setError("Please choose a date.");
      return;
    }

    if (!time) {
      setError("Please choose an available time.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    for (const field of fields) {
      if (
        field.required &&
        !customFields[field.id]?.trim()
      ) {
        setError(
          `Please complete ${field.label}.`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      /*
       * IMPORTANT:
       *
       * This matches the REAL appointments table you gave us.
       *
       * Required columns:
       * business_id
       * customer
       * service
       * staff
       * date
       * time
       *
       * Optional:
       * phone
       * notes
       * price
       *
       * status has a database default, but we explicitly
       * provide Pending.
       */

      const customerNotes = [
        notes.trim()
          ? `Notes: ${notes.trim()}`
          : "",

        Object.entries(customFields)
          .map(([fieldId, value]) => {
            if (!value?.trim()) return "";

            const field = fields.find(
              (item) => item.id === fieldId
            );

            return `${field?.label ?? fieldId}: ${value.trim()}`;
          })
          .filter(Boolean)
          .join("\n"),
      ]
        .filter(Boolean)
        .join("\n");

      const staffName =
        staff.find(
          (member) => member.id === staffId
        )?.name ?? "Any available";

      /*
       * EXACT DATABASE PAYLOAD.
       */
      const { data, error: insertError } =
        await supabase
          .from("appointments")
          .insert({
            business_id: business!.id,

            customer: name.trim(),

            phone: phone.trim() || null,

            service: selectedService.name,

            staff: staffName,

            date,

            time,

            status: "Pending",

            notes:
              customerNotes || null,

            price:
              selectedService.price ?? 0,
          })
          .select("id")
          .single();

      if (insertError) {
        console.error(
          "SEBA appointment insert error:",
          insertError
        );

        throw new Error(
          insertError.message ||
            "Unable to create appointment."
        );
      }

      if (!data?.id) {
        throw new Error(
          "Appointment was created but no appointment ID was returned."
        );
      }

      const appointmentReference =
        createReference(data.id);

      setConfirmation({
        id: String(data.id),
        reference: appointmentReference,
      });
    } catch (submitError) {
      console.error(
        "SEBA public appointment error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not save the appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ------------------------------------------------------------
   * PAGE
   * ------------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#FFFDFC] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link
          to={`/${business.username}`}
          className="inline-flex items-center text-sm font-bold text-neutral-600 transition hover:text-[#F25F5C]"
        >
          ← Back to {business.name}
        </Link>

        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F25F5C]">
              Appointment
            </p>

            {business.verified && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                ✓ Verified Business
              </span>
            )}
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl">
            Book an appointment
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-500">
            Choose a service, select a convenient time,
            and provide your contact information.
          </p>
        </div>

        {bookingDisabled && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-black">
              Booking is currently unavailable.
            </p>

            {business.temporaryCloseReason && (
              <p className="mt-1 text-sm">
                {business.temporaryCloseReason}
              </p>
            )}

            {business.appointmentsPaused &&
              !business.temporarilyClosed && (
                <p className="mt-1 text-sm">
                  This business has temporarily paused
                  appointments.
                </p>
              )}
          </div>
        )}

        <form
          onSubmit={submit}
          className="mt-8 space-y-8 rounded-[28px] bg-white p-6 shadow-[0_12px_50px_rgba(0,0,0,0.06)] sm:p-9"
        >
          {/* SERVICE */}

          <section>
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#F25F5C]">
                Step 1
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Choose a service
              </h2>
            </div>

            {business.services.length === 0 ? (
              <div className="rounded-2xl bg-neutral-50 p-5 text-neutral-500">
                This business has no services available
                for online booking yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {business.services
                  .filter(
                    (service) =>
                      service.available !== false
                  )
                  .map((service) => {
                    const selected =
                      service.id === serviceId;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        disabled={bookingDisabled}
                        onClick={() => {
                          setServiceId(service.id);
                          setTime("");
                        }}
                        className={`w-full rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-[#F25F5C] bg-[#FFF5F4] ring-2 ring-[#F25F5C]/20"
                            : "border-neutral-200 hover:border-[#F25F5C]/50"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <h3 className="font-black text-neutral-900">
                              {service.name}
                            </h3>

                            {service.description && (
                              <p className="mt-1 text-sm leading-6 text-neutral-500">
                                {service.description}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2 text-sm">
                              <span className="rounded-full bg-neutral-100 px-3 py-1 font-bold">
                                {money(service.price)}
                              </span>

                              {service.durationMinutes && (
                                <span className="rounded-full bg-neutral-100 px-3 py-1">
                                  {service.durationMinutes} min
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-[#F25F5C] bg-[#F25F5C] text-white"
                                : "border-neutral-300"
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </section>

          {/* STAFF */}

          {staff.length > 0 && (
            <section className="border-t border-neutral-100 pt-8">
              <div className="mb-4">
                <p className="text-xs font-black uppercase tracking-wider text-[#F25F5C]">
                  Step 2
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Choose staff
                </h2>
              </div>

              <select
                value={staffId}
                onChange={(event) =>
                  setStaffId(event.target.value)
                }
                disabled={bookingDisabled}
                className="w-full rounded-xl border border-neutral-200 bg-white p-4 outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
              >
                <option value="">
                  Any available
                </option>

                {staff.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.name}
                    {member.role
                      ? ` — ${member.role}`
                      : ""}
                  </option>
                ))}
              </select>
            </section>
          )}

          {/* DATE + TIME */}

          <section className="border-t border-neutral-100 pt-8">
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#F25F5C]">
                Step {staff.length > 0 ? "3" : "2"}
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Choose date and time
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="font-bold">
                  Date *
                </span>

                <input
                  type="date"
                  min={todayString()}
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setTime("");
                  }}
                  disabled={bookingDisabled}
                  className="mt-2 w-full rounded-xl border border-neutral-200 p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                  required
                />
              </label>

              <label className="block">
                <span className="font-bold">
                  Time *
                </span>

                <select
                  value={time}
                  onChange={(event) =>
                    setTime(event.target.value)
                  }
                  disabled={
                    bookingDisabled ||
                    availableTimes.length === 0
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                  required
                >
                  <option value="">
                    {availableTimes.length === 0
                      ? "No times available"
                      : "Choose a time"}
                  </option>

                  {availableTimes.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatTime(slot)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {availableTimes.length === 0 && (
              <p className="mt-3 text-sm text-neutral-500">
                This date is outside the business's
                configured working hours.
              </p>
            )}
          </section>

          {/* CUSTOMER */}

          <section className="border-t border-neutral-100 pt-8">
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#F25F5C]">
                Step {staff.length > 0 ? "4" : "3"}
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Your information
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="font-bold">
                  Full name *
                </span>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  disabled={bookingDisabled}
                  className="mt-2 w-full rounded-xl border border-neutral-200 p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                  placeholder="Your full name"
                  required
                />
              </label>

              <label className="block">
                <span className="font-bold">
                  Phone *
                </span>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  disabled={bookingDisabled}
                  className="mt-2 w-full rounded-xl border border-neutral-200 p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                  placeholder="+251..."
                  required
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="font-bold">
                Email
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={bookingDisabled}
                className="mt-2 w-full rounded-xl border border-neutral-200 p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                placeholder="you@example.com"
              />
            </label>
          </section>

          {/* CUSTOM FIELDS */}

          {fields.length > 0 && (
            <section className="border-t border-neutral-100 pt-8">
              <div className="mb-4">
                <p className="text-xs font-black uppercase tracking-wider text-[#F25F5C]">
                  Additional information
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  A few more details
                </h2>
              </div>

              <div className="space-y-5">
                {fields.map((field) => {
                  const value =
                    customFields[field.id] ?? "";

                  const update = (
                    nextValue: string
                  ) => {
                    setCustomFields((current) => ({
                      ...current,
                      [field.id]: nextValue,
                    }));
                  };

                  return (
                    <label
                      key={field.id}
                      className="block"
                    >
                      <span className="font-bold">
                        {field.label}

                        {field.required && " *"}
                      </span>

                      {field.type === "textarea" ? (
                        <textarea
                          value={value}
                          onChange={(event) =>
                            update(
                              event.target.value
                            )
                          }
                          disabled={bookingDisabled}
                          placeholder={
                            field.placeholder ?? ""
                          }
                          className="mt-2 min-h-28 w-full rounded-xl border border-neutral-200 p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                          required={field.required}
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={value}
                          onChange={(event) =>
                            update(
                              event.target.value
                            )
                          }
                          disabled={bookingDisabled}
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                          required={field.required}
                        >
                          <option value="">
                            Choose an option
                          </option>

                          {field.options.map(
                            (option) => (
                              <option
                                key={option}
                                value={option}
                              >
                                {option}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <input
                          type={
                            field.type === "phone"
                              ? "tel"
                              : field.type
                          }
                          value={value}
                          onChange={(event) =>
                            update(
                              event.target.value
                            )
                          }
                          disabled={bookingDisabled}
                          placeholder={
                            field.placeholder ?? ""
                          }
                          className="mt-2 w-full rounded-xl border border-neutral-200 p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                          required={field.required}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* NOTES */}

          <section className="border-t border-neutral-100 pt-8">
            <label className="block">
              <span className="font-bold">
                Notes
              </span>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                disabled={bookingDisabled}
                className="mt-2 min-h-28 w-full rounded-xl border border-neutral-200 p-4 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/20"
                placeholder="Anything the business should know?"
              />
            </label>
          </section>

          {/* ERROR */}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* SUMMARY */}

          {selectedService && (
            <div className="rounded-2xl bg-neutral-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
                Booking summary
              </p>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black">
                    {selectedService.name}
                  </p>

                  {date && time && (
                    <p className="text-sm text-neutral-500">
                      {formatDate(date)} ·{" "}
                      {formatTime(time)}
                    </p>
                  )}
                </div>

                <p className="text-xl font-black">
                  {money(selectedService.price)}
                </p>
              </div>
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              bookingDisabled ||
              submitting ||
              !selectedService ||
              !date ||
              !time ||
              !name.trim() ||
              !phone.trim()
            }
            className="w-full rounded-2xl bg-[#F25F5C] px-6 py-4 text-lg font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Booking appointment..."
              : "Confirm Appointment"}
          </button>

          <p className="text-center text-xs leading-5 text-neutral-400">
            By submitting this form, your appointment
            information will be sent to{" "}
            {business.name}.
          </p>
        </form>
      </div>
    </main>
  );
}
