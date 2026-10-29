export type Employee = { id: string; firstName: string; lastName: string; department: string }

export type Category = "Software" | "Travel" | "Meals" | "Office" | "Marketing" | "Hardware"

export type Transaction = {
  id: string
  amount: number
  merchant: string
  category: Category
  date: string // ISO yyyy-mm-dd
  approved: boolean
  employee: Employee
}

export type Page<T> = { data: T[]; nextPage: number | null }
