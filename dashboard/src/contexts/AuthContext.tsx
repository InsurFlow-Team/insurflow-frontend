import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  saveSession: (token: string, user: User) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface StoredSession {
  token: string | null;
  user: User | null;
}

function clearStoredSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

function getStoredSession(): StoredSession {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedToken || !storedUser) {
    clearStoredSession();
    return { token: null, user: null };
  }

  try {
    const parsedUser = JSON.parse(storedUser) as User;

    if (
      storedToken === "temporary-access-token" ||
      parsedUser.role === "FIELD_ADJUSTER"
    ) {
      clearStoredSession();
      return { token: null, user: null };
    }

    return { token: storedToken, user: parsedUser };
  } catch {
    clearStoredSession();
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<StoredSession>(() =>
    getStoredSession(),
  );

  const saveSession = useCallback(
    (newToken: string, authenticatedUser: User) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(authenticatedUser),
      );

      setSession({ token: newToken, user: authenticatedUser });
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setSession({ token: null, user: null });
  }, []);

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.token && session.user),
      saveSession,
      logout,
    }),
    [session, saveSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
