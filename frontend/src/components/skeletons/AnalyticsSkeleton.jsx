function Bar({ className }) {
  return <div className={`skeleton ${className}`} />;
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-surface p-6">
            <Bar className="mb-3 h-4 w-24" />
            <Bar className="h-10 w-16" />
          </div>
        ))}
      </div>
      <div className="card-surface p-6">
        <Bar className="mb-6 h-5 w-40" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Bar className="mb-2 h-3 w-28" />
              <Bar className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsSkeleton;
