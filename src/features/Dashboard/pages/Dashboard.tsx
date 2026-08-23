// File: src/features/Dashboard/pages/Dashboard.tsx
//
// SEBA Dashboard — v2 update notes
// ---------------------------------
// - Search bar and the "Live" pulsing indicator removed from the topbar.
// - Simulated notification toast removed entirely.
// - Estimated Revenue stat card removed. Bookings / Customers / Active
//   Services are now real counts from dashboard.service.ts (no fake
//   numbers, no fabricated trend lines / % deltas).
// - Loyalty points are computed from real bookings + orders counts.
// - Shop grid now shows the actual product image, and auto-slides through
//   multiple images every 5s.
// - Business Status uses an unambiguous green/red live indicator.
// - New: a printable cream/white flyer with brand shapes + QR code.
// - Responsiveness is the top priority here, especially at tablet/desktop
//   widths — grid breakpoints tuned at sm/md/lg/xl, sidebar is a true
//   off-canvas drawer below `lg` (see DashboardSidebar / SidebarContext).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Store,
  Sparkles,
  CalendarCheck2,
  Users2,
  Ticket,
  Plus,
  ChevronRight,
  GripVertical,
} from "lucide-react";

import { dashboardService } from "../services/dashboard.service";
import GlassCard from "../components/GlassCard";
import StatCard from "../components/StatsCard";
import BusinessStatus from "../components/BusinessStatus";
import BusinessHours from "../components/BusinessHours";
import LoyaltyCard from "../components/LoyaltyCard";
import BusinessFlyer from "../components/BusinessFlyer";
import BookingsCalendar from "../components/BookingsCalendar";
import RecentActivity from "../components/RecentActivity";
import OnboardingChecklist from "../components/OnboardingChecklist";
import ComingSoonCard from "../components/ComingSoonCard";
import QuickActions from "../components/QuickActions";
import ProductCard from "../components/ProductCard";
import "../styles/dashboard-theme.css";

type Business = {
  id: string;
  business_name: string;
  username: string;
};

type Service = {
  id: string;
  name: string;
  price?: number | null;
  duration?: number | null;
};

type Product = {
  id: string;
  name: string;
  price?: number | null;
  image_url?: string | null;
  images?: string[] | null;
  image?: string | null;
};

type AppointmentField = {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
};

type UpcomingBookingRow = {
  id: string;
  customerName: string;
  service: string;
  time: string;
  day: string;
};

type RecentAppointment = {
  id: string;
  customer: string;
  service: string;
  status: string;
};

type DashboardData = {
  business: Business | null;
  services: Service[];
  products: Product[];
  appointmentFields: AppointmentField[];
  language: string | null;
  bookingsCount: number;
  customersCount: number;
  ordersCount: number;
  upcomingBookings: UpcomingBookingRow[];
  recentAppointments: RecentAppointment[];
};

function formatPrice(price?: number | null) {
  if (price === null || price === undefined) {
    return "Price not set";
  }
  return `${price.toLocaleString()} ETB`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="seba-skeleton h-40 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="seba-skeleton h-28 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="seba-skeleton h-56 w-full" />
        ))}
      </div>
    </div>
  );
}

const SECONDARY_WIDGETS = [
  "business-status",
  "loyalty",
  "flyer",
  "reviews",
  "bookings",
  "business-hours",
] as const;

