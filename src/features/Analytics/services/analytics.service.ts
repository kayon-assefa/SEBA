import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";

import type {
  AnalyticsData,
  AnalyticsRange,
  BreakdownItem,
  DayTraffic,
  PeakHour,
  TrafficPoint,
} from "../types/analytics";

function getStartDate(range: AnalyticsRange): Date {
  const now = new Date();

  switch (range) {
    case "today": {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    case "30d": {
      const date = new Date(now);
      date.setDate(date.getDate() - 29);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    case "3m": {
      const date = new Date(now);
      date.setMonth(date.getMonth() - 3);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    case "7d":
    default: {
      const date = new Date(now);
      date.setDate(date.getDate() - 6);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }
}

function getPreviousStartDate(
  range: AnalyticsRange,
  currentStart: Date
): Date {
  const date = new Date(currentStart);

  switch (range) {
    case "today":
      date.setDate(date.getDate() - 1);
      break;

    case "30d":
      date.setDate(date.getDate() - 30);
      break;

    case "3m":
      date.setMonth(date.getMonth() - 3);
      break;

    case "7d":
    default:
      date.setDate(date.getDate() - 7);
      break;
  }

  return date;
}

async function getBusinessId(): Promise<string> {
  return getActiveBusinessId();
}

function calculateChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number(
    (((current - previous) / previous) * 100).toFixed(1)
  );
}

function percentage(
  value: number,
  total: number
): number {
  if (!total) return 0;

  return Number(((value / total) * 100).toFixed(1));
}

export const analyticsService = {
  async getAnalytics(
    range: AnalyticsRange = "7d"
  ): Promise<AnalyticsData> {
    const businessId = await getBusinessId();

    const startDate = getStartDate(range);

    const previousStartDate = getPreviousStartDate(
      range,
      startDate
    );

    /*
     * Analytics events
     */
    const { data: events, error: eventsError } =
      await supabase
        .from("analytics_events")
        .select(
          "id,event_type,source,city,page,created_at"
        )
        .eq("business_id", businessId)
        .gte(
          "created_at",
          previousStartDate.toISOString()
        )
        .order("created_at", {
          ascending: true,
        });

    if (eventsError) {
      throw eventsError;
    }

    const currentEvents =
      events?.filter(
        (event) =>
          event.created_at &&
          new Date(event.created_at) >= startDate
      ) ?? [];

    const previousEvents =
      events?.filter(
        (event) =>
          event.created_at &&
          new Date(event.created_at) >=
            previousStartDate &&
          new Date(event.created_at) < startDate
      ) ?? [];

    const countEvent = (
      collection: typeof currentEvents,
      type: string
    ) =>
      collection.filter(
        (event) => event.event_type === type
      ).length;

    /*
     * Overview
     */
    const visitors = countEvent(
      currentEvents,
      "visitor"
    );

    const previousVisitors = countEvent(
      previousEvents,
      "visitor"
    );

    const eventAppointments = countEvent(
      currentEvents,
      "appointment"
    );

    const previousAppointments = countEvent(
      previousEvents,
      "appointment"
    );

    const orders = countEvent(
      currentEvents,
      "order"
    );

    const previousOrders = countEvent(
      previousEvents,
      "order"
    );

    const newCustomers = countEvent(
      currentEvents,
      "customer"
    );

    const previousCustomers = countEvent(
      previousEvents,
      "customer"
    );

    /*
     * Traffic
     */
    const trafficMap = new Map<
      string,
      TrafficPoint
    >();

    currentEvents.forEach((event) => {
      if (!event.created_at) return;

      const date = new Date(event.created_at);

      const label =
        date.toLocaleDateString(undefined, {
          weekday: "short",
        });

      if (!trafficMap.has(label)) {
        trafficMap.set(label, {
          label,
          visitors: 0,
          pageViews: 0,
        });
      }

      const item = trafficMap.get(label)!;

      if (event.event_type === "visitor") {
        item.visitors += 1;
      }

      if (event.event_type === "page_view") {
        item.pageViews += 1;
      }
    });

    const traffic: TrafficPoint[] =
      Array.from(trafficMap.values());

    /*
     * Traffic by day
     */
    const dayMap = new Map<string, number>();

    currentEvents.forEach((event) => {
      if (
        event.event_type !== "visitor" ||
        !event.created_at
      ) {
        return;
      }

      const day = new Date(
        event.created_at
      ).toLocaleDateString(undefined, {
        weekday: "long",
      });

      dayMap.set(
        day,
        (dayMap.get(day) ?? 0) + 1
      );
    });

    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const trafficByDay: DayTraffic[] =
      dayOrder.map((day) => ({
        day,
        visitors: dayMap.get(day) ?? 0,
      }));

    /*
     * Peak hours
     */
    const hourMap = new Map<
      string,
      number
    >();

    currentEvents.forEach((event) => {
      if (
        event.event_type !== "visitor" ||
        !event.created_at
      ) {
        return;
      }

      const date = new Date(
        event.created_at
      );

      const day = date.toLocaleDateString(
        undefined,
        {
          weekday: "short",
        }
      );

      const hour = date.getHours();

      const key = `${day}-${hour}`;

      hourMap.set(
        key,
        (hourMap.get(key) ?? 0) + 1
      );
    });

    const peakHours: PeakHour[] = [];

    hourMap.forEach((value, key) => {
      const [day, hour] = key.split("-");

      peakHours.push({
        day,
        hour: Number(hour),
        value,
      });
    });

    /*
     * Geography
     */
    const geographyMap = new Map<
      string,
      number
    >();

    currentEvents
      .filter(
        (event) =>
          event.event_type === "visitor"
      )
      .forEach((event) => {
        const city =
          event.city || "Other";

        geographyMap.set(
          city,
          (geographyMap.get(city) ?? 0) + 1
        );
      });

    const geographyTotal = Array.from(
      geographyMap.values()
    ).reduce((sum, value) => sum + value, 0);

    const geography: BreakdownItem[] =
      Array.from(geographyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, value]) => ({
          label,
          value,
          percentage: percentage(
            value,
            geographyTotal
          ),
        }));

    /*
     * Traffic sources
     */
    const sourceMap = new Map<
      string,
      number
    >();

    currentEvents
      .filter(
        (event) =>
          event.event_type === "visitor"
      )
      .forEach((event) => {
        const source =
          event.source || "Direct";

        sourceMap.set(
          source,
          (sourceMap.get(source) ?? 0) + 1
        );
      });

    const sourceTotal = Array.from(
      sourceMap.values()
    ).reduce((sum, value) => sum + value, 0);

    const sources: BreakdownItem[] =
      Array.from(sourceMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({
          label,
          value,
          percentage: percentage(
            value,
            sourceTotal
          ),
        }));

    /*
     * Appointments
     *
     * We intentionally read appointment
     * status only if the table exists.
     */
    let appointmentTotal =
      eventAppointments;

    let completed = 0;
    let pending = 0;
    let cancelled = 0;
    let noShow = 0;

    const {
      data: appointments,
      error: appointmentsError,
    } = await supabase
      .from("appointments")
      .select("status")
      .eq("business_id", businessId)
      .gte(
        "date",
        startDate.toISOString().slice(0, 10)
      );

    if (!appointmentsError && appointments) {
      appointmentTotal = appointments.length;

      completed = appointments.filter(
        (item) =>
          item.status === "Completed"
      ).length;

      pending = appointments.filter(
        (item) =>
          item.status === "Pending"
      ).length;

      cancelled = appointments.filter(
        (item) =>
          item.status === "Cancelled"
      ).length;

      noShow = appointments.filter(
        (item) =>
          item.status === "No-show"
      ).length;
    }

    /*
     * Customers
     */
    let customerCount =
      newCustomers;

    const returningCustomers = 0;

    const {
      data: customers,
      error: customersError,
    } = await supabase
      .from("customers")
      .select("id,created_at")
      .eq("business_id", businessId)
      .gte(
        "created_at",
        startDate.toISOString()
      );

    if (!customersError && customers) {
      customerCount = customers.length;
    }

    /*
     * Popular services
     */
    const serviceMap = new Map<
      string,
      number
    >();

    currentEvents
      .filter(
        (event) =>
          event.event_type ===
          "appointment"
      )
      .forEach((event) => {
        const service =
          event.page || "Unknown";

        serviceMap.set(
          service,
          (serviceMap.get(service) ?? 0) + 1
        );
      });

    const serviceTotal = Array.from(
      serviceMap.values()
    ).reduce((sum, value) => sum + value, 0);

    const popularServices: BreakdownItem[] =
      Array.from(serviceMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, value]) => ({
          label,
          value,
          percentage: percentage(
            value,
            serviceTotal
          ),
        }));

    /*
     * Products
     */
    const {
      data: products,
      error: productsError,
    } = await supabase
      .from("products")
      .select("name,stock")
      .eq("business_id", businessId)
      .order("stock", {
        ascending: false,
      })
      .limit(5);

    const topProducts =
      !productsError && products
        ? products.map((product) => ({
            label: product.name,
            value: product.stock ?? 0,
          }))
        : [];

    /*
     * Page performance
     */
    const pageViews = countEvent(
      currentEvents,
      "page_view"
    );

    const uniqueVisitors = visitors;

    const appointmentClicks =
      countEvent(
        currentEvents,
        "appointment_click"
      );

    const shopVisits = countEvent(
      currentEvents,
      "shop_visit"
    );

    const bookingConversion =
      uniqueVisitors > 0
        ? Number(
            (
              (appointmentClicks /
                uniqueVisitors) *
              100
            ).toFixed(1)
          )
        : 0;

    return {
      overview: {
        visitors,
        appointments: appointmentTotal,
        orders,
        newCustomers: customerCount,

        visitorsChange: calculateChange(
          visitors,
          previousVisitors
        ),

        appointmentsChange:
          calculateChange(
            appointmentTotal,
            previousAppointments
          ),

        ordersChange: calculateChange(
          orders,
          previousOrders
        ),

        newCustomersChange:
          calculateChange(
            customerCount,
            previousCustomers
          ),
      },

      traffic,

      trafficByDay,

      peakHours,

      geography,

      sources,

      appointments: {
        total: appointmentTotal,
        completed,
        pending,
        cancelled,
        noShow,
      },

      customers: {
        newCustomers: customerCount,
        returningCustomers,
      },

      popularServices,

      topProducts,

      pagePerformance: {
        pageViews,
        uniqueVisitors,
        appointmentClicks,
        shopVisits,
        bookingConversion,
      },
    };
  },

  async trackEvent(
    eventType: string,
    options?: {
      source?: string;
      city?: string;
      page?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    const businessId =
      await getBusinessId();

    const { error } = await supabase
      .from("analytics_events")
      .insert({
        business_id: businessId,
        event_type: eventType,
        source:
          options?.source ?? null,
        city:
          options?.city ?? null,
        page:
          options?.page ?? null,
        metadata:
          options?.metadata ?? {},
      });

    if (error) {
      throw error;
    }
  },
};
