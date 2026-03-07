import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ToastAnimation,
  ToastItem,
  ToastPosition
} from "../types/toast.types";

const EXIT_MS = 220;

interface ToastProps {
  toast: ToastItem;
  animation: ToastAnimation;
  position: ToastPosition;
  onDismiss: (id: string) => void;
}

const typeLabel: Record<ToastItem["type"], string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info"
};

// Minimal inline SVG icons — no external deps
const TypeIcon = ({ type }: { type: ToastItem["type"] }) => {
  if (type === "success") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  // info
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
};

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function Toast({ toast, animation, position, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const closeToast = useCallback(() => {
    setIsExiting((current) => (current ? current : true));
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.duration <= 0) return undefined;

    const timerId = window.setTimeout(closeToast, toast.duration);
    return () => window.clearTimeout(timerId);
  }, [toast.duration, closeToast]);

  // Exit animation → remove from DOM
  useEffect(() => {
    if (!isExiting) return undefined;

    const timerId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, EXIT_MS);

    return () => window.clearTimeout(timerId);
  }, [isExiting, onDismiss, toast.id]);

  // Progress bar animation
  useEffect(() => {
    const el = progressRef.current;
    if (!el || toast.duration <= 0) return;

    el.style.width = "100%";
    el.style.transition = "none";

    // Next frame: animate width to 0
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `width ${toast.duration}ms linear`;
        el.style.width = "0%";
      });
    });
  }, [toast.duration, toast.id]);

  return (
    <div
      role="status"
      data-type={toast.type}
      data-position={position}
      className={[
        "toast-ninja-item",
        `toast-ninja-item--${toast.type}`,
        `toast-ninja-item--${animation}`,
        isExiting ? "toast-ninja-item--exit" : "toast-ninja-item--enter"
      ].join(" ")}
    >
      <span className="toast-ninja-icon">
        <TypeIcon type={toast.type} />
      </span>

      <div className="toast-ninja-content">
        <p className="toast-ninja-title">{typeLabel[toast.type]}</p>
        <p className="toast-ninja-message">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={closeToast}
        className="toast-ninja-close"
        aria-label="Dismiss toast"
      >
        <CloseIcon />
      </button>

      {toast.duration > 0 && (
        <div ref={progressRef} className="toast-ninja-progress" />
      )}
    </div>
  );
}
