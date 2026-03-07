import type { ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";
export type ToastAnimation = "slide" | "fade";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface PromiseToastMessages<T = unknown> {
  loading: string;
  success: string | ((value: T) => string);
  error: string | ((error: unknown) => string);
}

export interface PromiseToastOptions {
  successDuration?: number;
  errorDuration?: number;
}

export interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
  position?: ToastPosition;
  animation?: ToastAnimation;
  maxVisibleToasts?: number;
}

export interface ToastApi {
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
  promise: <T>(
    promiseLike: Promise<T>,
    messages: PromiseToastMessages<T>,
    options?: PromiseToastOptions
  ) => Promise<T>;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  promiseToast: <T>(
    promiseLike: Promise<T>,
    messages: PromiseToastMessages<T>,
    options?: PromiseToastOptions
  ) => Promise<T>;
  toast: ToastApi;
}
