import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrentStaff } from "../services/staffData";
import type { Staff } from "../types";

type StaffCtx = {
  staff: Staff | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
};
const Ctx = createContext<StaffCtx | null>(null);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setError("");
      const s = await getCurrentStaff();
      setStaff(s as Staff);
    } catch (e: any) {
      setError(e.message || "Failed to load staff account.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return <Ctx.Provider value={{ staff, loading, error, reload }}>{children}</Ctx.Provider>;
}

export function useStaff() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
}
