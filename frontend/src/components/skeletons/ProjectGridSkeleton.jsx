function Bar({ className }) {
  return <div className={`skeleton ${className}`} />;
}

function ProjectGridSkeleton({ count = 4 }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="card-surface p-5">
          <div className="mb-3 flex justify-between gap-3">
            <Bar className="h-6 w-[55%]" />
            <Bar className="h-5 w-14 rounded-full" />
          </div>
          <Bar className="h-4 w-full" />
          <Bar className="mt-2 h-4 w-[88%]" />
          <Bar className="mt-6 h-3 w-24" />
        </li>
      ))}
    </ul>
  );
}

export default ProjectGridSkeleton;
