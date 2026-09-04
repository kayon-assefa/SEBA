```tsx
// File:
// src/app/routes/AppRouter.tsx

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

/*
|--------------------------------------------------------------------------
| LAYOUTS
|--------------------------------------------------------------------------
*/

import MainLayout from "../../shared/layouts/MainLayout";
import AuthLayout from "../../layouts/AuthLayout";
import DashboardLayout from "../../features/Dashboard/layouts/DashboardLayout";

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

import ProtectedRoute from "../../features/auth/components/ProtectedRoute";
import OnboardingRoute from "../../features/auth/components/OnboardingRoute";

import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import VerifyEmail from "../../features/auth/pages/VerifyEmail";
import ForgetPassword from "../../features/auth/pages/ForgotPassword";
import ResetPassword from "../../features/auth/pages/ResetPassword";

/*
|--------------------------------------------------------------------------
| PUBLIC WEBSITE
|--------------------------------------------------------------------------
*/

import Home from "../../features/Home/pages/Home";
import About from "../../pages/About";
import Contact from "../../pages/Contact";
import Privacy from "../../pages/Privacy";
import Terms from "../../pages/Terms";

/*
|--------------------------------------------------------------------------
| PUBLIC BUSINESS
|--------------------------------------------------------------------------
*/

import {
  PublicAppointmentPage,
  PublicShopPage,
} from "../../features/public-business/public-business-updated";

import PublicBusinessRoute from "./PublicBusinessRoute";

/*
|--------------------------------------------------------------------------
| ONBOARDING
|--------------------------------------------------------------------------
*/

import BusinessInfo from "../../features/onboarding/pages/BusinessInfo";
import TemplateSelection from "../../features/onboarding/pages/TemplateSelection";
import CustomizeTemplate from "../../features/onboarding/pages/CustomizeTemplate";
import AppointmentBuilder from "../../features/onboarding/pages/AppointmentBuilder";
import ShopBuilder from "../../features/onboarding/pages/ShopBuilder";

/*
|--------------------------------------------------------------------------
| OWNER DASHBOARD
|--------------------------------------------------------------------------
*/

import Dashboard from "../../features/Dashboard/pages/Dashboard";
import Businesses from "../../features/businesses/pages/Businesses";
import Categories from "../../features/Categories/pages/Categories";
import Appointments from "../../features/appointments/pages/Appointments";
import Customers from "../../features/customers/pages/Customers";
import Products from "../../features/products/pages/Products";
import Settings from "../../features/settings/pages/Settings";
import Analytics from "../../features/Analytics/pages/Analytics";
import Orders from "../../features/Orders/pages/Orders";
import Notifications from "../../features/notifications/pages/Notifications";

/*
|--------------------------------------------------------------------------
| SUBSCRIPTION
|--------------------------------------------------------------------------
*/

import { SubscriptionPage } from "../../features/subscription";

/*
|--------------------------------------------------------------------------
| STAFF
|--------------------------------------------------------------------------
*/

import {
  StaffLayout,
  StaffDashboard,
  StaffAppointments,
  StaffOrders,
  StaffCustomers,
  StaffNotifications,
  StaffSchedule,
} from "../../features/staff";

/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

import NotFound from "../../pages/NotFound";

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const router = createBrowserRouter([
  /*
  |--------------------------------------------------------------------------
  | PUBLIC WEBSITE
  |--------------------------------------------------------------------------
  */

  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },

      {
        path: "/about",
        element: <About />,
      },

      {
        path: "/contact",
        element: <Contact />,
      },

      {
        path: "/privacy",
        element: <Privacy />,
      },

      {
        path: "/terms",
        element: <Terms />,
      },

      {
        path: "/businesses",
        element: <Businesses />,
      },

      {
        path: "/categories",
        element: <Categories />,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | PUBLIC BUSINESS BOOKING
  |--------------------------------------------------------------------------
  */

  {
    path: "/:username/book",
    element: <PublicAppointmentPage />,
  },

  /*
  |--------------------------------------------------------------------------
  | PUBLIC BUSINESS SHOP
  |--------------------------------------------------------------------------
  */

  {
    path: "/:username/shop",
    element: <PublicShopPage />,
  },

  /*
  |--------------------------------------------------------------------------
  | ONBOARDING
  |--------------------------------------------------------------------------
  */

  {
    path: "/onboarding/business",
    element: (
      <OnboardingRoute>
        <BusinessInfo />
      </OnboardingRoute>
    ),
  },

  {
    path: "/onboarding/templates",
    element: (
      <OnboardingRoute>
        <TemplateSelection />
      </OnboardingRoute>
    ),
  },

  {
    path: "/onboarding/customize",
    element: (
      <OnboardingRoute>
        <CustomizeTemplate />
      </OnboardingRoute>
    ),
  },

  {
    path: "/onboarding/appointments",
    element: (
      <OnboardingRoute>
        <AppointmentBuilder />
      </OnboardingRoute>
    ),
  },

  {
    path: "/onboarding/shop",
    element: (
      <OnboardingRoute>
        <ShopBuilder />
      </OnboardingRoute>
    ),
  },

  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATION
  |--------------------------------------------------------------------------
  */

  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },

      {
        path: "/register",
        element: <Register />,
      },

      {
        path: "/verify-email",
        element: <VerifyEmail />,
      },

      {
        path: "/forgot-password",
        element: <ForgetPassword />,
      },

      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | OWNER DASHBOARD
  |--------------------------------------------------------------------------
  */

  {
    path: "/dashboard",

    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),

    children: [
      /*
      |--------------------------------------------------------------------------
      | DASHBOARD HOME
      |--------------------------------------------------------------------------
      */

      {
        index: true,
        element: <Dashboard />,
      },

      /*
      |--------------------------------------------------------------------------
      | APPOINTMENTS
      |--------------------------------------------------------------------------
      */

      {
        path: "appointments",
        element: <Appointments />,
      },

      /*
      |--------------------------------------------------------------------------
      | ANALYTICS
      |--------------------------------------------------------------------------
      */

      {
        path: "analytics",
        element: <Analytics />,
      },

      /*
      |--------------------------------------------------------------------------
      | CUSTOMERS
      |--------------------------------------------------------------------------
      */

      {
        path: "customers",
        element: <Customers />,
      },

      /*
      |--------------------------------------------------------------------------
      | ORDERS
      |--------------------------------------------------------------------------
      */

      {
        path: "orders",
        element: <Orders />,
      },

      /*
      |--------------------------------------------------------------------------
      | SETTINGS
      |--------------------------------------------------------------------------
      */

      {
        path: "settings",
        element: <Settings />,
      },

      /*
      |--------------------------------------------------------------------------
      | PRODUCTS
      |--------------------------------------------------------------------------
      */

      {
        path: "products",
        element: <Products />,
      },

      /*
      |--------------------------------------------------------------------------
      | SUBSCRIPTION
      |--------------------------------------------------------------------------
      |
      | URL:
      | /dashboard/subscription
      |
      */

      {
        path: "subscription",
        element: <SubscriptionPage />,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  {
    path: "/notifications",

    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },

  /*
  |--------------------------------------------------------------------------
  | STAFF DASHBOARD
  |--------------------------------------------------------------------------
  */

  {
    path: "/staff",

    element: (
      <ProtectedRoute>
        <StaffLayout />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <StaffDashboard />,
      },

      {
        path: "dashboard",
        element: <StaffDashboard />,
      },

      {
        path: "appointments",
        element: <StaffAppointments />,
      },

      {
        path: "orders",
        element: <StaffOrders />,
      },

      {
        path: "customers",
        element: <StaffCustomers />,
      },

      {
        path: "notifications",
        element: <StaffNotifications />,
      },

      {
        path: "schedule",
        element: <StaffSchedule />,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | PUBLIC BUSINESS PROFILE
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | /legendbarber
  |
  | Keep this LAST among the application routes.
  |
  */

  {
    path: "/:username",
    element: <PublicBusinessRoute />,
  },

  /*
  |--------------------------------------------------------------------------
  | 404
  |--------------------------------------------------------------------------
  */

  {
    path: "*",
    element: <NotFound />,
  },
]);

/*
|--------------------------------------------------------------------------
| APP ROUTER
|--------------------------------------------------------------------------
*/

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
```