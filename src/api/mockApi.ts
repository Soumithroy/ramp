/**
 * In-memory mock of a REST API with realistic latency.
 * Swap these functions for real `fetch` calls without touching the UI.
 */
import type { Employee, Page, Transaction } from "../types"
import { employees, generateTransactions } from "./data"

export const PAGE_SIZE = 10

const latencyMultiplier = Number(import.meta.env?.VITE_API_LATENCY_MULTIPLIER ?? 1)

function delay<T>(value: T): Promise<T> {
  const ms = (300 + Math.random() * 400) * latencyMultiplier
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))
}

let db: Transaction[] = generateTransactions()

/** Test helper: reset the in-memory database. */
export function resetDb(transactions = generateTransactions()) {
  db = transactions
}

export const api = {
  getEmployees(): Promise<Employee[]> {
    return delay(employees)
  },

  getTransactionsPage(page: number): Promise<Page<Transaction>> {
    if (page < 0) return Promise.reject(new Error("page must be >= 0"))
    const start = page * PAGE_SIZE
    const data = db.slice(start, start + PAGE_SIZE)
    const nextPage = start + PAGE_SIZE < db.length ? page + 1 : null
    return delay({ data, nextPage })
  },

  getTransactionsByEmployee(employeeId: string): Promise<Transaction[]> {
    if (!employees.some((e) => e.id === employeeId)) {
      return Promise.reject(new Error(`Unknown employee ${employeeId}`))
    }
    return delay(db.filter((t) => t.employee.id === employeeId))
  },

  getAllTransactions(): Promise<Transaction[]> {
    return delay(db)
  },

  setApproval(transactionId: string, approved: boolean): Promise<Transaction> {
    const tx = db.find((t) => t.id === transactionId)
    if (!tx) return Promise.reject(new Error(`Unknown transaction ${transactionId}`))
    tx.approved = approved
    return delay(tx)
  },
}
