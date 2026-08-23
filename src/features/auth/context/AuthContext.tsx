import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../../../lib/supabase";
import {
  getAccountType,
  type AccountType,
  type StaffAuthProfile,
} from "../services/auth.service";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  accountType: AccountType | null;
  staff: StaffAuthProfile | null;
  loading: boolean;
  refreshAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [staff, setStaff] = useState<StaffAuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAccount(nextUser: User | null) {
    if (!nextUser) {
      setAccountType(null);
      setStaff(null);
      return;
    }

    try {
      const result = await getAccountType(nextUser.id);
      setAccountType(result.accountType);
      setStaff(result.staff);
    } catch (error) {
      console.error("AuthContext account lookup:", error);
      setAccountType(null);
      setStaff(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await loadAccount(data.session.user);
      }

      if (mounted) setLoading(false);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await loadAccount(nextSession.user);
      } else {
        setAccountType(null);
        setStaff(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refreshAccount() {
    if (!user) return;
    await loadAccount(user);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        accountType,
        staff,
        loading,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
