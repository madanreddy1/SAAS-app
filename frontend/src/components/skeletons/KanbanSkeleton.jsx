function Bar({ className }) {
  return <div className={`skeleton ${className}`} />;
}

function KanbanSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3" aria-hidden>
      {[1, 2, 3].map((col) => (
        <div key={col} className="card-surface flex min-h-[min(70vh,36rem)] flex-col p-4">
          <Bar className="mb-2 h-4 w-24" />
          <Bar className="mb-4 h-3 w-16" />
          <div className="flex flex-1 flex-col gap-3">
            <Bar className="h-20 w-full rounded-xl" />
            <Bar className="h-20 w-full rounded-xl" />
            <Bar className="h-16 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default KanbanSkeleton;
