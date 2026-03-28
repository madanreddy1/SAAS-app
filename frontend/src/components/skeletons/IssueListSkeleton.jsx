function Bar({ className }) {
  return <div className={`skeleton ${className}`} />;
}

function IssueListSkeleton({ rows = 4 }) {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="rounded-xl border border-[var(--border)] p-4">
          <div className="mb-2 flex justify-between gap-2">
            <Bar className="h-5 w-[40%]" />
            <Bar className="h-5 w-16 rounded-full" />
          </div>
          <Bar className="h-4 w-full" />
          <Bar className="mt-2 h-4 w-[70%]" />
        </li>
      ))}
    </ul>
  );
}

export default IssueListSkeleton;
