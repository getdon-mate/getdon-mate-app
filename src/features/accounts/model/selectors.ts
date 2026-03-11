import type { DuesRecord, GroupAccount, Transaction } from "./types"

export function getAccountDuesForMonth(account: GroupAccount, month: string): DuesRecord[] {
  return account.duesRecords.filter((record) => record.month === month)
}

export function getPaymentSummary(account: GroupAccount, month: string) {
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

export function getTransactionTotals(account: GroupAccount) {
  return account.transactions.reduce(
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
}

export function groupTransactionsByDate(transactions: Transaction[]) {
  return transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    if (!acc[tx.date]) {
      acc[tx.date] = []
    }
    acc[tx.date].push(tx)
    return acc
  }, {})
}
