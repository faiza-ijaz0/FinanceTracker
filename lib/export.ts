import type { Transaction } from "./types";

// ── CSV ──────────────────────────────────────────────────────────────────────

function escapeCSV(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function transactionToRow(t: Transaction): string {
  return [
    t.date,
    t.type,
    t.amount,
    t.description,
    t.category,
    t.status ?? "completed",
    (t.tags ?? []).join("|"),
    t.notes ?? "",
  ]
    .map(escapeCSV)
    .join(",");
}

const CSV_HEADER =
  "Date,Type,Amount,Description,Category,Status,Tags,Notes";

export function exportToCSV(transactions: Transaction[], filename = "transactions"): void {
  const rows = [CSV_HEADER, ...transactions.map(transactionToRow)];
  downloadText(rows.join("\n"), `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function parseCSV(text: string): Omit<Transaction, "id">[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Skip header row
  const dataLines = lines[0].toLowerCase().startsWith("date") ? lines.slice(1) : lines;

  return dataLines.flatMap((line) => {
    const cols = splitCSVLine(line);
    if (cols.length < 4) return [];
    const [date, type, amount, description, category, status, tags, notes] = cols;
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return [];
    const txType = type?.toLowerCase() === "income" ? "income" : "expense";
    return [
      {
        type: txType,
        amount: parsedAmount,
        description: description?.trim() || "Imported",
        category: category?.trim() || (txType === "income" ? "Other" : "Other"),
        date: date?.trim() || new Date().toISOString().slice(0, 10),
        status:
          status === "pending" || status === "cancelled" ? status : "completed",
        tags: tags ? tags.split("|").filter(Boolean) : undefined,
        notes: notes?.trim() || undefined,
      } satisfies Omit<Transaction, "id">,
    ];
  });
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// ── Excel (SpreadsheetML — no npm package needed) ────────────────────────────

export function exportToExcel(transactions: Transaction[], filename = "transactions"): void {
  const headers = ["Date", "Type", "Amount", "Description", "Category", "Status", "Tags", "Notes"];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    t.amount,
    t.description,
    t.category,
    t.status ?? "completed",
    (t.tags ?? []).join(", "),
    t.notes ?? "",
  ]);

  const xmlCell = (v: unknown, type = "String") =>
    `<Cell><Data ss:Type="${type}">${String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>`;

  const xmlRows = [
    `<Row>${headers.map((h) => xmlCell(h)).join("")}</Row>`,
    ...rows.map(
      (r) =>
        `<Row>${r.map((v, i) => (i === 2 ? xmlCell(v, "Number") : xmlCell(v))).join("")}</Row>`
    ),
  ].join("\n");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Transactions">
<Table>${xmlRows}</Table>
</Worksheet>
</Workbook>`;

  downloadText(xml, `${filename}.xls`, "application/vnd.ms-excel");
}

// ── PDF (print window) ────────────────────────────────────────────────────────

export function exportToPDF(transactions: Transaction[]): void {
  const rows = transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (t) => `
    <tr>
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>${t.category}</td>
      <td style="color:${t.type === "income" ? "#16a34a" : "#dc2626"}">${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)}</td>
      <td>${t.status ?? "completed"}</td>
      <td>${(t.tags ?? []).join(", ")}</td>
    </tr>`
    )
    .join("");

  const total = transactions.reduce(
    (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
    0
  );

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Finance Tracker — Transaction Report</title>
<style>
  body { font-family: system-ui, sans-serif; font-size: 12px; color: #1e293b; padding: 24px; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  p.sub { color: #64748b; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; }
  td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
  tr:last-child td { border-bottom: none; }
  .total { margin-top: 16px; text-align: right; font-weight: 600; font-size: 14px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>Transaction Report</h1>
<p class="sub">Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} — ${transactions.length} transactions</p>
<table>
<thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Status</th><th>Tags</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p class="total">Net Balance: <span style="color:${total >= 0 ? "#16a34a" : "#dc2626"}">${total >= 0 ? "+" : ""}$${total.toFixed(2)}</span></p>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

// ── JSON Backup ───────────────────────────────────────────────────────────────

export function exportBackup(data: object, filename = "finance-backup"): void {
  downloadText(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
}

export function parseBackup(text: string): Transaction[] {
  try {
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [];
    return arr.filter((t: unknown) => {
      if (typeof t !== "object" || !t) return false;
      const tx = t as Record<string, unknown>;
      return (
        typeof tx.id === "string" &&
        typeof tx.amount === "number" &&
        typeof tx.description === "string" &&
        typeof tx.date === "string" &&
        (tx.type === "income" || tx.type === "expense")
      );
    }) as Transaction[];
  } catch {
    return [];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function downloadText(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
