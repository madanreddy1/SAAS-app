import { createPortal } from "react-dom";

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Use a div (not a full-screen button) so primary actions stay reliably clickable */}
      <div
        className="absolute inset-0 z-0 bg-[color-mix(in_oklab,#000_50%,transparent)] backdrop-blur-sm"
        aria-hidden
        onClick={() => !busy && onCancel()}
      />
      <div
        className="card-surface pointer-events-auto relative z-10 w-full max-w-md rounded-2xl p-6 shadow-[var(--shadow-elevated)] ring-1 ring-[color-mix(in_oklab,var(--border)_60%,transparent)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-h)]">{title}</h2>
        {message ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--text)] opacity-90">{message}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-compact"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              if (!busy) onCancel();
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn-compact ${
              danger
                ? "border-transparent bg-red-600 text-white hover:bg-red-700"
                : "btn-primary"
            }`}
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!busy) onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;
