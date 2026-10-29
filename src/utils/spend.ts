import type { Category, Transaction } from "../types"

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

export function summarize(txs: Transaction[]) {
  const total = txs.reduce((s, t) => s + t.amount, 0)
  const pending = txs.filter((t) => !t.approved)
  const byCategory = new Map<Category, number>()
  for (const t of txs) byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount)

  return {
    total: Math.round(total * 100) / 100,
    count: txs.length,
    average: txs.length ? Math.round((total / txs.length) * 100) / 100 : 0,
    pendingCount: pending.length,
    pendingAmount: Math.round(pending.reduce((s, t) => s + t.amount, 0) * 100) / 100,
    byCategory: [...byCategory.entries()]
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount),
  }
}

const csvCell = (v: string | number | boolean) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(txs: Transaction[]): string {
  const header = ["id", "date", "employee", "merchant", "category", "amount", "approved"]
  const rows = txs.map((t) => [
    t.id,
    t.date,
    `${t.employee.firstName} ${t.employee.lastName}`,
    t.merchant,
    t.category,
    t.amount.toFixed(2),
    t.approved,
  ])
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n")
}
