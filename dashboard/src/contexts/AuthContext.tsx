import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { TOKEN_STORAGE_KEY } from "../api/client";
import type { User } from "../types";

const USER_STORAGE_KEY = "insurflow_user";

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

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const saveSession = useCallback(
    (newToken: string, authenticatedUser: User) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(authenticatedUser),
      );

      setToken(newToken);
      setUser(authenticatedUser);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      saveSession,
      logout,
    }),
    [user, token, saveSession, logout],
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