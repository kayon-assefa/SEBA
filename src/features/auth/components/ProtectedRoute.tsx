import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/Languagecontext";
import { onboardingService } from "../../onboarding/services/onboarding.service";

type ProtectedRouteProps = {
  children: ReactNode;
};

function LoadingScreen() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>{t("loadingApp")}</p>
    </div>
  );
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, accountType } = useAuth();
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const isStaffPath = location.pathname.startsWith("/staff");
  const isOwnerDashboardPath = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    let mounted = true;

    async function check() {
      if (loading) return;

      if (!user) {
        if (mounted) {
          setOnboardingComplete(false);
          setChecking(false);
        }
        return;
      }

      // Account-type gate. Staff must never enter the owner dashboard.
      if (accountType) {
        if (isStaffPath && accountType !== "staff") {
          if (mounted) setChecking(false);
          return;
        }

        if (isOwnerDashboardPath && accountType === "staff") {
          if (mounted) setChecking(false);
          return;
        }
      }

      // Staff do not use owner onboarding.
      if (accountType === "staff") {
        if (mounted) {
          setOnboardingComplete(true);
          setChecking(false);
        }
        return;
      }

      try {
        const progress = await onboardingService.getProgress();

        if (progress?.completed === true) {
          if (mounted) {
            setOnboardingComplete(true);
            setChecking(false);
          }
          return;
        }

        if (!progress) {
          if (isOwnerDashboardPath) {
            if (mounted) {
              setOnboardingComplete(false);
              setChecking(false);
            }

            window.location.replace("/onboarding/business");
            return;
          }

          if (mounted) {
            setOnboardingComplete(false);
            setChecking(false);
          }

          return;
        }

        const step = Number(progress.current_step) || 1;

        const routes: Record<number, string> = {
          1: "/onboarding/business",
          2: "/onboarding/templates",
          3: "/onboarding/customize",
          4: "/onboarding/appointments",
          5: "/onboarding/shop",
          6: "/dashboard",
        };

        if (step >= 6) {
          if (mounted) {
            setOnboardingComplete(true);
            setChecking(false);
          }
          return;
        }

        if (isOwnerDashboardPath) {
          if (mounted) {
            setOnboardingComplete(false);
            setChecking(false);
          }

          window.location.replace(
            routes[step] ?? "/onboarding/business"
          );

          return;
        }

        if (mounted) {
          setOnboardingComplete(false);
          setChecking(false);
        }
      } catch (error) {
        console.error("ProtectedRoute:", error);

        if (mounted) {
          setChecking(false);
        }
      }
    }

    void check();

    return () => {
      mounted = false;
    };
  }, [
    loading,
    user,
    accountType,
    location.pathname,
    isStaffPath,
    isOwnerDashboardPath,
  ]);

  if (loading || checking || (user && !accountType)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isStaffPath && accountType !== "staff") {
    return <Navigate to="/dashboard" replace />;
  }

  if (isOwnerDashboardPath && accountType === "staff") {
    return <Navigate to="/staff/dashboard" replace />;
  }

  if (isOwnerDashboardPath && !onboardingComplete) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
