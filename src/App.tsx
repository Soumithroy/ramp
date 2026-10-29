import { useEffect, useMemo, useState } from "react"
import { api } from "./api/mockApi"
import { CategoryBreakdown } from "./components/CategoryBreakdown"
import { SummaryCards } from "./components/SummaryCards"
import { TransactionsTable } from "./components/TransactionsTable"
import { useTransactions } from "./hooks/useTransactions"
import type { Employee } from "./types"
import { summarize, toCsv } from "./utils/spend"

export default function App() {
  const [employees, setEmployees] = useState<Employee[] | null>(null)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const tx = useTransactions(employeeId)
  const summary = useMemo(() => summarize(tx.scope), [tx.scope])

  useEffect(() => {
    api.getEmployees().then(setEmployees)
  }, [])

  const downloadCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(tx.scope)], { type: "text/csv" }))
    const a = Object.assign(document.createElement("a"), { href: url, download: "transactions.csv" })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Spend Dashboard</h1>
          <p className="muted">Review company card transactions and approve expenses.</p>
        </div>
        <div className="controls">
          <label className="select">
            <span>Employee</span>
            <select
              value={employeeId ?? ""}
              disabled={!employees}
              onChange={(e) => setEmployeeId(e.target.value || null)}
            >
              <option value="">{employees ? "All employees" : "Loading…"}</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} · {e.department}
                </option>
              ))}
            </select>
          </label>
          <button className="secondary" onClick={downloadCsv} disabled={tx.loading}>
            Export CSV
          </button>
        </div>
      </header>

      {tx.error && (
        <div role="alert" className="error">
          {tx.error}
        </div>
      )}

      <SummaryCards summary={summary} />

      <div className="grid">
        <section className="panel">
          <h2>Transactions</h2>
          {tx.loading ? (
            <p className="muted">Loading transactions…</p>
          ) : (
            <>
              <TransactionsTable transactions={tx.transactions} onToggle={tx.setApproval} />
              {tx.nextPage !== null && (
                <button className="primary load-more" onClick={tx.loadMore} disabled={tx.loadingMore}>
                  {tx.loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </>
          )}
        </section>
        <CategoryBreakdown data={summary.byCategory} />
      </div>
    </div>
  )
}
