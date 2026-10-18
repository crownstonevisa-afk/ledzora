"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastData {
  id: number;
  message: string;
  kind: "success" | "error" | "info";
}

const ToastCtx = createContext<(message: string, kind?: ToastData["kind"]) => void>(() => {});

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, kind: ToastData["kind"] = "success") => {
    if (timer.current) clearTimeout(timer.current);
    const id = Date.now();
    setToast({ id, message, kind });
    if (kind !== "error") {
      timer.current = setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 4000);
    }
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div className={`toast toast-${toast.kind}`} role="status">
          {toast.kind === "success" && <span aria-hidden="true">&#10003;</span>}
          <span>{toast.message}</span>
          {toast.kind === "error" && (
            <button className="toast-x" onClick={() => setToast(null)} aria-label="Dismiss">
              &times;
            </button>
          )}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
