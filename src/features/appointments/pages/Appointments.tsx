// File: src/features/Appointments/pages/Appointments.tsx

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Table2, CalendarDays, Kanban } from "lucide-react";

import AppointmentFilters, { applyFilters, DEFAULT_FILTERS, type FiltersState } from "../components/AppointmentFilters";
import AppointmentTable from "../components/AppointmentTable";
import AppointmentCalendarView from "../components/AppointmentCalendarView";
import AppointmentKanbanView from "../components/AppointmentKanbanView";
import AppointmentDrawer from "../components/AppointmentDrawer";
import AppointmentFormModal from "../components/AppointmentFormModal";
import InvoiceModal from "../components/InvoiceModal";
import StatsHeader from "../components/StatsHeader";
import { useDarkMode } from "../hooks/useDarkMode";

import { appointmentService } from "../services/appointment.service";

import type { Appointment, AppointmentStatus, CreateAppointment } from "../types/appointment";
import { BookingConflictError } from "../types/appointment";

type ViewMode = "table" | "calendar" | "kanban";
type DateTab = "today" | "upcoming" | "past" | "all";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Appointments() {
  const { isDark } = useDarkMode();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [dateTab, setDateTab] = useState<DateTab>("upcoming");
  const [view, setView] = useState<ViewMode>("table");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState<Appointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [invoiceFor, setInvoiceFor] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments();

      const flagged = await appointmentService.autoFlagNoShows(data);
      const merged = flagged.length ? data.map((a) => (flagged.includes(a.id) ? { ...a, status: "No-show" as const } : a)) : data;

      setAppointments(merged);
    } catch (error) {
      console.error("Appointments load error:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  const byDateTab = useMemo(() => {
    const today = todayStr();
    return appointments.filter((a) => {
      if (dateTab === "today") return a.date === today;
      if (dateTab === "upcoming") return a.date >= today;
      if (dateTab === "past") return a.date < today;
      return true;
    });
  }, [appointments, dateTab]);

  const visible = useMemo(() => applyFilters(byDateTab, filters), [byDateTab, filters]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(appointment: Appointment) {
    setEditing(appointment);
    setDrawerOpen(false);
    setShowForm(true);
  }

  function openDetails(appointment: Appointment) {
    setSelected(appointment);
    setDrawerOpen(true);
  }

  async function handleFormSubmit(data: CreateAppointment, editingId: string | null) {
    try {
      setSaving(true);

      if (editingId) {
        const updated = await appointmentService.updateAppointment(editingId, {
          customer: data.customer,
          phone: data.phone,
          services: data.services,
          staffMembers: data.staffMembers,
          date: data.date,
          time: data.time,
          duration: data.duration,
          paymentStatus: data.paymentStatus,
          depositAmount: data.depositAmount,
          notes: data.notes,
          price: data.price,
        });
        setAppointments((current) => current.map((a) => (a.id === updated.id ? updated : a)));
        toast.success("Appointment updated");
      } else {
        const created = await appointmentService.createAppointment(data);
        setAppointments((current) => [...created, ...current]);
        toast.success(
          created.length > 1
            ? `${created.length} recurring appointments booked`
            : data.status === "Waitlisted"
            ? "Added to the waitlist"
            : "Appointment booked"
        );
      }

      setShowForm(false);
      setEditing(null);
    } catch (error) {
      if (error instanceof BookingConflictError) {
        throw error; // let the wizard show the conflict + suggestions
      }
      console.error("Save appointment error:", error);
      toast.error("Failed to save appointment");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(appointment: Appointment, status: AppointmentStatus) {
    try {
      setActionLoading(true);
      const updated = await appointmentService.updateStatus(appointment.id, status);
      setAppointments((current) => current.map((a) => (a.id === updated.id ? updated : a)));
      if (selected?.id === updated.id) setSelected(updated);
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkPaid(appointment: Appointment) {
    try {
      setActionLoading(true);
      const updated = await appointmentService.markPayment(appointment.id, "Paid", 0);
      setAppointments((current) => current.map((a) => (a.id === updated.id ? updated : a)));
      if (selected?.id === updated.id) setSelected(updated);
      toast.success("Marked as paid");
    } catch (error) {
      console.error("Mark paid error:", error);
      toast.error("Failed to update payment");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(appointment: Appointment) {
    const confirmed = window.confirm(`Delete appointment for ${appointment.customer}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await appointmentService.deleteAppointment(appointment.id);
      setAppointments((current) => current.filter((a) => a.id !== appointment.id));
      if (selected?.id === appointment.id) {
        setDrawerOpen(false);
        setSelected(null);
      }
      toast.success("Appointment deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete appointment");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReschedule(appointment: Appointment, date: string, time: string) {
    try {
      const updated = await appointmentService.updateAppointment(appointment.id, { date, time });
      setAppointments((current) => current.map((a) => (a.id === updated.id ? updated : a)));
      toast.success(`Moved to ${time}`);
    } catch (error) {
      if (error instanceof BookingConflictError) {
        toast.error("That slot just got booked by someone else");
      } else {
        console.error("Reschedule error:", error);
        toast.error("Failed to reschedule");
      }
    }
  }

  const shell = "bg-transparent";
  const heading = isDark ? "text-white" : "text-[#2B2B2B]";
  const subheading = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen space-y-6 p-6 transition-colors ${shell}`}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${heading}`}>Appointments</h1>
          <p className={`mt-1 text-sm ${subheading}`}>Manage your upcoming appointments.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="hidden items-center justify-center gap-2 rounded-xl bg-[#F25F5C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e14e4b] active:scale-[0.98] sm:inline-flex"
          >
            <Plus size={18} /> Add Appointment
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsHeader appointments={appointments} dark={isDark} />

      {/* Date tabs + view switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`inline-flex rounded-xl border p-1 ${isDark ? "border-white/10 bg-[#1c1c1c]" : "border-gray-200 bg-white"}`}>
          {(["today", "upcoming", "past", "all"] as DateTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setDateTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                dateTab === tab ? "bg-[#F25F5C] text-white" : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={`inline-flex rounded-xl border p-1 ${isDark ? "border-white/10 bg-[#1c1c1c]" : "border-gray-200 bg-white"}`}>
          {[
            { id: "table" as ViewMode, icon: Table2, label: "Table" },
            { id: "calendar" as ViewMode, icon: CalendarDays, label: "Calendar" },
            { id: "kanban" as ViewMode, icon: Kanban, label: "Board" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                view === id ? "bg-[#F25F5C] text-white" : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <AppointmentFilters filters={filters} onChange={setFilters} appointments={appointments} dark={isDark} />

      {/* Main view */}
      {view === "table" && (
        <AppointmentTable
          appointments={visible}
          loading={loading}
          dark={isDark}
          onOpen={openDetails}
          onEdit={openEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
      {view === "calendar" && !loading && (
        <AppointmentCalendarView appointments={visible} dark={isDark} onOpen={openDetails} onReschedule={handleReschedule} />
      )}
      {view === "kanban" && !loading && (
        <AppointmentKanbanView appointments={visible} dark={isDark} onOpen={openDetails} onStatusChange={handleStatusChange} />
      )}

      {/* Mobile FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#F25F5C] text-white shadow-xl transition active:scale-95 sm:hidden"
      >
        <Plus size={24} />
      </button>

      {/* Drawer */}
      <AppointmentDrawer
        appointment={selected}
        open={drawerOpen}
        dark={isDark}
        onClose={() => { if (!actionLoading) { setDrawerOpen(false); setSelected(null); } }}
        onStatusChange={(status) => selected && handleStatusChange(selected, status)}
        onMarkPaid={() => selected && handleMarkPaid(selected)}
        onInvoice={() => selected && setInvoiceFor(selected)}
        onEdit={() => selected && openEdit(selected)}
        onDelete={() => selected && handleDelete(selected)}
        actionLoading={actionLoading}
      />

      {/* Booking wizard */}
      <AppointmentFormModal
        open={showForm}
        saving={saving}
        dark={isDark}
        appointments={appointments}
        editing={editing}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSubmit={handleFormSubmit}
      />

      {/* Invoice */}
      <InvoiceModal appointment={invoiceFor} onClose={() => setInvoiceFor(null)} />
    </div>
  );
}
