function Bar({ className }) {
  return <div className={`skeleton ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <div className="card-surface max-w-lg p-8" aria-hidden>
      <Bar className="mx-auto mb-6 h-20 w-20 rounded-full" />
      <Bar className="mx-auto mb-8 h-6 w-48" />
      <div className="space-y-4">
        <Bar className="h-4 w-20" />
        <Bar className="h-12 w-full rounded-xl" />
        <Bar className="h-4 w-16 pt-2" />
        <Bar className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default ProfileSkeleton;
