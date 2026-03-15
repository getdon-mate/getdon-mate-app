import { defaultAccounts } from '@features/accounts/model/fixtures'
import {
  getCalendarEvents,
  getCalendarEventsForDate,
  getHomeAccounts,
  getLatestReminderForMember,
  getPaymentSummary,
  getRecentTransactions,
  getStatisticsSummary,
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

  test('getLatestReminderForMember returns the most recent reminder for a member', () => {
    const reminder = getLatestReminderForMember(account, 'm3')

    expect(reminder?.type).toBe('payment-reminder')
    expect(reminder?.message).toContain('납부 안내')
  })

  test('getHomeAccounts sorts by unpaid pressure and recent activity', () => {
    const ordered = getHomeAccounts(defaultAccounts)

    expect(ordered.map((item) => item.id)).toEqual(['acc1', 'acc2'])
  })

  test('getStatisticsSummary returns current high-level operating metrics', () => {
    const summary = getStatisticsSummary(account)

    expect(summary.net).toBe(52500)
    expect(summary.unpaidCount).toBe(2)
    expect(summary.expense).toBe(47500)
  })

  test('getCalendarEventsForDate narrows events to the chosen day', () => {
    const events = getCalendarEvents(account)
    const focused = getCalendarEventsForDate(events, '2026-03-04')

    expect(focused.every((event) => event.date === '2026-03-04')).toBe(true)
    expect(focused.some((event) => event.title.includes('이번 주 스터디 장소 안내'))).toBe(true)
  })
})
