import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ToastContainer } from "../components/ToastContainer";
import type {
  PromiseToastMessages,
  PromiseToastOptions,
  ResolvedToastTheme,
  ToastAnimation,
  ToastContextValue,
  ToastItem,
  ToastOptions,
  ToastPosition,
  ToastProviderProps
} from "../types/toast.types";

const DEFAULT_DURATION = 2000;
const DEFAULT_POSITION: ToastPosition = "top-right";
const DEFAULT_ANIMATION: ToastAnimation = "slide";
const DEFAULT_MAX_VISIBLE = 4;
const DEFAULT_THEME: ResolvedToastTheme = "dark";

const resolveSystemTheme = (): ResolvedToastTheme => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return DEFAULT_THEME;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

let toastCounter = 0;
const createToastId = (): string => {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
};

interface ToastState {
  visible: ToastItem[];
  queue: ToastItem[];
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);

const refillVisible = (
  visible: ToastItem[],
  queue: ToastItem[],
  maxVisibleToasts: number
): ToastState => {
  const nextVisible = [...visible];
  const nextQueue = [...queue];

  while (nextVisible.length < maxVisibleToasts && nextQueue.length > 0) {
    const next = nextQueue.shift();
    if (next) {
      nextVisible.push(next);
    }
  }

  return { visible: nextVisible, queue: nextQueue };
};

export function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
  position = DEFAULT_POSITION,
  animation = DEFAULT_ANIMATION,
  maxVisibleToasts = DEFAULT_MAX_VISIBLE,
  theme = "auto"
}: ToastProviderProps) {
  const [state, setState] = useState<ToastState>({ visible: [], queue: [] });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedToastTheme>(() =>
    theme === "auto" ? resolveSystemTheme() : theme
  );

  useEffect(() => {
    if (theme !== "auto") {
      setResolvedTheme(theme);
      return undefined;
    }

    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setResolvedTheme(DEFAULT_THEME);
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    };

    syncTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncTheme);
      return () => mediaQuery.removeEventListener("change", syncTheme);
    }

    mediaQuery.addListener(syncTheme);
    return () => mediaQuery.removeListener(syncTheme);
  }, [theme]);

  const dismissToast = useCallback(
    (id: string) => {
      setState((current) => {
        const filteredVisible = current.visible.filter((toast) => toast.id !== id);
        if (filteredVisible.length !== current.visible.length) {
          return refillVisible(filteredVisible, current.queue, maxVisibleToasts);
        }

        return {
          visible: current.visible,
          queue: current.queue.filter((toast) => toast.id !== id)
        };
      });
    },
    [maxVisibleToasts]
  );

  const clearToasts = useCallback(() => {
    setState({ visible: [], queue: [] });
  }, []);

  const showToast = useCallback(
    ({ message, type = "info", duration: durationOverride }: ToastOptions) => {
      const id = createToastId();
      const newToast: ToastItem = {
        id,
        message,
        type,
        duration: durationOverride ?? duration
      };

      setState((current) => {
        if (current.visible.length < maxVisibleToasts) {
          return { visible: [...current.visible, newToast], queue: current.queue };
        }

        return { visible: current.visible, queue: [...current.queue, newToast] };
      });

      return id;
    },
    [duration, maxVisibleToasts]
  );

  const promiseToast = useCallback(
    async <T,>(
      promiseLike: Promise<T>,
      messages: PromiseToastMessages<T>,
      options?: PromiseToastOptions
    ): Promise<T> => {
      const loadingId = showToast({
        message: messages.loading,
        type: "info",
        duration: 0
      });

      try {
        const result = await promiseLike;
        dismissToast(loadingId);
        showToast({
          message:
            typeof messages.success === "function"
              ? messages.success(result)
              : messages.success,
          type: "success",
          duration: options?.successDuration
        });
        return result;
      } catch (error) {
        dismissToast(loadingId);
        showToast({
          message:
            typeof messages.error === "function"
              ? messages.error(error)
              : messages.error,
          type: "error",
          duration: options?.errorDuration
        });
        throw error;
      }
    },
    [dismissToast, showToast]
  );

  const toast = useMemo(
    () => ({
      show: showToast,
      dismiss: dismissToast,
      clear: clearToasts,
      promise: promiseToast
    }),
    [showToast, dismissToast, clearToasts, promiseToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
      clearToasts,
      promiseToast,
      toast
    }),
    [showToast, dismissToast, clearToasts, promiseToast, toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        animation={animation}
        onDismiss={dismissToast}
        position={position}
        theme={resolvedTheme}
        toasts={state.visible}
      />
    </ToastContext.Provider>
  );
}
