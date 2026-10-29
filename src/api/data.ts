import type { Category, Employee, Transaction } from "../types"

/** Deterministic PRNG so the demo data (and tests) are stable across reloads. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const employees: Employee[] = [
  { id: "e1", firstName: "Ava", lastName: "Patel", department: "Engineering" },
  { id: "e2", firstName: "Liam", lastName: "Chen", department: "Sales" },
  { id: "e3", firstName: "Maya", lastName: "Rodriguez", department: "Marketing" },
  { id: "e4", firstName: "Noah", lastName: "Kim", department: "Engineering" },
  { id: "e5", firstName: "Zara", lastName: "Okafor", department: "Operations" },
  { id: "e6", firstName: "Ethan", lastName: "Brooks", department: "Sales" },
]

const merchants: Record<Category, string[]> = {
  Software: ["GitHub", "Figma", "Notion", "AWS", "Slack"],
  Travel: ["Delta Air Lines", "Uber", "Marriott", "Amtrak"],
  Meals: ["Sweetgreen", "Blue Bottle Coffee", "DoorDash", "Chipotle"],
  Office: ["Staples", "WeWork", "Amazon Business"],
  Marketing: ["LinkedIn Ads", "Google Ads", "Canva"],
  Hardware: ["Apple Store", "Best Buy", "Dell"],
}

const ranges: Record<Category, [number, number]> = {
  Software: [12, 900],
  Travel: [18, 1400],
  Meals: [8, 160],
  Office: [15, 600],
  Marketing: [50, 2500],
  Hardware: [80, 3200],
}

export function generateTransactions(count = 64, seed = 42): Transaction[] {
  const rand = mulberry32(seed)
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)]
  const categories = Object.keys(merchants) as Category[]
  const start = Date.UTC(2026, 6, 1)

  return Array.from({ length: count }, (_, i) => {
    const category = pick(categories)
    const [lo, hi] = ranges[category]
    const day = Math.floor(rand() * 120)
    return {
      id: `t${String(i + 1).padStart(3, "0")}`,
      amount: Math.round((lo + rand() * (hi - lo)) * 100) / 100,
      merchant: pick(merchants[category]),
      category,
      date: new Date(start + day * 86_400_000).toISOString().slice(0, 10),
      approved: rand() > 0.45,
      employee: pick(employees),
    }
  }).sort((a, b) => b.date.localeCompare(a.date))
}
