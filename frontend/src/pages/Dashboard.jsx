import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import CreateProject from "../components/CreateProject";
import AppLayout from "../components/AppLayout";
import ProjectGridSkeleton from "../components/skeletons/ProjectGridSkeleton";
import ConfirmDialog from "../components/ConfirmDialog";
import EditProjectModal from "../components/EditProjectModal";
import { IconSparkles } from "../components/icons";
import { useToast } from "../context/ToastContext";

function formatApiError(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || String(d)).join(", ");
  return err.message || "Request failed.";
}

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const fetchProjects = async (withSkeleton = false) => {
    if (withSkeleton) setLoading(true);
    try {
      const res = await API.get("/projects/");
      setProjects(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const projectId = Number(deleteTarget.id);
    if (Number.isNaN(projectId)) {
      toast.error("Invalid project.");
      return;
    }
    setDeleting(true);
    try {
      await API.delete(`/projects/${projectId}`);
      setDeleteTarget(null);
      toast.success("Project deleted.");
      await fetchProjects(false);
    } catch (err) {
      toast.error(formatApiError(err));
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout title="Your Projects" subtitle="Plan, track, and ship.">
      <div className="flex flex-col gap-10">
        <CreateProject onProjectCreated={() => fetchProjects(false)} />

        {loading ? (
          <section aria-label="Loading projects">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="h-7 w-1 shrink-0 rounded-full bg-gradient-to-b from-[var(--accent)] to-violet-500"
                aria-hidden
              />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)] opacity-80">
                All projects
              </h2>
            </div>
            <ProjectGridSkeleton />
          </section>
        ) : projects.length === 0 ? (
          <div className="card-surface relative overflow-hidden px-6 py-16 text-center sm:py-20">
            <div
              className="pointer-events-none absolute -right-10 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.07] blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-10 top-8 h-36 w-36 rounded-full bg-violet-500 opacity-[0.08] blur-3xl"
              aria-hidden
            />
            <IconSparkles className="mx-auto h-11 w-11 text-[var(--accent)]" />
            <p className="mt-5 text-lg font-semibold tracking-tight text-[var(--text-h)]">No projects yet</p>
            <p className="mt-2 max-w-sm mx-auto text-[15px] leading-relaxed text-[var(--text)] opacity-90">
              Create your first project above to capture issues and move work across your Kanban board.
            </p>
          </div>
        ) : (
          <section aria-label="Project list">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="h-7 w-1 shrink-0 rounded-full bg-gradient-to-b from-[var(--accent)] to-violet-500"
                aria-hidden
              />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)] opacity-80">
                All projects
              </h2>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="card-surface card-surface-interactive flex h-full flex-col p-5 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-lg font-semibold leading-snug tracking-tight text-[var(--text-h)]">
                      {p.title}
                    </h3>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-compact !px-2 !py-1 text-xs"
                        onClick={() => setEditProject(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-compact !px-2 !py-1 text-xs text-red-600 dark:text-red-400"
                        onClick={() => setDeleteTarget(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {p.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text)] opacity-90">
                      {p.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-[var(--text)] opacity-50">No description</p>
                  )}
                  <div className="mt-5 flex gap-2">
                    <Link
                      to={`/project/${p.id}`}
                      className="btn btn-ghost btn-compact flex-1 justify-center text-sm no-underline"
                    >
                      Issues
                    </Link>
                    <Link
                      to={`/project/${p.id}/board`}
                      className="btn btn-primary flex-1 justify-center text-sm no-underline"
                    >
                      Board
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <EditProjectModal
        project={editProject}
        open={!!editProject}
        onClose={() => setEditProject(null)}
        onSaved={() => fetchProjects(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project?"
        message={
          deleteTarget
            ? `This will permanently delete “${deleteTarget.title}” and all of its issues. This cannot be undone.`
            : ""
        }
        confirmLabel={deleting ? "Deleting…" : "Delete project"}
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}

export default Dashboard;
