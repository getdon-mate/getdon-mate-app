import type { DuesRecord, GroupAccount, Transaction } from "./types"

export interface AccountPaymentSummary {
  dues: DuesRecord[]
  paid: number
  unpaid: number
  exempt: number
  payableMembers: number
  progress: number
  unpaidMembers: DuesRecord[]
}

export interface AccountTransactionTotals {
  income: number
  expense: number
  net: number
}

export type GroupedTransactions = Record<string, Transaction[]>

export interface MonthlyTrendPoint {
  month: string
  income: number
  expense: number
}

export interface CategoryBreakdownItem {
  category: string
  amount: number
  share: number
}

export interface CalendarEventItem {
  id: string
  date: string
  title: string
  tone: "dues" | "transaction" | "notice"
}

export function getAccountDuesForMonth(account: GroupAccount, month: string): DuesRecord[] {
  return account.duesRecords.filter((record) => record.month === month)
}

export function getPaymentSummary(account: GroupAccount, month: string): AccountPaymentSummary {
  const dues = getAccountDuesForMonth(account, month)
  const paid = dues.filter((record) => record.status === "paid").length
  const unpaid = dues.filter((record) => record.status === "unpaid").length
  const exempt = dues.filter((record) => record.status === "exempt").length
  const payableMembers = Math.max(account.members.length - exempt, 1)
  const progress = Math.round((paid / payableMembers) * 100)

  return {
    dues,
    paid,
    unpaid,
    exempt,
    payableMembers,
    progress,
    unpaidMembers: dues.filter((record) => record.status === "unpaid"),
  }
}

export function getRecentTransactions(account: GroupAccount, limit = 4): Transaction[] {
  return account.transactions.slice(0, limit)
}

export function getTransactionTotals(account: GroupAccount): AccountTransactionTotals {
  const totals = account.transactions.reduce(
    (acc, tx) => {
      if (tx.type === "income") {
        acc.income += tx.amount
      } else {
        acc.expense += tx.amount
      }

      return acc
    },
    { income: 0, expense: 0 }
  )

  return {
    ...totals,
    net: totals.income - totals.expense,
  }
}

export function groupTransactionsByDate(transactions: Transaction[]): GroupedTransactions {
  return transactions.reduce<GroupedTransactions>((acc, tx) => {
    if (!acc[tx.date]) {
      acc[tx.date] = []
    }
    acc[tx.date].push(tx)
    return acc
  }, {})
}

export function getMonthlyTransactionTrend(account: GroupAccount): MonthlyTrendPoint[] {
  const months = Array.from(new Set(account.transactions.map((tx) => tx.date.slice(0, 7)))).sort((a, b) => a.localeCompare(b))

  return months.map((month) =>
    account.transactions
      .filter((tx) => tx.date.startsWith(month))
      .reduce<MonthlyTrendPoint>(
        (acc, tx) => {
          if (tx.type === "income") {
            acc.income += tx.amount
          } else {
            acc.expense += tx.amount
          }
          return acc
        },
        { month, income: 0, expense: 0 }
      )
  )
}

export function getExpenseCategoryBreakdown(account: GroupAccount): CategoryBreakdownItem[] {
  const totals = account.transactions
    .filter((tx) => tx.type === "expense")
    .reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount
      return acc
    }, {})

  const totalAmount = Object.values(totals).reduce((sum, amount) => sum + amount, 0)

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      share: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function getCalendarEvents(account: GroupAccount): CalendarEventItem[] {
  const duesEvents = getAccountDuesForMonth(account, new Date().toISOString().slice(0, 7)).map((record) => ({
    id: `dues-${record.memberId}-${record.month}`,
    date: `${record.month}-${String(account.dueDay).padStart(2, "0")}`,
    title: `${account.groupName} ${record.month} 회비 ${record.status === "paid" ? "완료" : "확인"}`,
    tone: "dues" as const,
  }))

  const oneTimeEvents = account.oneTimeDues.map((item) => ({
    id: `one-time-${item.id}`,
    date: item.dueDate,
    title: `${item.title} 마감`,
    tone: "dues" as const,
  }))

  const transactionEvents = account.transactions.map((tx) => ({
    id: `tx-${tx.id}`,
    date: tx.date,
    title: `${tx.description} ${tx.type === "income" ? "입금" : "출금"}`,
    tone: "transaction" as const,
  }))

  const boardEvents = account.boardPosts.map((post) => ({
    id: `post-${post.id}`,
    date: post.createdAt.slice(0, 10),
    title: post.pinned ? `[공지] ${post.title}` : post.title,
    tone: "notice" as const,
  }))

  return [...duesEvents, ...oneTimeEvents, ...transactionEvents, ...boardEvents].sort((a, b) => a.date.localeCompare(b.date))
}
