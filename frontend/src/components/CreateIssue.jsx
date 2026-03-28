import { useState } from "react";
import API from "../api/api";
import { useToast } from "../context/ToastContext";

function formatApiError(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || String(d)).join(", ");
  if (err.response?.status === 401) return "Session expired. Sign in again.";
  return err.message || "Something went wrong.";
}

function CreateIssue({ projectId, onIssueCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Enter an issue title.");
      return;
    }
    setLoading(true);
    try {
      await API.post(`/issues/projects/${projectId}`, {
        title: trimmed,
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      toast.success("Issue added.");
      onIssueCreated();
    } catch (err) {
      toast.error(formatApiError(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card-surface p-6 sm:p-7" aria-labelledby="create-issue-heading">
      <h2 id="create-issue-heading" className="text-lg font-semibold text-[var(--text-h)]">
        New issue
      </h2>
      <p className="mt-1 text-sm text-[var(--text)] opacity-85">
        New issues start in <strong className="font-semibold text-[var(--text-h)]">Todo</strong> on
        the board.
      </p>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <label className="label" htmlFor="issue-title">
              Title
            </label>
            <input
              id="issue-title"
              className="input-field"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="issue-description">
              Description <span className="font-normal opacity-60">(optional)</span>
            </label>
            <input
              id="issue-description"
              className="input-field"
              placeholder="Context, links, acceptance criteria…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary shrink-0 lg:self-stretch lg:px-8"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Adding…" : "Add issue"}
        </button>
      </div>
    </section>
  );
}

export default CreateIssue;
