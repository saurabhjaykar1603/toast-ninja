import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "../src/context/ToastContext";
import { useToast } from "../src/hooks/useToast";

function TriggerButtons() {
  const { showToast } = useToast();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          showToast({
            message: "Saved successfully",
            type: "success"
          })
        }
      >
        show success
      </button>
      <button
        type="button"
        onClick={() =>
          showToast({
            message: "Something went wrong",
            type: "error"
          })
        }
      >
        show error
      </button>
      <button
        type="button"
        onClick={() =>
          showToast({
            message: "Heads up",
            type: "warning"
          })
        }
      >
        show warning
      </button>
      <button
        type="button"
        onClick={() =>
          showToast({
            message: "FYI message",
            type: "info"
          })
        }
      >
        show info
      </button>
      <button
        type="button"
        onClick={() => {
          showToast({ message: "toast one", type: "info", duration: 4000 });
          showToast({ message: "toast two", type: "success", duration: 4000 });
          showToast({ message: "toast three", type: "warning", duration: 4000 });
        }}
      >
        stack toasts
      </button>
    </div>
  );
}

function QueueButton() {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        showToast({ message: "First queued", type: "info", duration: 100 });
        showToast({ message: "Second queued", type: "success", duration: 100 });
      }}
    >
      queue toasts
    </button>
  );
}

describe("toast-ninja", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("provider renders correctly", () => {
    render(
      <ToastProvider>
        <div>Provider child</div>
      </ToastProvider>
    );

    expect(screen.getByText("Provider child")).toBeInTheDocument();
  });

  test("toast appears when triggered", () => {
    render(
      <ToastProvider>
        <TriggerButtons />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "show success" }));
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
  });

  test("toast auto removes after duration", async () => {
    jest.useFakeTimers();

    render(
      <ToastProvider duration={100}>
        <TriggerButtons />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "show success" }));
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(450);
    });

    await waitFor(() => {
      expect(screen.queryByText("Saved successfully")).not.toBeInTheDocument();
    });
  });

  test("multiple toasts stack vertically", () => {
    render(
      <ToastProvider>
        <TriggerButtons />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "stack toasts" }));
    expect(screen.getByText("toast one")).toBeInTheDocument();
    expect(screen.getByText("toast two")).toBeInTheDocument();
    expect(screen.getByText("toast three")).toBeInTheDocument();
  });

  test("toast types render correctly", () => {
    render(
      <ToastProvider>
        <TriggerButtons />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "show success" }));
    fireEvent.click(screen.getByRole("button", { name: "show error" }));
    fireEvent.click(screen.getByRole("button", { name: "show warning" }));
    fireEvent.click(screen.getByRole("button", { name: "show info" }));

    expect(
      screen.getByText("Saved successfully").closest("[data-type='success']")
    ).toBeInTheDocument();
    expect(
      screen
        .getByText("Something went wrong")
        .closest("[data-type='error']")
    ).toBeInTheDocument();
    expect(screen.getByText("Heads up").closest("[data-type='warning']")).toBeInTheDocument();
    expect(screen.getByText("FYI message").closest("[data-type='info']")).toBeInTheDocument();
  });

  test("queue shows next toast when one closes", async () => {
    jest.useFakeTimers();

    render(
      <ToastProvider maxVisibleToasts={1}>
        <QueueButton />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "queue toasts" }));
    expect(screen.getByText("First queued")).toBeInTheDocument();
    expect(screen.queryByText("Second queued")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("Second queued")).toBeInTheDocument();
    });
  });
});
