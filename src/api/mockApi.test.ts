import { beforeEach, describe, expect, it, vi } from "vitest"
import { api, PAGE_SIZE, resetDb } from "./mockApi"
import { generateTransactions } from "./data"

vi.useFakeTimers()
const run = async <T,>(p: Promise<T>) => {
  await vi.runAllTimersAsync()
  return p
}

describe("mock API", () => {
  beforeEach(() => resetDb(generateTransactions(25)))

  it("paginates without overlap and ends with nextPage=null", async () => {
    const p0 = await run(api.getTransactionsPage(0))
    const p1 = await run(api.getTransactionsPage(1))
    const p2 = await run(api.getTransactionsPage(2))
    expect(p0.data).toHaveLength(PAGE_SIZE)
    expect(p2.data).toHaveLength(5)
    expect(p2.nextPage).toBeNull()
    const ids = [...p0.data, ...p1.data, ...p2.data].map((t) => t.id)
    expect(new Set(ids).size).toBe(25)
  })

  it("filters by employee", async () => {
    const txs = await run(api.getTransactionsByEmployee("e1"))
    expect(txs.every((t) => t.employee.id === "e1")).toBe(true)
  })

  it("persists approval changes across requests", async () => {
    const [first] = (await run(api.getTransactionsPage(0))).data
    await run(api.setApproval(first.id, !first.approved))
    const again = (await run(api.getTransactionsPage(0))).data[0]
    expect(again.approved).toBe(!first.approved)
  })

  it("rejects unknown ids", async () => {
    await expect(api.setApproval("nope", true)).rejects.toThrow("Unknown transaction")
  })
})
