import { Toast } from "./Toast";
import type {
  ResolvedToastTheme,
  ToastAnimation,
  ToastItem,
  ToastPosition
} from "../types/toast.types";

interface ToastContainerProps {
  toasts: ToastItem[];
  position: ToastPosition;
  animation: ToastAnimation;
  theme: ResolvedToastTheme;
  onDismiss: (id: string) => void;
}

export function ToastContainer({
  toasts,
  position,
  animation,
  theme,
  onDismiss
}: ToastContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-relevant="additions removals"
      className={`toast-ninja-container toast-ninja-container--${position}`}
      data-theme={theme}
      data-testid="toast-container"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          animation={animation}
          onDismiss={onDismiss}
          position={position}
          toast={toast}
        />
      ))}
    </div>
  );
}
