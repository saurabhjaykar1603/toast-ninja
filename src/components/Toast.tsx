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

// Compact inline SVG icons
const TypeIcon = ({ type }: { type: ToastItem["type"] }) => {
  if (type === "success") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
  if (type === "error") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
  if (type === "warning") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
};

const typeLabel: Record<ToastItem["type"], string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info"
};

export function Toast({ toast, animation, position, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const closeToast = useCallback(() => {
    setIsExiting((v) => v || true);
  }, []);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const id = window.setTimeout(closeToast, toast.duration);
    return () => window.clearTimeout(id);
  }, [toast.duration, closeToast]);

  useEffect(() => {
    if (!isExiting) return;
    const id = window.setTimeout(() => onDismiss(toast.id), EXIT_MS);
    return () => window.clearTimeout(id);
  }, [isExiting, onDismiss, toast.id]);

  // Animate progress bar from 100% → 0%
  useEffect(() => {
    const el = progressRef.current;
    if (!el || toast.duration <= 0) return;
    el.style.width = "100%";
    el.style.transition = "none";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = `width ${toast.duration}ms linear`;
      el.style.width = "0%";
    }));
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
      {/* Subtle top progress bar */}
      {toast.duration > 0 && (
        <div ref={progressRef} className="toast-ninja-progress" />
      )}

      {/* Icon badge */}
      <span className="toast-ninja-icon">
        <TypeIcon type={toast.type} />
      </span>

      {/* Text */}
      <div className="toast-ninja-content">
        <p className="toast-ninja-title">{typeLabel[toast.type]}</p>
        <p className="toast-ninja-message">{toast.message}</p>
      </div>

      {/* Close */}
      <button
        type="button"
        className="toast-ninja-close"
        onClick={closeToast}
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
