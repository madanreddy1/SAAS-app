import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../api/api";
import { useToast } from "../context/ToastContext";

function formatApiError(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || String(d)).join(", ");
  return err.message || "Could not save.";
}

function EditProjectModal({ project, open, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open && project) {
      setTitle(project.title ?? "");
      setDescription(project.description ?? "");
    }
  }, [open, project]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !project) return null;

  if (typeof document === "undefined") return null;

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Title is required.");
      return;
    }
    setLoading(true);
    try {
      // PUT matches common proxy behavior; backend mirrors PATCH.
      await API.put(`/projects/${project.id}`, {
        title: trimmed,
        description: description.trim(),
      });
      toast.success("Project updated.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 z-0 bg-[color-mix(in_oklab,#000_50%,transparent)] backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg pointer-events-auto">
        <form
          className="card-surface rounded-2xl p-6 shadow-[var(--shadow-elevated)] ring-1 ring-[color-mix(in_oklab,var(--border)_60%,transparent)]"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <h2 className="text-lg font-semibold text-[var(--text-h)]">Edit project</h2>
          <p className="mt-1 text-sm text-[var(--text)] opacity-85">Update title and description.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="edit-project-title">
                Title
              </label>
              <input
                id="edit-project-title"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label" htmlFor="edit-project-description">
                Description
              </label>
              <input
                id="edit-project-description"
                className="input-field"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-compact"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-compact" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default EditProjectModal;
