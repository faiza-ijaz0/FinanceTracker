import Navbar from "@/components/Navbar";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-200/50 via-slate-50 to-slate-50 dark:from-violet-900/40 dark:via-slate-950 dark:to-slate-950" />
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/20" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-600/15" />

      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
