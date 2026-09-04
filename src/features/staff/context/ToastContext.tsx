import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Icon } from "../components/Icons";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastCtx = { show: (message: string, kind?: ToastKind) => void };
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, kind, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="ss-toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`ss-toast ${t.kind}`}>
            <span className="icon">
              {t.kind === "success" && <Icon.CheckCircle size={18} />}
              {t.kind === "error" && <Icon.XCircle size={18} />}
              {t.kind === "info" && <Icon.Info size={18} />}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
