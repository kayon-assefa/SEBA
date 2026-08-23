import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Eye,
  ShoppingBag,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";

import { analyticsService } from "../services/analytics.service";

import type {
  AnalyticsData,
  AnalyticsRange,
} from "../types/analytics";

import AnalyticsCard from "../components/AnalyticsCard";
import AnalyticsSection from "../components/AnalyticsSection";
import TrafficChart from "../components/TrafficChart";
import TrafficByDay from "../components/TrafficByDay";
import PeakHours from "../components/PeakHours";
import SimpleBreakdown from "../components/SimpleBreakdown";
import PerformanceCard from "../components/PerformanceCard";

const RANGE_LABELS: Record<
  AnalyticsRange,
  string
> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "3m": "Last 3 months",
  custom: "Custom",
};

export default function Analytics() {
  const [range, setRange] =
    useState<AnalyticsRange>("7d");

  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [trafficMode, setTrafficMode] =
    useState<
      "visitors" | "pageViews"
    >("visitors");

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  async function loadAnalytics() {
    try {
      setLoading(true);

      const result =
        await analyticsService.getAnalytics(
          range
        );

      setData(result);
    } catch (error) {
      console.error(
        "Analytics load error:",
        error
      );

      toast.error(
        "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2B2B2B] md:text-3xl">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Understand how customers discover
            and interact with your business.
          </p>
        </div>

        <div className="relative">
          <select
            value={range}
            onChange={(event) =>
              setRange(
                event.target
                  .value as AnalyticsRange
              )
            }
            className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-700 outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
          >
            {Object.entries(
              RANGE_LABELS
            ).map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : !data ? (
        <EmptyState />
      ) : (
        <>
          {/* Overview */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#2B2B2B]">
                Overview
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AnalyticsCard
                title="Visitors"
                value={
                  data.overview
                    .visitors
                }
                change={
                  data.overview
                    .visitorsChange
                }
                icon={<Eye size={20} />}
              />

              <AnalyticsCard
                title="Appointments"
                value={
                  data.overview
                    .appointments
                }
                change={
                  data.overview
                    .appointmentsChange
                }
                icon={
                  <CalendarDays
                    size={20}
                  />
                }
              />

              <AnalyticsCard
                title="Orders"
                value={
                  data.overview.orders
                }
                change={
                  data.overview
                    .ordersChange
                }
                icon={
                  <ShoppingBag
                    size={20}
                  />
                }
              />

              <AnalyticsCard
                title="New Customers"
                value={
                  data.overview
                    .newCustomers
                }
                change={
                  data.overview
                    .newCustomersChange
                }
                icon={
                  <Users size={20} />
                }
              />
            </div>
          </div>

          {/* Traffic */}
          <AnalyticsSection title="">
            <TrafficChart
              data={data.traffic}
              mode={trafficMode}
              onModeChange={
                setTrafficMode
              }
            />
          </AnalyticsSection>

          {/* Traffic + Sources */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnalyticsSection
              title="Traffic by Day"
              description="See which days bring the most visitors."
            >
              <TrafficByDay
                data={
                  data.trafficByDay
                }
              />
            </AnalyticsSection>

            <AnalyticsSection
              title="Traffic Sources"
              description="Understand where your visitors are coming from."
            >
              <SimpleBreakdown
                items={data.sources}
              />
            </AnalyticsSection>
          </div>

          {/* Peak Hours */}
          <AnalyticsSection
            title="Peak Hours"
            description="See when people are most active on your business page."
          >
            <PeakHours
              data={data.peakHours}
            />
          </AnalyticsSection>

          {/* Geography */}
          <AnalyticsSection
            title="Visitor Geography"
            description="Where your visitors are coming from."
          >
            <SimpleBreakdown
              items={data.geography}
            />
          </AnalyticsSection>

          {/* Appointment Analytics */}
          <AnalyticsSection
            title="Appointment Performance"
            description="Track how appointments are progressing."
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <Metric
                label="Total"
                value={
                  data.appointments.total
                }
              />

              <Metric
                label="Completed"
                value={
                  data.appointments
                    .completed
                }
              />

              <Metric
                label="Pending"
                value={
                  data.appointments
                    .pending
                }
              />

              <Metric
                label="Cancelled"
                value={
                  data.appointments
                    .cancelled
                }
              />

              <Metric
                label="No-show"
                value={
                  data.appointments
                    .noShow
                }
              />
            </div>
          </AnalyticsSection>

          {/* Customers */}
          <AnalyticsSection
            title="Customer Analytics"
            description="Understand new versus returning customers."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Metric
                label="New Customers"
                value={
                  data.customers
                    .newCustomers
                }
              />

              <Metric
                label="Returning Customers"
                value={
                  data.customers
                    .returningCustomers
                }
              />
            </div>
          </AnalyticsSection>

          {/* Services + Products */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnalyticsSection
              title="Most Popular Services"
              description="Services receiving the most appointment activity."
            >
              <SimpleBreakdown
                items={
                  data.popularServices
                }
              />
            </AnalyticsSection>

            <AnalyticsSection
              title="Top Products"
              description="Your most active products."
            >
              {data.topProducts.length ===
              0 ? (
                <EmptySmallState />
              ) : (
                <div className="space-y-4">
                  {data.topProducts.map(
                    (product) => (
                      <div
                        key={
                          product.label
                        }
                        className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="font-medium text-gray-700">
                          {
                            product.label
                          }
                        </span>

                        <span className="font-bold text-[#2B2B2B]">
                          {
                            product.value
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </AnalyticsSection>
          </div>

          {/* Page Performance */}
          <AnalyticsSection
            title="Your Page"
            description="Understand how effectively your SEBA page converts visitors."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <PerformanceCard
                label="Page Views"
                value={data.pagePerformance.pageViews.toLocaleString()}
              />

              <PerformanceCard
                label="Unique Visitors"
                value={data.pagePerformance.uniqueVisitors.toLocaleString()}
              />

              <PerformanceCard
                label="Appointment Clicks"
                value={data.pagePerformance.appointmentClicks.toLocaleString()}
              />

              <PerformanceCard
                label="Shop Visits"
                value={data.pagePerformance.shopVisits.toLocaleString()}
              />

              <PerformanceCard
                label="Booking Conversion"
                value={`${data.pagePerformance.bookingConversion}%`}
              />
            </div>
          </AnalyticsSection>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#2B2B2B]">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />

      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />

      <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
      <Eye
        size={40}
        className="mx-auto text-gray-300"
      />

      <h2 className="mt-4 text-lg font-bold text-gray-800">
        No analytics yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        Analytics will appear here as
        customers start interacting with
        your SEBA business page.
      </p>
    </div>
  );
}

function EmptySmallState() {
  return (
    <div className="py-8 text-center text-sm text-gray-400">
      No product data available yet.
    </div>
  );
}
