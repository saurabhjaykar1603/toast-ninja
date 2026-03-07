import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ToastAnimation, ToastItem, ToastPosition } from "../types/toast.types";

// Must match exit transition duration in toast.css
const EXIT_MS = 280;

interface ToastProps {
  toast:     ToastItem;
  animation: ToastAnimation;
  position:  ToastPosition;
  onDismiss: (id: string) => void;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const ICONS: Record<ToastItem["type"], JSX.Element> = {
  success: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6"  y1="6" x2="18" y2="18" />
    </svg>
  ),
  warning: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9"  x2="12"   y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8"  x2="12"   y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const LABELS: Record<ToastItem["type"], string> = {
  success: "Success",
  error:   "Error",
  warning: "Warning",
  info:    "Info",
};

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

export function Toast({ toast, animation, position, onDismiss }: ToastProps) {
  const [isEntered, setIsEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const collapserRef = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);

  // Trigger the visual entry transition one frame after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Start auto-dismiss countdown
  useEffect(() => {
    if (toast.duration <= 0) return;
    const id = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(id);
  }, [toast.duration]); // eslint-disable-line react-hooks/exhaustive-deps

  // On exit: collapse the wrapper height so surrounding toasts slide smoothly,
  // then call onDismiss when both the visual + layout animations are done.
  useLayoutEffect(() => {
    if (!isExiting) return;

    const el = collapserRef.current;
    if (el) {
      // Snapshot current height synchronously (before browser repaints)
      const h = el.offsetHeight;
      el.style.height = `${h}px`;

      // Force reflow — makes the browser register 'h' as the animation start
      void el.offsetHeight;

      // Collapse height + spacing over the same duration as visual fade-out
      const easing = `${EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      el.style.transition     = `height ${easing}, padding-bottom ${easing}`;
      el.style.height         = "0";
      el.style.paddingBottom  = "0";
      el.style.overflow       = "hidden";
    }

    // Remove from React state after animation completes
    const id = setTimeout(() => onDismiss(toast.id), EXIT_MS);
    return () => clearTimeout(id);
  }, [isExiting]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate the progress bar from full → empty using transform (GPU-accelerated)
  useEffect(() => {
    const el = progressRef.current;
    if (!el || toast.duration <= 0) return;

    let r1 = 0, r2 = 0;

    // Reset to full width without transition
    el.style.transform  = "scaleX(1)";
    el.style.transition = "none";

    // Two RAFs ensure the reset is painted before the animation starts
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        el.style.transition = `transform ${toast.duration}ms linear`;
        el.style.transform  = "scaleX(0)";
      });
    });

    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [toast.duration, toast.id]);

  const dismiss = useCallback(() => setIsExiting(true), []);

  const stateClass = isExiting  ? "toast-ninja-item--exit"
                   : isEntered  ? "toast-ninja-item--entered"
                   :              "toast-ninja-item--enter";

  return (
    // Outer wrapper: controls layout space (height collapses on exit)
    <div ref={collapserRef} style={{ paddingBottom: "0.5rem" }}>

      {/* Inner card: handles visual opacity + transform transition */}
      <div
        role="status"
        aria-live="polite"
        data-type={toast.type}
        data-position={position}
        className={[
          "toast-ninja-item",
          `toast-ninja-item--${toast.type}`,
          `toast-ninja-item--${animation}`,
          stateClass,
        ].join(" ")}
      >
        {/* Progress bar — drains left to right across the top */}
        {toast.duration > 0 && (
          <div ref={progressRef} className="toast-ninja-progress" />
        )}

        {/* Coloured icon badge */}
        <span className="toast-ninja-icon">
          {ICONS[toast.type]}
        </span>

        {/* Title + message */}
        <div className="toast-ninja-content">
          <p className="toast-ninja-title">{LABELS[toast.type]}</p>
          <p className="toast-ninja-message">{toast.message}</p>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          className="toast-ninja-close"
          onClick={dismiss}
          aria-label="Dismiss notification"
        >
          {CLOSE_ICON}
        </button>
      </div>
    </div>
  );
}
