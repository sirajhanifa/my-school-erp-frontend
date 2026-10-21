import { useState } from "react";
import Icon from "../icon/Icon";
import { useToastStore, type Toast, type ToastType } from "../../store/toastStore";

const EXIT_DURATION = 200;

const toastStyles: Record<
  ToastType,
  { icon: "CircleCheck" | "CircleX" | "TriangleAlert" | "Info"; title: string; badge: string; accent: string }
> = {
  success: { icon: "CircleCheck", title: "Success", badge: "bg-emerald-50 text-emerald-600 ring-emerald-100", accent: "bg-emerald-500" },
  error: { icon: "CircleX", title: "Error", badge: "bg-red-50 text-red-600 ring-red-100", accent: "bg-red-500" },
  warning: { icon: "TriangleAlert", title: "Warning", badge: "bg-amber-50 text-amber-600 ring-amber-100", accent: "bg-amber-500" },
  info: { icon: "Info", title: "Info", badge: "bg-blue-50 text-blue-600 ring-blue-100", accent: "bg-blue-500" },
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const style = toastStyles[toast.type];

  const close = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    setTimeout(onClose, EXIT_DURATION);
  };

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`group pointer-events-auto relative w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 transition-all duration-200 ease-out starting:translate-x-8 starting:opacity-0 ${
        isLeaving ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ${style.badge}`}>
          <Icon name={style.icon} size={18} strokeWidth={2.25} />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-slate-900">{toast.title ?? style.title}</p>
          <p className="mt-0.5 text-sm leading-5 break-words text-slate-600">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Dismiss notification"
          className="-mt-1 -mr-1 shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      {/* Countdown bar: the toast closes when its animation ends, and hovering pauses it. */}
      {toast.duration > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100">
          <div
            className={`animate-toast-progress h-full origin-left group-hover:[animation-play-state:paused] ${style.accent}`}
            style={{ animationDuration: `${toast.duration}ms` }}
            onAnimationEnd={close}
          />
        </div>
      )}
    </div>
  );
};

// Mount once near the root of the app.
const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 left-4 z-50 flex flex-col gap-3 sm:left-auto sm:w-96"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
};

export default Toaster;
