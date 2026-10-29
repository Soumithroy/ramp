import { describe, expect, it } from "vitest"
import type { Transaction } from "../types"
import { summarize, toCsv } from "./spend"

const emp = { id: "e1", firstName: "Ava", lastName: "Patel", department: "Eng" }
const tx = (id: string, amount: number, category: Transaction["category"], approved: boolean): Transaction => ({
  id, amount, category, approved, merchant: "Acme, Inc.", date: "2026-08-01", employee: emp,
})

describe("summarize", () => {
  it("computes totals, pending and category breakdown", () => {
    const s = summarize([tx("1", 100, "Travel", true), tx("2", 50.5, "Meals", false), tx("3", 20, "Travel", false)])
    expect(s.total).toBe(170.5)
    expect(s.pendingCount).toBe(2)
    expect(s.pendingAmount).toBe(70.5)
    expect(s.byCategory[0]).toEqual({ category: "Travel", amount: 120 })
  })

  it("handles empty input", () => {
    expect(summarize([]).average).toBe(0)
  })
})

describe("toCsv", () => {
  it("escapes commas and quotes", () => {
    const csv = toCsv([tx("1", 9.5, "Office", true)])
    expect(csv.split("\n")[1]).toBe('1,2026-08-01,Ava Patel,"Acme, Inc.",Office,9.50,true')
  })
})
