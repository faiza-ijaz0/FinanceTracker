"use client";

import { useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useTransactions } from "@/components/TransactionsProvider";
import { toast } from "sonner";
import {
  exportBackup,
  exportToCSV,
  exportToExcel,
  exportToPDF,
  parseBackup,
  parseCSV,
} from "@/lib/export";

function ExportCard({
  icon,
  title,
  description,
  badge,
  badgeColor,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-500/40"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-violet-100 group-hover:text-violet-600 dark:bg-white/5 dark:text-slate-400 dark:group-hover:bg-violet-500/20 dark:group-hover:text-violet-400">
          {icon}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
    </button>
  );
}

export default function ExportPage() {
  const { transactions, addTransaction } = useTransactions();
  
  const csvInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const ts = new Date().toISOString().slice(0, 10);

  function handleExportCSV() {
    if (transactions.length === 0) {
     toast.warning("No transactions", {
  description: "Add some transactions first.",
});
      return;
    }
    exportToCSV(transactions, `transactions-${ts}`);
    toast.success("CSV exported", {
  description: `${transactions.length} transactions downloaded.`,
});
  }

  function handleExportExcel() {
    if (transactions.length === 0) {
     toast.warning("No transactions", {
  description: "Add some transactions first.",
});
      return;
    }
    exportToExcel(transactions, `transactions-${ts}`);
    toast.success("Excel exported", {
  description: `${transactions.length} transactions downloaded.`,
});
  }

  function handleExportPDF() {
    if (transactions.length === 0) {
      toast.warning("No transactions", {
  description: "Add some transactions first.",
});
      return;
    }
    exportToPDF(transactions);
   toast.info("PDF ready", {
  description: "Use your browser's print dialog to save as PDF.",
});
  }

  function handleExportBackup() {
    if (transactions.length === 0) {
     toast.warning("No data", {
  description: "Nothing to back up yet.",
});
      return;
    }
    exportBackup({ transactions, exportedAt: new Date().toISOString() }, `finance-backup-${ts}`);
   toast.success("Backup created", {
  description: "JSON backup downloaded.",
});
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
       toast.error("Import failed", {
  description: "No valid transactions found in the CSV file.",
});
        return;
      }
      rows.forEach((t) => addTransaction(t));
      toast.success(`${rows.length} transactions imported`, {
  description: "Check your transaction list.",
});
    } catch {
      toast.error("Import failed", {
  description: "Could not read the file.",
});
    } finally {
      setImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  }

  async function handleRestoreBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const txns = parseBackup(text);
      if (txns.length === 0) {
       toast.error("Restore failed", {
  description: "No valid transactions found in the backup.",
});
        return;
      }
      // Strip existing ids so TransactionsProvider generates fresh ones
      txns.forEach(({ id: _id, ...rest }) => addTransaction(rest));
     toast.success(`${txns.length} transactions restored`, {
  description: "Your backup has been applied.",
});
    } catch {
      toast.error("Restore failed", {
  description: "Could not parse the backup file.",
});
    } finally {
      setImporting(false);
      if (backupInputRef.current) backupInputRef.current.value = "";
    }
  }

  const SVG_CSV = (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
  const SVG_XLS = (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  const SVG_PDF = (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
  const SVG_JSON = (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  );
  const SVG_UPLOAD = (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Data"
        title="Export & Import"
        description="Download your data or import transactions from a file."
      />

      {/* Stats bar */}
      <div className="mb-8 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 dark:border-violet-500/20 dark:from-violet-500/10 dark:to-indigo-500/10">
        <p className="text-sm text-violet-700 dark:text-violet-300">
          You have{" "}
          <span className="font-bold">{transactions.length}</span>{" "}
          transactions available to export.
        </p>
      </div>

      {/* Export section */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          Export Data
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ExportCard
            icon={SVG_CSV}
            title="Export CSV"
            description="Spreadsheet-compatible comma-separated file."
            badge="CSV"
            badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
            onClick={handleExportCSV}
          />
          <ExportCard
            icon={SVG_XLS}
            title="Export Excel"
            description="Open directly in Microsoft Excel or Google Sheets."
            badge="XLS"
            badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
            onClick={handleExportExcel}
          />
          <ExportCard
            icon={SVG_PDF}
            title="Export PDF"
            description="Print-ready report with all your transactions."
            badge="PDF"
            badgeColor="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
            onClick={handleExportPDF}
          />
          <ExportCard
            icon={SVG_JSON}
            title="Backup"
            description="Full JSON backup for safe keeping or transfer."
            badge="JSON"
            badgeColor="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            onClick={handleExportBackup}
          />
        </div>
      </section>

      {/* Import section */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          Import Data
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* CSV import */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                {SVG_UPLOAD}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Import CSV
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Add transactions from a CSV file. New entries are merged.
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center dark:border-white/10">
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportCSV}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer"
              >
                <svg className="mx-auto mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  {importing ? "Importing…" : "Choose CSV file"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Format: Date, Type, Amount, Description, Category, Status, Tags, Notes
                </p>
              </label>
            </div>
          </div>

          {/* Backup restore */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                {SVG_JSON}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Restore Backup
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Restore from a JSON backup file. Duplicates may be added.
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center dark:border-white/10">
              <input
                ref={backupInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreBackup}
                className="hidden"
                id="backup-upload"
              />
              <label htmlFor="backup-upload" className="cursor-pointer">
                <svg className="mx-auto mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  {importing ? "Restoring…" : "Choose backup file"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  .json files exported from Finance Tracker
                </p>
              </label>
            </div>
          </div>
        </div>

        
      </section>
    </div>
  );
}
