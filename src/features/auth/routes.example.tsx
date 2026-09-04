// Example only — merge these routes into your existing <Routes> tree.
// Shows every path this package expects to exist.

import { Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Sessions from "./pages/Sessions";
import SecuritySettings from "./pages/SecuritySettings";
import ProtectedRoute from "./components/ProtectedRoute";

export const authRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />

    {/* These need a signed-in user */}
    <Route
      path="/sessions"
      element={
        <ProtectedRoute>
          <Sessions />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings/security"
      element={
        <ProtectedRoute>
          <SecuritySettings />
        </ProtectedRoute>
      }
    />
  </>
);
