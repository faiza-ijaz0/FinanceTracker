interface PageHeaderProps {
  badge: string;
  title: string;
  description: string;
}

export default function PageHeader({
  badge,
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className="mb-10 text-center sm:text-left">
      <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">
        {badge}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </header>
  );
}
