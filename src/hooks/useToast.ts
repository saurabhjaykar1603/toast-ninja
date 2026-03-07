import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";
import type { ToastContextValue } from "../types/toast.types";

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
