import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { onboardingService } from "../../onboarding/services/onboarding.service";

export default function OnboardingRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [complete, setComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkProgress() {
      if (loading || !user) return;

      try {
        const progress = await onboardingService.getProgress();
        if (mounted) {
          setComplete(progress?.completed === true || Number(progress?.current_step) >= 6);
        }
      } catch (error) {
        console.error("OnboardingRoute:", error);
        if (mounted) setComplete(false);
      }
    }

    void checkProgress();
    return () => {
      mounted = false;
    };
  }, [loading, user]);

  if (loading || (user && complete === null)) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (complete) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
