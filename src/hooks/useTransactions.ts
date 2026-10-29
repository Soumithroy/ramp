import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "../api/mockApi"
import type { Transaction } from "../types"

type State = {
  transactions: Transaction[]
  scope: Transaction[] // everything in the current filter, used for the summary
  nextPage: number | null
  loading: boolean
  loadingMore: boolean
  error: string | null
}

/**
 * Loads transactions for "all employees" (paginated) or one employee (single request).
 * - Ignores stale responses when the filter changes mid-request (race-condition safe).
 * - Approval toggles are optimistic and roll back if the API call fails.
 */
export function useTransactions(employeeId: string | null) {
  const [state, setState] = useState<State>({
    transactions: [],
    scope: [],
    nextPage: null,
    loading: true,
    loadingMore: false,
    error: null,
  })
  const requestId = useRef(0)

  useEffect(() => {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))

    const load = employeeId
      ? api.getTransactionsByEmployee(employeeId).then((txs) => ({ page: txs, nextPage: null, scope: txs }))
      : Promise.all([api.getTransactionsPage(0), api.getAllTransactions()]).then(([page, all]) => ({
          page: page.data,
          nextPage: page.nextPage,
          scope: all,
        }))

    load
      .then(({ page, nextPage, scope }) => {
        if (id !== requestId.current) return // a newer filter won
        setState({ transactions: page, scope, nextPage, loading: false, loadingMore: false, error: null })
      })
      .catch((e: Error) => {
        if (id === requestId.current) setState((s) => ({ ...s, loading: false, error: e.message }))
      })
  }, [employeeId])

  const loadMore = useCallback(async () => {
    const page = state.nextPage
    if (page === null || state.loadingMore) return
    const id = requestId.current
    setState((s) => ({ ...s, loadingMore: true }))
    try {
      const res = await api.getTransactionsPage(page)
      if (id !== requestId.current) return
      setState((s) => ({
        ...s,
        transactions: [...s.transactions, ...res.data], // append, don't replace
        nextPage: res.nextPage,
        loadingMore: false,
      }))
    } catch (e) {
      setState((s) => ({ ...s, loadingMore: false, error: (e as Error).message }))
    }
  }, [state.nextPage, state.loadingMore])

  const setApproval = useCallback(async (txId: string, approved: boolean) => {
    const patch = (value: boolean) => (txs: Transaction[]) =>
      txs.map((t) => (t.id === txId ? { ...t, approved: value } : t))

    setState((s) => ({ ...s, transactions: patch(approved)(s.transactions), scope: patch(approved)(s.scope) }))
    try {
      await api.setApproval(txId, approved)
    } catch (e) {
      setState((s) => ({
        ...s,
        transactions: patch(!approved)(s.transactions),
        scope: patch(!approved)(s.scope),
        error: `Could not update ${txId}: ${(e as Error).message}`,
      }))
    }
  }, [])

  return { ...state, loadMore, setApproval }
}
