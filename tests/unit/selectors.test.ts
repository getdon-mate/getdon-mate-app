import { defaultAccounts } from '@features/accounts/model/fixtures'
import {
  getPaymentSummary,
  getRecentTransactions,
  getTransactionTotals,
  groupTransactionsByDate,
} from '@features/accounts/model/selectors'

describe('account selectors', () => {
  const account = defaultAccounts[0]

  test('getPaymentSummary returns paid/unpaid/exempt with progress', () => {
    const summary = getPaymentSummary(account, '2026-03')

    expect(summary.paid).toBe(2)
    expect(summary.unpaid).toBe(2)
    expect(summary.exempt).toBe(0)
    expect(summary.payableMembers).toBe(4)
    expect(summary.progress).toBe(50)
    expect(summary.unpaidMembers.map((record) => record.memberId)).toEqual(['m3', 'm4'])
  })

  test('getTransactionTotals calculates income/expense/net', () => {
    const totals = getTransactionTotals(account)

    expect(totals.income).toBe(100000)
    expect(totals.expense).toBe(47500)
    expect(totals.net).toBe(52500)
  })

  test('getRecentTransactions respects limit', () => {
    expect(getRecentTransactions(account, 2)).toHaveLength(2)
  })

  test('groupTransactionsByDate groups by YYYY-MM-DD key', () => {
    const grouped = groupTransactionsByDate(account.transactions)

    expect(Object.keys(grouped)).toContain('2026-03-03')
    expect(grouped['2026-03-03']).toHaveLength(2)
  })
})
