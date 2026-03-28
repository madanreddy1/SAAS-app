import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AppLayout from "../components/AppLayout";
import KanbanSkeleton from "../components/skeletons/KanbanSkeleton";
import { IconArrowLeft } from "../components/icons";
import { useToast } from "../context/ToastContext";

const columns = ["Todo", "In Progress", "Done"];

function KanbanBoard() {
  const { id } = useParams();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/issues/projects/${id}`);
        if (!cancelled) setIssues(res.data);
      } catch (err) {
        if (!cancelled) {
          toast.error("Could not load board.");
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
  }, [id]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const issueId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const sameColumn = result.source.droppableId === result.destination.droppableId;
    if (sameColumn) return;

    try {
      await API.put(`/issues/${issueId}`, {
        status: newStatus,
      });
      toast.success("Issue moved.");
      const res = await API.get(`/issues/projects/${id}`);
      setIssues(res.data);
    } catch (err) {
      toast.error("Could not update status. Try again.");
      console.error(err);
      try {
        const res = await API.get(`/issues/projects/${id}`);
        setIssues(res.data);
      } catch {
        /* ignore */
      }
    }
  };

  const getIssuesByStatus = (status) => issues.filter((issue) => issue.status === status);

  return (
    <AppLayout
      title="Kanban board"
      subtitle={`Project #${id} · drag cards to update status`}
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
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to={`/project/${id}`}
          className="btn btn-ghost btn-compact no-underline"
        >
          Issue list & filters
        </Link>
      </div>

      {loading ? (
        <KanbanSkeleton />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-4 md:grid-cols-3">
            {columns.map((col) => (
              <Droppable droppableId={col} key={col}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`card-surface flex min-h-[min(70vh,36rem)] flex-col p-4 transition-colors ${
                      snapshot.isDraggingOver ? "border-[var(--accent-border)] bg-[var(--accent-bg)]" : ""
                    }`}
                  >
                    <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text)] opacity-85">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          col === "Todo"
                            ? "bg-violet-500"
                            : col === "In Progress"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        aria-hidden
                      />
                      {col}
                    </h2>
                    <p className="mb-4 text-xs text-[var(--text)] opacity-60">
                      {getIssuesByStatus(col).length} card
                      {getIssuesByStatus(col).length === 1 ? "" : "s"}
                    </p>

                    <div className="flex flex-1 flex-col gap-3">
                      {getIssuesByStatus(col).map((issue, index) => (
                        <Draggable key={issue.id} draggableId={issue.id.toString()} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--code-bg)_55%,var(--bg))] p-3 text-left shadow-sm transition ${
                                dragSnapshot.isDragging
                                  ? "scale-[1.02] border-[var(--accent-border)] shadow-lg ring-2 ring-[var(--accent-bg)]"
                                  : "hover:border-[var(--accent-border)]"
                              }`}
                            >
                              <h3 className="text-sm font-semibold text-[var(--text-h)]">{issue.title}</h3>
                              {issue.description ? (
                                <p className="mt-1.5 text-xs leading-relaxed text-[var(--text)] opacity-85 line-clamp-4">
                                  {issue.description}
                                </p>
                              ) : null}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </AppLayout>
  );
}

export default KanbanBoard;
