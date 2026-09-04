import { useEffect, useState } from "react";
import { useLanguage } from "../context/Languagecontext";
import { callEdgeFunction } from "../../../lib/supabase";
import { seba } from "../design/tokens";

type SessionRow = {
  id: string;
  device: string;
  ip: string;
  lastActiveAt: string;
  isCurrent: boolean;
};

type LoginEvent = {
  id: string;
  ip: string;
  device: string;
  success: boolean;
  createdAt: string;
};

/**
 * Items #15 / #33 / #50: lets a user see and revoke where they're signed
 * in, and see recent sign-in attempts against their account. Data comes
 * from login-guard's "list-sessions" / "list-activity" actions, backed by
 * the login_attempts + a Supabase-native session listing (auth.sessions,
 * read via an edge function using the service role — the client anon key
 * can't read other users' sessions, and shouldn't be able to read the raw
 * table for its own either without going through RLS-scoped logic).
 */
export default function Sessions() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [activity, setActivity] = useState<LoginEvent[] | null>(null);

  useEffect(() => {
    void callEdgeFunction<{ sessions: SessionRow[] }>("login-guard", { action: "list-sessions" })
      .then((d) => setSessions(d.sessions))
      .catch(() => setSessions([]));

    void callEdgeFunction<{ events: LoginEvent[] }>("login-guard", { action: "list-activity" })
      .then((d) => setActivity(d.events))
      .catch(() => setActivity([]));
  }, []);

  async function revoke(sessionId: string) {
    await callEdgeFunction("login-guard", { action: "revoke-session", sessionId });
    setSessions((prev) => prev?.filter((s) => s.id !== sessionId) ?? null);
  }

  async function revokeAll() {
    await callEdgeFunction("login-guard", { action: "revoke-other-sessions" });
    setSessions((prev) => prev?.filter((s) => s.isCurrent) ?? null);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="text-2xl font-black" style={{ color: seba.ink }}>
        {t("sessionsTitle")}
      </h1>
      <p className="mt-1 text-sm" style={{ color: seba.inkMuted }}>
        {t("sessionsSubtitle")}
      </p>

      <div className="mt-6 divide-y rounded-2xl border" style={{ borderColor: seba.hairline }}>
        {sessions === null && <SkeletonRows />}
        {sessions?.length === 0 && <EmptyRow />}
        {sessions?.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold" style={{ color: seba.ink }}>
                {s.device} {s.isCurrent && <span style={{ color: seba.success }}>· {t("thisDevice")}</span>}
              </p>
              <p className="text-xs" style={{ color: seba.inkMuted }}>
                {s.ip} · {new Date(s.lastActiveAt).toLocaleString()}
              </p>
            </div>
            {!s.isCurrent && (
              <button
                onClick={() => revoke(s.id)}
                className="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold"
                style={{ borderColor: seba.hairline, color: seba.red }}
              >
                {t("revoke")}
              </button>
            )}
          </div>
        ))}
      </div>

      {sessions && sessions.length > 1 && (
        <button
          onClick={revokeAll}
          className="mt-4 w-full rounded-full border py-3 text-sm font-bold"
          style={{ borderColor: seba.hairline, color: seba.red }}
        >
          {t("revokeAll")}
        </button>
      )}

      <h2 className="mt-10 text-lg font-black" style={{ color: seba.ink }}>
        {t("loginActivityTitle")}
      </h2>

      <div className="mt-4 divide-y rounded-2xl border" style={{ borderColor: seba.hairline }}>
        {activity === null && <SkeletonRows />}
        {activity?.length === 0 && <EmptyRow />}
        {activity?.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold" style={{ color: e.success ? seba.ink : seba.danger }}>
                {e.device}
              </p>
              <p className="text-xs" style={{ color: seba.inkMuted }}>
                {e.ip} · {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: e.success ? "#EAF7EF" : "#FFF2F2",
                color: e.success ? seba.success : seba.danger,
              }}
            >
              {e.success ? "✓" : "✕"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-0">
      {[0, 1].map((i) => (
        <div key={i} className="h-16 animate-pulse px-4 py-3.5">
          <div className="h-3 w-40 rounded bg-black/5" />
          <div className="mt-2 h-2.5 w-24 rounded bg-black/5" />
        </div>
      ))}
    </div>
  );
}

function EmptyRow() {
  const { t } = useLanguage();
  return (
    <div className="px-4 py-6 text-center text-sm" style={{ color: seba.inkMuted }}>
      {t("noActivityYet")}
    </div>
  );
}
