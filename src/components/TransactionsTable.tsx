import type { Transaction } from "../types"
import { formatCurrency } from "../utils/spend"

type Props = {
  transactions: Transaction[]
  onToggle: (id: string, approved: boolean) => void
}

export function TransactionsTable({ transactions, onToggle }: Props) {
  if (!transactions.length) return <p className="empty">No transactions found.</p>

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Merchant</th>
            <th>Employee</th>
            <th>Category</th>
            <th className="num">Amount</th>
            <th>Approved</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.merchant}</td>
              <td>
                {t.employee.firstName} {t.employee.lastName}
              </td>
              <td>
                <span className={`tag tag-${t.category.toLowerCase()}`}>{t.category}</span>
              </td>
              <td className="num">{formatCurrency(t.amount)}</td>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={t.approved}
                    onChange={(e) => onToggle(t.id, e.target.checked)}
                    aria-label={`Approve ${t.merchant} ${formatCurrency(t.amount)}`}
                  />
                  <span>{t.approved ? "Approved" : "Pending"}</span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