type WidgetKey = (typeof SECONDARY_WIDGETS)[number];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    business: null,
    services: [],
    products: [],
    appointmentFields: [],
    language: null,
    bookingsCount: 0,
    customersCount: 0,
    ordersCount: 0,
    upcomingBookings: [],
    recentAppointments: [],
  });

  const [loading, setLoading] = useState(true);
  const [widgetOrder, setWidgetOrder] = useState<WidgetKey[]>([
    ...SECONDARY_WIDGETS,
  ]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const dashboardData = await dashboardService.getDashboardData();
        if (!cancelled) setData(dashboardData);
      } catch (error) {
        console.error("Dashboard error:", error);
        if (!cancelled) toast.error("Could not load your dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setWidgetOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data.business) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <GlassCard className="max-w-md p-8 text-center" hover={false}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5A5F]/10 text-[#E14549]">
            <Store size={22} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#241413]">
            Business not found
          </h2>
          <p className="mt-2 text-sm text-[#6B5A56]">
            We couldn't find a business connected to your account.
          </p>
          <Link
            to="/onboarding/business"
            className="seba-press seba-ripple mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#FF7A6E] to-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white shadow-lg"
          >
            Set up your business
          </Link>
        </GlassCard>
      </div>
    );
  }

  const {
    business,
    services,
    products,
    appointmentFields,
    language,
    bookingsCount,
    customersCount,
    ordersCount,
    upcomingBookings,
    recentAppointments,
  } = data;

  const websiteUrl = `/businesses/${business.username}`;
  const isAmharic = (language ?? "").toLowerCase().startsWith("am");

  const checklistItems = [
    { title: "Business information", complete: true },
    { title: "Website style", complete: true },
    { title: "Website customization", complete: true },
    { title: "Booking setup", complete: appointmentFields.length > 0 },
    { title: "Shop", complete: products.length > 0, optional: true },
  ];

  const widgetMap: Record<WidgetKey, React.ReactNode> = {
    "business-status": (
      <BusinessStatus
        businessName={business.business_name}
        username={business.username}
        isLive
      />
    ),
    loyalty: (
      <LoyaltyCard bookingsCount={bookingsCount} ordersCount={ordersCount} />
    ),
    flyer: (
      <BusinessFlyer
        businessName={business.business_name}
        username={business.username}
      />
    ),
    reviews: (
      <ComingSoonCard
        icon={<Sparkles size={18} />}
        title="Reviews & Ratings"
        description="Customer reviews will show up here once bookings go live — average rating, recent feedback, and response tools."
      />
    ),
    bookings: <BookingsCalendar bookings={upcomingBookings} />,
    "business-hours": <BusinessHours />,
  };

  return (
    <div className="seba-dashboard mx-auto w-full max-w-[1400px] space-y-6 overflow-x-hidden px-1 sm:px-0">
      {/* Breadcrumb */}
      <div className="seba-rise flex items-center gap-1.5 text-xs font-medium text-[#B4A29C]">
        <span>SEBA</span>
        <ChevronRight size={12} />
        <span className="text-[#6B5A56]">Dashboard</span>
      </div>

      {/* Hero — gradient mesh banner, coral → gold */}
      <div
        className="seba-hero-mesh seba-rise overflow-hidden rounded-3xl p-6 text-white shadow-[0_20px_50px_rgba(255,90,95,0.25)] sm:p-7 md:p-9"
        style={{ animationDelay: "40ms" }}
      >
        <div className="relative z-[2] flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-extrabold md:text-3xl">
                  {business.business_name}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    @{business.username}
                  </p>
                  {isAmharic && (
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
                      አማርኛ
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md">
              <Sparkles size={13} />
              Your SEBA page is live and ready for customers
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/dashboard/products"
              className="seba-press seba-ripple inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
            >
              <Plus size={16} />
              Add Product
            </Link>
            <Link
              to="/dashboard/services"
              className="seba-press seba-ripple inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#E14549] shadow-lg transition hover:bg-white/90"
            >
              <Plus size={16} />
              Add Service
            </Link>
            <Link
              to={websiteUrl}
              className="seba-press seba-ripple inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Page
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards — real counts only */}
      <div
        className="seba-rise grid grid-cols-1 gap-4 sm:grid-cols-3"
        style={{ animationDelay: "90ms" }}
      >
        <StatCard
          icon={<CalendarCheck2 size={18} />}
          label="Bookings"
          value={bookingsCount}
          accent="coral"
        />
        <StatCard
          icon={<Users2 size={18} />}
          label="Customers"
          value={customersCount}
          accent="gold"
        />
        <StatCard
          icon={<Ticket size={18} />}
          label="Active Services"
          value={services.length}
          accent="coral"
        />
      </div>

      {/* Main bento grid */}
      <div className="grid grid-cols-1 gap-6 min-[1800px]:grid-cols-12">
        {/* Left / main column */}
        <div className="min-w-0 space-y-6 min-[1800px]:col-span-7">
          {/* Services */}
          <GlassCard className="p-0" hover={false}>
            <div className="flex items-center justify-between border-b border-[#F0E3DE]/70 px-6 py-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#241413]">Your Services</h2>
                <p className="mt-1 text-sm text-[#6B5A56]">
                  What customers can book with you.
                </p>
              </div>
              <Link
                to="/dashboard/services"
                className="shrink-0 text-sm font-semibold text-[#E14549] hover:underline"
              >
                Manage
              </Link>
            </div>

            {services.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF2E6] text-[#D9A441]">
                  <Ticket size={20} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#241413]">
                  No services yet
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B5A56]">
                  Add your first service so customers know what you offer.
                </p>
                <Link
                  to="/dashboard/services"
                  className="seba-press seba-ripple mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A6E] to-[#FF5A5F] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus size={16} />
                  Add Service
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F0E3DE]/70">
                {services.slice(0, 5).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-white/40"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#241413]">
                        {service.name}
                      </p>
                      {service.duration ? (
                        <p className="mt-1 text-xs text-[#B4A29C]">
                          {service.duration} minutes
                        </p>
                      ) : null}
                    </div>
                    <p className="font-semibold text-[#B4841F]">
                      {formatPrice(service.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Products / Shop */}
          <GlassCard className="p-0" hover={false}>
            <div className="flex items-center justify-between border-b border-[#F0E3DE]/70 px-6 py-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#241413]">Shop Products</h2>
                <p className="mt-1 text-sm text-[#6B5A56]">
                  Products you're selling alongside your services.
                </p>
              </div>
              <Link
                to="/dashboard/products"
                className="shrink-0 text-sm font-semibold text-[#E14549] hover:underline"
              >
                Manage
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF2E6] text-[#D9A441]">
                  <Store size={20} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#241413]">
                  Your shop is empty
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B5A56]">
                  Products are optional. Add products whenever you're ready.
                </p>
                <Link
                  to="/dashboard/products"
                  className="seba-press seba-ripple mt-5 inline-flex items-center gap-2 rounded-xl border border-[#F0E3DE] bg-white px-4 py-2.5 text-sm font-semibold text-[#241413] hover:border-[#D9A441]"
                >
                  <Plus size={16} />
                  Add Product
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 min-[1800px]:grid-cols-2">
                {products.slice(0, 6).map((product) => {
                  const gallery = product.images?.length
                    ? product.images
                  : product.image_url ?? product.image
                    ? [product.image_url ?? product.image as string]
                    : [];

                  return (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={formatPrice(product.price)}
                      images={gallery}
                    />
                  );
                })}
              </div>
            )}
          </GlassCard>

          <RecentActivity appointments={recentAppointments} />
        </div>

        {/* Right column — draggable widget stack */}
        <div className="grid min-w-0 content-start grid-cols-1 gap-6 min-[1800px]:col-span-5">
          <div>
            <OnboardingChecklist items={checklistItems} />
          </div>

          {widgetOrder.map((key, index) => (
            <div
              key={key}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`group relative transition-opacity ${
                dragIndex === index ? "opacity-50" : "opacity-100"
              } min-w-0`}
            >
              <span className="absolute -left-2 top-1/2 hidden -translate-y-1/2 cursor-grab text-[#D6C6C0] group-hover:block">
                <GripVertical size={16} />
              </span>
              {widgetMap[key]}
            </div>
          ))}
        </div>
      </div>

      {/* Coming next — promo codes */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#B4841F]">
              Coming in updates
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#241413]">
              Discount & promo codes
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[#6B5A56]">
              Create limited-time offers and shareable codes for customers —
              landing soon alongside customer analytics.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[#D9A441]/40 bg-[#D9A441]/10 px-4 py-3 text-sm font-semibold text-[#B4841F]">
            <Sparkles size={16} />
            Coming soon
          </div>
        </div>
      </GlassCard>

      <QuickActions />
    </div>
  );
}
