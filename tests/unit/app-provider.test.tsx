import { act, render, waitFor } from '@testing-library/react-native'
import { AppProvider, useApp } from '@core/providers/AppProvider'

const mockAdapter = {
  loadBootstrap: jest.fn(async () => null),
  login: jest.fn(async () => null),
  signup: jest.fn(async () => null),
  createAccount: jest.fn(async () => null),
  deleteAccount: jest.fn(async () => undefined),
  toggleDues: jest.fn(async () => undefined),
  updateAutoTransfer: jest.fn(async () => undefined),
  updateAccount: jest.fn(async () => undefined),
  createOneTimeDues: jest.fn(async () => undefined),
  toggleOneTimeDuesRecord: jest.fn(async () => undefined),
  createMember: jest.fn(async () => null),
  updateMember: jest.fn(async () => undefined),
  deleteMember: jest.fn(async () => undefined),
  createTransaction: jest.fn(async () => null),
  updateTransaction: jest.fn(async () => undefined),
  deleteTransaction: jest.fn(async () => undefined),
  deleteUser: jest.fn(async () => undefined),
}

jest.mock('@features/accounts/api', () => ({
  createAccountsBackendV1Adapter: () => mockAdapter,
}))

type AppCtx = ReturnType<typeof useApp>
let latestCtx: AppCtx | null = null

function Harness() {
  latestCtx = useApp()
  return null
}

function getCtx(): AppCtx {
  if (!latestCtx) {
    throw new Error('App context is not initialized')
  }
  return latestCtx
}

describe('AppProvider state transitions', () => {
  beforeEach(() => {
    latestCtx = null
    globalThis.localStorage.clear()
    Object.values(mockAdapter).forEach((fn) => {
      if (typeof fn === 'function' && 'mockClear' in fn) {
        ;(fn as jest.Mock).mockClear()
      }
    })
  })

  test('login fallback works with local fixture user', async () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )

    await waitFor(() => expect(getCtx().isBootstrapping).toBe(false))

    await act(async () => {
      const ok = await getCtx().login('test@test.com', 'password')
      expect(ok).toBe(true)
    })

    expect(getCtx().currentUser?.email).toBe('test@test.com')
    expect(getCtx().dataSource).toBe('demo')
  })

  test('selected account is cleared when account is deleted', async () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )

    await waitFor(() => expect(getCtx().isBootstrapping).toBe(false))

    await act(async () => {
      await getCtx().login('test@test.com', 'password')
    })

    act(() => {
      getCtx().selectAccount('acc1')
    })
    expect(getCtx().selectedAccountId).toBe('acc1')

    await act(async () => {
      await getCtx().deleteAccount('acc1')
    })

    await waitFor(() => expect(getCtx().selectedAccountId).toBeNull())
  })

  test('toggleDues flips paid/unpaid for selected account and month', async () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )

    await waitFor(() => expect(getCtx().isBootstrapping).toBe(false))

    await act(async () => {
      await getCtx().login('test@test.com', 'password')
    })

    act(() => {
      getCtx().selectAccount('acc1')
    })

    const statusFor = () =>
      getCtx().accounts
        .find((account) => account.id === 'acc1')
        ?.duesRecords.find((record) => record.memberId === 'm1' && record.month === '2026-03')?.status

    expect(statusFor()).toBe('paid')

    await act(async () => {
      await getCtx().toggleDues('m1', '2026-03')
    })
    expect(statusFor()).toBe('unpaid')

    await act(async () => {
      await getCtx().toggleDues('m1', '2026-03')
    })
    expect(statusFor()).toBe('paid')
  })

  test('notification list state persists read/clear/restore actions in app state', async () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )

    await waitFor(() => expect(getCtx().isBootstrapping).toBe(false))

    expect(getCtx().notifications).toHaveLength(3)
    expect(getCtx().unreadNotificationCount).toBe(2)

    await act(async () => {
      await getCtx().markNotificationRead('notice-1')
    })

    expect(getCtx().unreadNotificationCount).toBe(1)

    await act(async () => {
      await getCtx().clearNotifications()
    })

    expect(getCtx().notifications).toHaveLength(0)

    await act(async () => {
      await getCtx().restoreNotifications()
    })

    expect(getCtx().notifications).toHaveLength(3)
    expect(getCtx().unreadNotificationCount).toBe(2)
  })

  test('notification preferences reset uses shared default source', async () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )

    await waitFor(() => expect(getCtx().isBootstrapping).toBe(false))

    await act(async () => {
      await getCtx().updateNotificationPreferences({
        duesReminder: false,
        transactionAlert: false,
        noticeAlert: false,
      })
    })

    expect(getCtx().notificationPreferences).toEqual({
      duesReminder: false,
      transactionAlert: false,
      noticeAlert: false,
    })

    act(() => {
      getCtx().resetNotificationPreferences()
    })

    expect(getCtx().notificationPreferences).toEqual(getCtx().defaultNotificationPreferences)
  })

  test('delegateManager keeps a single manager and deleteMember promotes a fallback manager', async () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )

    await waitFor(() => expect(getCtx().isBootstrapping).toBe(false))

    await act(async () => {
      await getCtx().login('test@test.com', 'password')
    })

    const accountManagers = () =>
      getCtx().accounts
        .find((account) => account.id === 'acc1')
        ?.members.filter((member) => member.role === '총무')
        .map((member) => member.id) ?? []

    expect(accountManagers()).toEqual(['m1'])

    await act(async () => {
      await getCtx().delegateManager('acc1', 'm2')
    })

    expect(accountManagers()).toEqual(['m2'])

    await act(async () => {
      await getCtx().deleteMember('acc1', 'm2')
    })

    expect(accountManagers()).toHaveLength(1)
    expect(accountManagers()[0]).not.toBe('m2')
  })

  test('amount privacy preference toggles and persists across provider mounts', async () => {
    const { unmount } = render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )

    await waitFor(() => expect(getCtx().isBootstrapping).toBe(false))

    expect(getCtx().maskAmounts).toBe(false)

    act(() => {
      getCtx().toggleMaskAmounts()
    })

    expect(getCtx().maskAmounts).toBe(true)

    unmount()
    latestCtx = null

    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )

    await waitFor(() => expect(getCtx().isBootstrapping).toBe(false))
    expect(getCtx().maskAmounts).toBe(true)
  })
})
