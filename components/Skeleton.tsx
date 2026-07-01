export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="mb-2 h-8 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="mb-1 h-7 w-52" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable rows={4} />
    </div>
  );
}
