import { useEffect, useRef, useState } from "react";

const MAX_VISIBLE = 3;
const TOAST_MS = 3000;

type ToastType = "success" | "error";
type ToastData = { id: number; type: ToastType; message: string };

const MESSAGES: Record<ToastType, string> = {
  success: "Saved successfully",
  error: "Something went wrong",
};

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: number) => void;
}) {
  // Time left before this toast closes, and when the current run started.
  const remaining = useRef(TOAST_MS);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resume() {
    if (timer.current !== null) return;
    startedAt.current = Date.now();
    timer.current = setTimeout(() => onDismiss(toast.id), remaining.current);
  }

  function pause() {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current -= Date.now() - startedAt.current;
  }

  // The clock starts when the toast becomes visible, i.e. when it mounts.
  useEffect(() => {
    resume();
    return pause;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      data-testid="toast"
      data-type={toast.type}
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <span>{toast.message}</span>
      <button
        data-testid="dismiss-button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

export default function App() {
  // Every toast, oldest first: the first MAX_VISIBLE are shown, the rest wait.
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(1);

  function add(type: ToastType) {
    const id = nextId.current++;
    setToasts((ts) => [
      ...ts,
      { id, type, message: `${MESSAGES[type]} #${id}` },
    ]);
  }

  function dismiss(id: number) {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }

  const visible = toasts.slice(0, MAX_VISIBLE);
  const queued = toasts.length - visible.length;

  return (
    <div>
      <button data-testid="add-success" onClick={() => add("success")}>
        Add success
      </button>
      <button data-testid="add-error" onClick={() => add("error")}>
        Add error
      </button>
      <div data-testid="toast-region" aria-live="polite">
        {visible.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
        {queued > 0 && <p data-testid="queue-count">+{queued} more</p>}
      </div>
    </div>
  );
}
