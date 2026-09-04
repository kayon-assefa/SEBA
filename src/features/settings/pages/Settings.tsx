import { useState } from "react";

import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  Database,
  Globe,
  Link2,
  Lock,
  Palette,
  ShieldAlert,
  ShoppingBag,
  Users,
  CreditCard,
} from "lucide-react";

import GeneralSection from "../sections/GeneralSection";
import BusinessSection from "../sections/BusinessSection";
import BookingSection from "../sections/BookingSection";
import ShopSection from "../sections/ShopSection";
import PageSection from "../sections/PageSection";
import StaffSection from "../sections/StaffSection";
import NotificationSection from "../sections/NotificationSection";
import SubscriptionSection from "../sections/SubscriptionSection";
import IntegrationSection from "../sections/IntegrationSectionFixed";
import SecuritySection from "../sections/SecuritySection";
import DataSection from "../sections/DataSection";
import BranchSection from "../sections/BranchSection";
import DangerZoneSection from "../sections/DangerZoneSection";

export type SettingsSection =
  | "general"
  | "business"
  | "booking"
  | "shop"
  | "page"
  | "staff"
  | "notifications"
  | "subscription"
  | "integrations"
  | "security"
  | "data"
  | "branches"
  | "danger";

type SettingsKey =
  | "general"
  | "business"
  | "booking"
  | "shop"
  | "page"
  | "staff"
  | "notifications"
  | "subscription"
  | "integrations"
  | "security"
  | "data"
  | "branches"
  | "danger";

type SettingsItem = {
  id: SettingsKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const settingsItems: SettingsItem[] = [
  {
    id: "general",
    label: "General",
    description: "Account, language, region and preferences",
    icon: Globe,
  },
  {
    id: "business",
    label: "Business",
    description: "Business information, location and hours",
    icon: Building2,
  },
  {
    id: "booking",
    label: "Booking",
    description: "Appointments and booking behavior",
    icon: CalendarDays,
  },
  {
    id: "shop",
    label: "Shop",
    description: "Shop, orders and inventory",
    icon: ShoppingBag,
  },
  {
    id: "page",
    label: "Page",
    description: "Public page appearance and SEO",
    icon: Palette,
  },
  {
    id: "staff",
    label: "Staff",
    description: "Staff accounts and permissions",
    icon: Users,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Notification preferences",
    icon: Bell,
  },
  {
    id: "subscription",
    label: "Subscription",
    description: "Plan and billing",
    icon: CreditCard,
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connected services",
    icon: Link2,
  },
  {
    id: "security",
    label: "Security",
    description: "Password, sessions and account security",
    icon: Lock,
  },
  {
    id: "data",
    label: "Data",
    description: "Export and manage business data",
    icon: Database,
  },
  {
    id: "branches",
    label: "Branches",
    description: "Manage business branches",
    icon: Building2,
  },
  {
    id: "danger",
    label: "Danger Zone",
    description: "Pause, unpublish or delete the business",
    icon: ShieldAlert,
  },
];

function getInitialSection(): SettingsKey {
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section") as SettingsKey | null;

  if (
    section &&
    settingsItems.some((item) => item.id === section)
  ) {
    return section;
  }

  return "general";
}

export default function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingsKey>(getInitialSection);

  function selectSection(section: SettingsKey) {
    setActiveSection(section);

    const url = new URL(window.location.href);
    url.searchParams.set("section", section);

    window.history.replaceState(
      {},
      "",
      url.toString()
    );
  }

  function renderSection() {
    switch (activeSection) {
      case "general":
        return <GeneralSection />;

      case "business":
        return <BusinessSection />;

      case "booking":
        return <BookingSection />;

      case "shop":
        return <ShopSection />;

      case "page":
        return <PageSection />;

      case "staff":
        return <StaffSection />;

      case "notifications":
        return <NotificationSection />;

      case "subscription":
        return <SubscriptionSection />;

      case "integrations":
        return <IntegrationSection />;

      case "security":
        return <SecuritySection />;

      case "data":
        return <DataSection />;

      case "branches":
        return <BranchSection />;

      case "danger":
        return <DangerZoneSection />;

      default:
        return <GeneralSection />;
    }
  }

  const activeItem =
    settingsItems.find(
      (item) => item.id === activeSection
    ) ?? settingsItems[0];

  return (
    <div className="seba-dashboard mx-auto w-full max-w-[1400px]">
      {/* PAGE HEADER */}
      <div className="seba-glass seba-rise">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your SEBA business, account and
            preferences.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* MOBILE NAV */}
        <div className="mb-6 lg:hidden">
          <label
            htmlFor="settings-section"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Settings section
          </label>

          <select
            id="settings-section"
            value={activeSection}
            onChange={(event) =>
              selectSection(
                event.target.value as SettingsKey
              )
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 font-medium"
          >
            {settingsItems.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* DESKTOP NAV */}
          <aside className="hidden lg:block">
            <div className="seba-glass sticky top-6 overflow-hidden">
              <div className="border-b px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Settings
                </p>
              </div>

              <nav className="p-2">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        selectSection(item.id)
                      }
                      className={[
                        "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                        active
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")}
                    >
                      <Icon
                        size={18}
                        className={
                          active
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {item.label}
                        </span>

                        {active && (
                          <span className="mt-0.5 block truncate text-xs text-gray-500">
                            {item.description}
                          </span>
                        )}
                      </span>

                      {active && (
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-gray-400"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="min-w-0">
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-gray-200">
                  <activeItem.icon
                    size={20}
                    className="text-gray-700"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeItem.label}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {activeItem.description}
                  </p>
                </div>
              </div>
            </div>

            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  );
}
