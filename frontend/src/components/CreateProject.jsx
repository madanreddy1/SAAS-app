import { useState } from "react";
import API from "../api/api";
import { IconSparkles } from "./icons";
import { useToast } from "../context/ToastContext";

function formatApiError(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || String(d)).join(", ");
  if (err.response?.status === 401) return "Session expired. Sign in again.";
  return err.message || "Something went wrong.";
}

function CreateProject({ onProjectCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Enter a project title.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/projects/", { title: trimmed, description: description.trim() });
      setTitle("");
      setDescription("");
      toast.success("Project created.");
      onProjectCreated();
    } catch (err) {
      toast.error(formatApiError(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card-surface p-6 sm:p-7" aria-labelledby="create-project-heading">
      <div className="flex flex-wrap items-start gap-3">
        <span
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--accent)] ring-1 ring-[var(--accent-border)]"
          aria-hidden
        >
          <IconSparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="create-project-heading" className="text-lg font-semibold tracking-tight text-[var(--text-h)]">
            Create project
          </h2>
          <p className="mt-1 text-sm text-[var(--text)] opacity-85">
            New projects open on the Kanban board so you can triage work right away.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <label className="label" htmlFor="project-title">
              Title
            </label>
            <input
              id="project-title"
              className="input-field"
              placeholder="e.g. Mobile launch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="project-description">
              Description <span className="font-normal opacity-60">(optional)</span>
            </label>
            <input
              id="project-description"
              className="input-field"
              placeholder="Short summary for your team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary shrink-0 sm:self-stretch sm:px-8"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating…" : "Create"}
        </button>
      </div>
    </section>
  );
}

export default CreateProject;
