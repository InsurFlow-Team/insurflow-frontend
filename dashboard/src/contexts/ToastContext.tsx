/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  notify: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;
const MAX_VISIBLE_TOASTS = 4;

let nextId = 1;
let emit: ToastContextValue["notify"] | null = null;
let pendingQueue: Array<{ kind: ToastKind; message: string }> = [];

/** Imperative toaster — usable outside React (e.g. from the axios client). */
export function toast(kind: ToastKind, message: string) {
  if (emit) {
    emit(kind, message);
    return;
  }
  pendingQueue.push({ kind, message });
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback<ToastContextValue["notify"]>(
    (kind, message) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-(MAX_VISIBLE_TOASTS - 1)), { id, kind, message }]);
      const timerId = window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timersRef.current.push(timerId);
    },
    [dismiss],
  );

  // Clear all timers on unmount.
  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    emit = notify;
    // Flush any toasts fired before the provider was mounted.
    const queued = pendingQueue;
    pendingQueue = [];
    queued.forEach((t) => notify(t.kind, t.message));

    return () => {
      emit = null;
    };
  }, [notify]);

  const value = useMemo(
    () => ({ toasts, notify, dismiss }),
    [toasts, notify, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}