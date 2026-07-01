"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  BookOpen,
  PiggyBank,
  RefreshCw,
  BarChart2,
  CalendarDays,
  LineChart,
  Tag,
  UserCircle,
  UploadCloud,
  Sun,
  Moon,
  LogOut,
  Heart,
  Lightbulb,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";

const NAV_GROUPS: {
  label: string;
  items: { href: string; label: string; icon: LucideIcon }[];
}[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Money",
    items: [
      { href: "/transactions", label: "Transactions", icon: ArrowDownUp },
      { href: "/income", label: "Income", icon: TrendingUp },
      { href: "/expenses", label: "Expenses", icon: TrendingDown },
    ],
  },
  {
    label: "Planning",
    items: [
      { href: "/budget", label: "Budget", icon: BookOpen },
      { href: "/savings", label: "Savings Goals", icon: PiggyBank },
      { href: "/recurring", label: "Recurring", icon: RefreshCw },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/charts", label: "Charts", icon: BarChart2 },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/statistics", label: "Statistics", icon: LineChart },
      { href: "/health", label: "Health Score", icon: Heart },
      { href: "/insights", label: "Insights", icon: Lightbulb },
    ],
  },
  {
    label: "Rewards",
    items: [{ href: "/achievements", label: "Achievements", icon: Trophy }],
  },
  {
    label: "Settings",
    items: [
      { href: "/categories", label: "Categories", icon: Tag },
      { href: "/profile", label: "Profile", icon: UserCircle },
      { href: "/export", label: "Export & Import", icon: UploadCloud },
    ],
  },
];

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5 dark:border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
          <span className="text-xs font-bold text-white">FT</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            Finance Tracker
          </p>
          <p className="text-xs text-slate-400">Personal Finance</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-5" : ""}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100 p-3 space-y-1 dark:border-white/10">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition"
        >
          {theme === "dark" ? (
            <Sun size={18} className="shrink-0" />
          ) : (
            <Moon size={18} className="shrink-0" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        {/* User card */}
        {user && (
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white shadow">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 dark:border-white/10 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 shadow-2xl dark:border-white/10 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
