import { useEffect, useState } from "react";
import API from "../api/api";
import AppLayout from "../components/AppLayout";
import AnalyticsSkeleton from "../components/skeletons/AnalyticsSkeleton";
import { IconChart, IconLayoutGrid } from "../components/icons";
import { useToast } from "../context/ToastContext";

const STATUS_ORDER = ["Todo", "In Progress", "Done"];

const STATUS_COLORS = {
  Todo: "from-violet-500 to-purple-600",
  "In Progress": "from-amber-500 to-orange-600",
  Done: "from-emerald-500 to-teal-600",
};

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get("/analytics/summary");
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) {
          toast.error("Could not load analytics.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast stable
  }, []);

  const issuesByStatus = data?.issues_by_status ?? {};
  const totalIssues = data?.issue_count ?? 0;

  const orderedEntries = [
    ...STATUS_ORDER.filter((k) => k in issuesByStatus).map((k) => [k, issuesByStatus[k]]),
    ...Object.entries(issuesByStatus).filter(([k]) => !STATUS_ORDER.includes(k)),
  ];

  return (
    <AppLayout title="Analytics" subtitle="Workspace overview at a glance">
      {loading ? (
        <AnalyticsSkeleton />
      ) : data ? (
        <div className="flex flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card-surface relative overflow-hidden p-6">
              <div className="absolute right-4 top-4 opacity-[0.12]">
                <IconLayoutGrid className="h-10 w-10 text-[var(--accent)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text)] opacity-80">Projects</p>
              <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--text-h)]">
                {data.project_count}
              </p>
              <p className="mt-1 text-xs text-[var(--text)] opacity-70">Total owned</p>
            </div>
            <div className="card-surface relative overflow-hidden p-6">
              <div className="absolute right-4 top-4 opacity-[0.12]">
                <IconChart className="h-10 w-10 text-[var(--accent)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text)] opacity-80">Issues</p>
              <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--text-h)]">
                {data.issue_count}
              </p>
              <p className="mt-1 text-xs text-[var(--text)] opacity-70">Across all projects</p>
            </div>
            <div className="card-surface relative overflow-hidden p-6">
              <div className="absolute right-4 top-4 rounded-full bg-[var(--accent-bg)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] opacity-90">
                Avg
              </div>
              <p className="text-sm font-medium text-[var(--text)] opacity-80">Avg per project</p>
              <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--text-h)]">
                {data.project_count > 0
                  ? (data.issue_count / data.project_count).toFixed(1)
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-[var(--text)] opacity-70">Issues / project</p>
            </div>
          </div>

          <section className="card-surface p-6 sm:p-8" aria-labelledby="status-breakdown">
            <h2 id="status-breakdown" className="text-lg font-semibold text-[var(--text-h)]">
              Issues by status
            </h2>
            <p className="mt-1 text-sm text-[var(--text)] opacity-85">
              Distribution of work across your Kanban columns.
            </p>

            {totalIssues === 0 ? (
              <p className="mt-8 text-center text-[var(--text)] opacity-80">
                No issues yet — create a project and add issues to see this chart fill in.
              </p>
            ) : (
              <ul className="mt-8 space-y-5">
                {orderedEntries.map(([status, count]) => {
                  const pct = Math.round((count / totalIssues) * 100);
                  const gradient = STATUS_COLORS[status] ?? "from-slate-500 to-slate-600";
                  return (
                    <li key={status}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium text-[var(--text-h)]">{status}</span>
                        <span className="tabular-nums text-[var(--text)] opacity-90">
                          {count}{" "}
                          <span className="text-xs opacity-70">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border)_70%,var(--bg))]">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <p className="text-[var(--text)]">No analytics available.</p>
      )}
    </AppLayout>
  );
}

export default Analytics;
