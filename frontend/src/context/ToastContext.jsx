/* eslint-disable react-refresh/only-export-components -- context + hook pattern */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IconAlertCircle, IconCheckCircle, IconInfo } from "../components/icons";

const ToastContext = createContext(null);

function ToastContainer({ items, onDismiss }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[400] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={`toast-pop pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-[var(--shadow)] backdrop-blur-xl ${
            item.type === "success"
              ? "border-emerald-500/35 bg-[color-mix(in_oklab,#22c55e_14%,transparent)] text-[var(--text-h)] ring-1 ring-emerald-500/15"
              : item.type === "error"
                ? "border-red-500/40 bg-[color-mix(in_oklab,#ef4444_12%,transparent)] text-[var(--text-h)] ring-1 ring-red-500/10"
                : "border-[var(--border)]/80 bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] text-[var(--text-h)] ring-1 ring-white/10"
          }`}
          role="status"
        >
          <span className="select-none leading-none text-[var(--accent)]" aria-hidden>
            {item.type === "success" ? (
              <IconCheckCircle className="h-[1.125rem] w-[1.125rem] text-emerald-600 dark:text-emerald-400" />
            ) : item.type === "error" ? (
              <IconAlertCircle className="h-[1.125rem] w-[1.125rem] text-red-600 dark:text-red-400" />
            ) : (
              <IconInfo className="h-[1.125rem] w-[1.125rem]" />
            )}
          </span>
          <p className="min-w-0 flex-1 leading-snug">{item.message}</p>
          <button
            type="button"
            className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium opacity-70 hover:opacity-100"
            onClick={() => onDismiss(item.id)}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((type, message) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setItems((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => dismiss(id), 5200);
  }, [dismiss]);

  const toast = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
