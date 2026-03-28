import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/api";
import CreateIssue from "../components/CreateIssue";
import AppLayout from "../components/AppLayout";
import IssueListSkeleton from "../components/skeletons/IssueListSkeleton";
import ConfirmDialog from "../components/ConfirmDialog";
import { IconArrowLeft } from "../components/icons";
import { useToast } from "../context/ToastContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "Todo", label: "Todo" },
  { value: "In Progress", label: "In progress" },
  { value: "Done", label: "Done" },
];

function buildIssuesUrl(projectId, search, statusFilter) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (statusFilter) params.set("status", statusFilter);
  const q = params.toString();
  return q ? `/issues/projects/${projectId}?${q}` : `/issues/projects/${projectId}`;
}

function formatApiError(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || String(d)).join(", ");
  return err.message || "Request failed.";
}

function ProjectDetail() {
  const { id } = useParams();
  const [issues, setIssues] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [deletingIssue, setDeletingIssue] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setSearchInput("");
    setStatus("");
  }, [id]);

  const fetchIssues = useCallback(
    async (withSkeleton = true) => {
      if (withSkeleton) setLoading(true);
      try {
        const res = await API.get(buildIssuesUrl(id, debouncedSearch, status));
        setIssues(res.data);
      } catch (err) {
        toast.error("Could not load issues.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast stable
    [id, debouncedSearch, status]
  );

  useEffect(() => {
    fetchIssues(true);
  }, [fetchIssues]);

  const confirmDeleteIssue = async () => {
    if (!issueToDelete) return;
    setDeletingIssue(true);
    try {
      await API.delete(`/issues/${issueToDelete.id}`);
      toast.success("Issue deleted.");
      setIssueToDelete(null);
      fetchIssues(false);
    } catch (err) {
      toast.error(formatApiError(err));
      console.error(err);
    } finally {
      setDeletingIssue(false);
    }
  };

  return (
    <AppLayout
      title="Issue list"
      subtitle={`Project #${id} · filter and triage before the board`}
      navLeft={
        <Link
          to="/dashboard"
          className="btn btn-ghost btn-compact shrink-0 gap-1.5 no-underline"
        >
          <IconArrowLeft />
          Projects
        </Link>
      }
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/project/${id}/board`}
            className="btn btn-primary no-underline text-sm"
          >
            Open Kanban board
          </Link>
        </div>

        <CreateIssue projectId={id} onIssueCreated={() => fetchIssues(false)} />

        <section className="card-surface p-6 sm:p-7" aria-label="Filters and issues">
          <h2 className="text-lg font-semibold text-[var(--text-h)]">Browse issues</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <label className="label" htmlFor="issue-search">
                Search
              </label>
              <input
                id="issue-search"
                className="input-field"
                placeholder="Filter by title…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-[var(--text)] opacity-65">
                Filters apply shortly after you stop typing.
              </p>
            </div>
            <div className="w-full sm:w-48">
              <label className="label" htmlFor="issue-status">
                Status
              </label>
              <select
                id="issue-status"
                className="input-field cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-6">
              <IssueListSkeleton />
            </div>
          ) : issues.length === 0 ? (
            <p className="mt-8 text-center text-[var(--text)] opacity-80">
              No issues match these filters.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {issues.map((issue) => (
                <li
                  key={issue.id}
                  className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--code-bg)_40%,var(--bg))] p-4 text-left transition hover:border-[var(--accent-border)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 text-base font-semibold text-[var(--text-h)]">{issue.title}</h3>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-[var(--accent-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                        {issue.status}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-compact !px-2 !py-1 text-xs text-red-600 dark:text-red-400"
                        onClick={() => setIssueToDelete(issue)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {issue.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text)] opacity-90">
                      {issue.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={!!issueToDelete}
        title="Delete issue?"
        message={
          issueToDelete
            ? `Remove “${issueToDelete.title}” from this project?`
            : ""
        }
        confirmLabel={deletingIssue ? "Deleting…" : "Delete"}
        danger
        busy={deletingIssue}
        onConfirm={confirmDeleteIssue}
        onCancel={() => setIssueToDelete(null)}
      />
    </AppLayout>
  );
}

export default ProjectDetail;
