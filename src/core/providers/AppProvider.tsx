import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { apiConfig, mapApiFailureToUserMessage, shouldUseRealApi } from "@core/api"
import { createAccountsBackendV1Adapter, getLastBackendFailure } from "@features/accounts/api"
import { defaultAccounts, defaultUsers } from "@features/accounts/model/fixtures"
import type {
  AppUser,
  AutoTransfer,
  GroupAccount,
  Member,
  MemberRole,
  OneTimeDues,
  OneTimeDuesRecord,
  Transaction,
  TransactionType,
} from "@features/accounts/model/types"
import { logger } from "@shared/lib/logger"
import { defaultNotificationPreferences, initialNotifications, type NotificationItem } from "@shared/lib/notification-state"
import {
  readNotificationPreferences,
  writeNotificationPreferences,
  type NotificationPreferences,
} from "@shared/lib/preferences-storage"
import { clearPersistedSession, readPersistedSession, writePersistedSession } from "@shared/lib/session-storage"
import { memberAccentPalette } from "@shared/ui/palette"

type DataSource = "demo" | "remote"

interface CreateAccountInput {
  groupName: string
  bankName: string
  accountNumber: string
  monthlyDuesAmount: number
  dueDay: number
}

interface CreateOneTimeDuesInput {
  title: string
  amount: number
  dueDate: string
}

interface UpdateOneTimeDuesInput {
  title: string
  amount: number
  dueDate: string
}

interface UpdateProfileInput {
  name: string
  email: string
}

interface UpdateAccountInput {
  groupName: string
  bankName: string
  accountNumber: string
  monthlyDuesAmount: number
  dueDay: number
}

interface UpsertMemberInput {
  name: string
  phone: string
  role: MemberRole
}

interface UpsertTransactionInput {
  type: TransactionType
  amount: number
  description: string
  date: string
  category: string
}

interface AppRuntimeContextType {
  isBootstrapping: boolean
  isRefreshingAccounts: boolean
  lastSyncError: string | null
  dataSource: DataSource
  prefersRealApi: boolean
  refreshAccounts: () => Promise<DataSource>
  notifications: NotificationItem[]
  unreadNotificationCount: number
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  clearNotifications: () => Promise<void>
  restoreNotifications: () => Promise<void>
  defaultNotificationPreferences: NotificationPreferences
  notificationPreferences: NotificationPreferences
  updateNotificationPreferences: (next: NotificationPreferences) => Promise<void>
  resetNotificationPreferences: () => void
}

interface AppAuthContextType {
  currentUser: AppUser | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  updateProfile: (data: UpdateProfileInput) => Promise<void>
  logout: () => void
  withdraw: () => void
}

interface AppAccountsContextType {
  accounts: GroupAccount[]
  selectedAccountId: string | null
  selectAccount: (id: string) => void
  clearSelectedAccount: () => void
  createAccount: (data: CreateAccountInput) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  toggleDues: (memberId: string, month: string) => Promise<void>
  updateAutoTransfer: (accountId: string, autoTransfer: AutoTransfer) => Promise<void>
  updateAccount: (accountId: string, data: UpdateAccountInput) => Promise<void>
  createOneTimeDues: (accountId: string, data: CreateOneTimeDuesInput) => Promise<void>
  updateOneTimeDues: (accountId: string, duesId: string, data: UpdateOneTimeDuesInput) => Promise<void>
  closeOneTimeDues: (accountId: string, duesId: string, closed: boolean) => Promise<void>
  deleteOneTimeDues: (accountId: string, duesId: string) => Promise<void>
  toggleOneTimeDuesRecord: (accountId: string, duesId: string, memberId: string) => Promise<void>
  createMember: (accountId: string, data: UpsertMemberInput) => Promise<void>
  updateMember: (accountId: string, memberId: string, data: UpsertMemberInput) => Promise<void>
  deleteMember: (accountId: string, memberId: string) => Promise<void>
  createTransaction: (accountId: string, data: UpsertTransactionInput) => Promise<void>
  updateTransaction: (accountId: string, transactionId: string, data: UpsertTransactionInput) => Promise<void>
  deleteTransaction: (accountId: string, transactionId: string) => Promise<void>
  resetDemoData: () => void
}

interface AppContextType extends AppRuntimeContextType, AppAuthContextType, AppAccountsContextType {}

const AppRuntimeContext = createContext<AppRuntimeContextType | null>(null)
const AppAuthContext = createContext<AppAuthContextType | null>(null)
const AppAccountsContext = createContext<AppAccountsContextType | null>(null)

export function useAppRuntime() {
  const ctx = useContext(AppRuntimeContext)
  if (!ctx) {
    throw new Error("useAppRuntime must be used within AppProvider")
  }
  return ctx
}

export function useAppAuth() {
  const ctx = useContext(AppAuthContext)
  if (!ctx) {
    throw new Error("useAppAuth must be used within AppProvider")
  }
  return ctx
}

export function useAppAccounts() {
  const ctx = useContext(AppAccountsContext)
  if (!ctx) {
    throw new Error("useAppAccounts must be used within AppProvider")
  }
  return ctx
}

export function useApp(): AppContextType {
  const runtime = useAppRuntime()
  const auth = useAppAuth()
  const accounts = useAppAccounts()
  return useMemo(() => ({ ...runtime, ...auth, ...accounts }), [runtime, auth, accounts])
}

function cloneUsers(source: AppUser[]): AppUser[] {
  return source.map((user) => ({ ...user }))
}

function cloneAccounts(source: GroupAccount[]): GroupAccount[] {
  return source.map((account) => ({
    ...account,
    members: account.members.map((member) => ({ ...member })),
    duesRecords: account.duesRecords.map((record) => ({ ...record })),
    transactions: account.transactions.map((tx) => ({ ...tx })),
    autoTransfer: { ...account.autoTransfer },
    oneTimeDues: account.oneTimeDues.map((dues) => ({
      ...dues,
      status: dues.status ?? "active",
      records: dues.records.map((record) => ({ ...record })),
    })),
  }))
}

function createLocalAccount(data: CreateAccountInput, currentUser: AppUser): GroupAccount {
  const timestamp = Date.now()

  return {
    id: `acc${timestamp}`,
    groupName: data.groupName,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    balance: 0,
    monthlyDuesAmount: data.monthlyDuesAmount,
    dueDay: data.dueDay,
    members: [
      {
        id: `mem${timestamp}`,
        userId: currentUser.id,
        name: currentUser.name,
        role: "총무",
        initials: currentUser.name.slice(-2),
        phone: "010-0000-0000",
        joinDate: new Date().toISOString().split("T")[0],
        color: "#3b82f6",
      },
    ],
    duesRecords: [],
    transactions: [],
    autoTransfer: { enabled: false, dayOfMonth: data.dueDay, amount: data.monthlyDuesAmount, fromAccount: "" },
    oneTimeDues: [],
  }
}

function buildMemberInitials(name: string) {
  return name.trim().slice(-2) || "멤버"
}

function pickMemberColor(index: number) {
  return memberAccentPalette[index % memberAccentPalette.length]
}

function createLocalMember(data: UpsertMemberInput, memberCount: number): Member {
  return {
    id: `mem${Date.now()}`,
    name: data.name,
    role: data.role,
    initials: buildMemberInitials(data.name),
    phone: data.phone,
    joinDate: new Date().toISOString().split("T")[0],
    color: pickMemberColor(memberCount),
  }
}

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.id.localeCompare(a.id)
  })
}

function getTransactionImpact(transaction: Pick<Transaction, "type" | "amount">) {
  return transaction.type === "income" ? transaction.amount : -transaction.amount
}

function createLocalTransaction(data: UpsertTransactionInput): Transaction {
  return {
    id: `tx${Date.now()}`,
    type: data.type,
    amount: data.amount,
    description: data.description,
    date: data.date,
    category: data.category,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const backendAdapter = useMemo(() => createAccountsBackendV1Adapter(), [])
  const prefersRealApi = useMemo(() => shouldUseRealApi(apiConfig), [])
  const initialSession = useMemo(() => readPersistedSession(), [])

  const [users, setUsers] = useState<AppUser[]>(() => cloneUsers(defaultUsers))
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isRefreshingAccounts, setIsRefreshingAccounts] = useState(false)
  const [lastSyncError, setLastSyncError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<DataSource>(prefersRealApi ? "remote" : "demo")
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [accounts, setAccounts] = useState<GroupAccount[]>(() => cloneAccounts(defaultAccounts))
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(initialSession?.selectedAccountId ?? null)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [...initialNotifications])
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    () => readNotificationPreferences() ?? defaultNotificationPreferences
  )

  useEffect(() => {
    let cancelled = false

    async function loadBootstrap() {
      const bootstrap = await backendAdapter.loadBootstrap()
      if (!bootstrap || cancelled) {
        setDataSource("demo")
        setLastSyncError(prefersRealApi ? mapApiFailureToUserMessage(getLastBackendFailure()) : null)
        setIsBootstrapping(false)
        return
      }

      setUsers(cloneUsers(bootstrap.users))
      setAccounts(cloneAccounts(bootstrap.accounts))
      setDataSource("remote")
      setLastSyncError(null)
      setIsBootstrapping(false)
    }

    void loadBootstrap()

    return () => {
      cancelled = true
    }
  }, [backendAdapter, prefersRealApi])

  useEffect(() => {
    if (isBootstrapping) return

    const persisted = readPersistedSession()
    if (!persisted) return

    if (persisted.userId) {
      const restoredUser = users.find((user) => user.id === persisted.userId) ?? null
      setCurrentUser(restoredUser)
    }

    if (persisted.selectedAccountId && accounts.some((account) => account.id === persisted.selectedAccountId)) {
      setSelectedAccountId(persisted.selectedAccountId)
    }
  }, [accounts, isBootstrapping, users])

  useEffect(() => {
    if (!selectedAccountId) return
    if (accounts.some((account) => account.id === selectedAccountId)) return
    setSelectedAccountId(null)
  }, [accounts, selectedAccountId])

  useEffect(() => {
    if (isBootstrapping) return

    if (!currentUser && !selectedAccountId) {
      clearPersistedSession()
      return
    }

    writePersistedSession({
      userId: currentUser?.id ?? null,
      selectedAccountId,
    })
  }, [currentUser, isBootstrapping, selectedAccountId])

  useEffect(() => {
    writeNotificationPreferences(notificationPreferences)
  }, [notificationPreferences])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (isBootstrapping) {
      timeoutId = setTimeout(() => {
        setIsBootstrapping(false)
      }, 600)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isBootstrapping])

  const login = useCallback(
    async (email: string, password: string) => {
      const remoteAuth = await backendAdapter.login({ email, password })
      if (remoteAuth?.user) {
        setCurrentUser(remoteAuth.user)
        setDataSource("remote")
        if (remoteAuth.accounts) {
          setAccounts(cloneAccounts(remoteAuth.accounts))
        }
        return true
      }
      if (prefersRealApi) {
        logger.warn({
          scope: "auth.login",
          message: "Falling back to demo authentication after remote login failure.",
        })
      }

      const user = users.find((u) => u.email === email && u.password === password)
      if (!user) return false
      setDataSource("demo")
      setCurrentUser(user)
      return true
    },
    [backendAdapter, prefersRealApi, users]
  )

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const remoteAuth = await backendAdapter.signup({ name, email, password })
      if (remoteAuth?.user) {
        setCurrentUser(remoteAuth.user)
        setDataSource("remote")
        if (remoteAuth.accounts) {
          setAccounts(cloneAccounts(remoteAuth.accounts))
        }
        return true
      }
      if (prefersRealApi) {
        logger.warn({
          scope: "auth.signup",
          message: "Falling back to demo signup after remote signup failure.",
        })
      }

      if (users.some((u) => u.email === email)) return false
      const newUser: AppUser = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
      }
      setUsers((prev) => [...prev, newUser])
      setDataSource("demo")
      setCurrentUser(newUser)
      return true
    },
    [backendAdapter, prefersRealApi, users]
  )

  const updateProfile = useCallback(
    async (data: UpdateProfileInput) => {
      setUsers((prev) =>
        prev.map((user) =>
          currentUser && user.id === currentUser.id
            ? { ...user, name: data.name, email: data.email }
            : user
        )
      )
      setCurrentUser((prev) => (prev ? { ...prev, name: data.name, email: data.email } : prev))
    },
    [currentUser]
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setSelectedAccountId(null)
  }, [])

  const refreshAccounts = useCallback(async () => {
    setIsRefreshingAccounts(true)
    try {
      const bootstrap = await backendAdapter.loadBootstrap()
      if (!bootstrap) {
        setDataSource("demo")
        setLastSyncError(prefersRealApi ? mapApiFailureToUserMessage(getLastBackendFailure()) : null)
        return "demo" as const
      }

      setUsers(cloneUsers(bootstrap.users))
      setAccounts(cloneAccounts(bootstrap.accounts))
      setCurrentUser((prev) => {
        if (!prev) return prev
        return bootstrap.users.find((user) => user.id === prev.id) ?? null
      })
      setDataSource("remote")
      setLastSyncError(null)
      return "remote" as const
    } finally {
      setIsRefreshingAccounts(false)
    }
  }, [backendAdapter, prefersRealApi])

  const withdraw = useCallback(() => {
    if (!currentUser) return

    const userId = currentUser.id

    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setCurrentUser(null)
    setSelectedAccountId(null)

    void backendAdapter.deleteUser(userId)
  }, [backendAdapter, currentUser])

  const selectAccount = useCallback((id: string) => {
    setSelectedAccountId(id)
  }, [])

  const clearSelectedAccount = useCallback(() => {
    setSelectedAccountId(null)
  }, [])

  const createAccount = useCallback(
    async (data: CreateAccountInput) => {
      if (!currentUser) return

      const remoteAccount = await backendAdapter.createAccount(data)
      if (remoteAccount) {
        setAccounts((prev) => [...prev, ...cloneAccounts([remoteAccount])])
        return
      }

      const account = createLocalAccount(data, currentUser)
      setAccounts((prev) => [...prev, account])
    },
    [backendAdapter, currentUser]
  )

  const deleteAccount = useCallback(
    async (id: string) => {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id))
      setSelectedAccountId((prev) => (prev === id ? null : prev))

      await backendAdapter.deleteAccount(id)
    },
    [backendAdapter]
  )

  const toggleDues = useCallback(
    async (memberId: string, month: string) => {
      if (!selectedAccountId) return

      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== selectedAccountId) return acc
          return {
            ...acc,
            duesRecords: acc.duesRecords.map((r) => {
              if (r.memberId !== memberId || r.month !== month) return r
              if (r.status === "unpaid") {
                return {
                  ...r,
                  status: "paid" as const,
                  paidDate: new Date().toISOString().split("T")[0],
                  amount: acc.monthlyDuesAmount,
                }
              }
              if (r.status === "paid") {
                return {
                  ...r,
                  status: "unpaid" as const,
                  paidDate: undefined,
                }
              }
              return r
            }),
          }
        })
      )

      await backendAdapter.toggleDues(selectedAccountId, memberId, month)
    },
    [backendAdapter, selectedAccountId]
  )

  const updateAutoTransfer = useCallback(
    async (accountId: string, autoTransfer: AutoTransfer) => {
      setAccounts((prev) => prev.map((acc) => (acc.id === accountId ? { ...acc, autoTransfer } : acc)))
      await backendAdapter.updateAutoTransfer(accountId, autoTransfer)
    },
    [backendAdapter]
  )

  const updateAccount = useCallback(
    async (accountId: string, data: UpdateAccountInput) => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                groupName: data.groupName,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                monthlyDuesAmount: data.monthlyDuesAmount,
                dueDay: data.dueDay,
                autoTransfer: {
                  ...acc.autoTransfer,
                  dayOfMonth: data.dueDay,
                  amount: acc.autoTransfer.enabled ? acc.autoTransfer.amount : data.monthlyDuesAmount,
                },
              }
            : acc
        )
      )

      await backendAdapter.updateAccount(accountId, data)
    },
    [backendAdapter]
  )

  const createOneTimeDues = useCallback(
    async (accountId: string, data: CreateOneTimeDuesInput) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          const records: OneTimeDuesRecord[] = acc.members.map((m) => ({ memberId: m.id, status: "unpaid" as const }))
          const newDues: OneTimeDues = {
            id: `otd${Date.now()}`,
            title: data.title,
            amount: data.amount,
            dueDate: data.dueDate,
            status: "active",
            records,
          }
          return { ...acc, oneTimeDues: [...acc.oneTimeDues, newDues] }
        })
      )

      await backendAdapter.createOneTimeDues(accountId, data)
    },
    [backendAdapter]
  )

  const updateOneTimeDues = useCallback(
    async (accountId: string, duesId: string, data: UpdateOneTimeDuesInput) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            oneTimeDues: acc.oneTimeDues.map((dues) =>
              dues.id === duesId
                ? {
                    ...dues,
                    title: data.title,
                    amount: data.amount,
                    dueDate: data.dueDate,
                  }
                : dues
            ),
          }
        })
      )
    },
    []
  )

  const closeOneTimeDues = useCallback(
    async (accountId: string, duesId: string, closed: boolean) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            oneTimeDues: acc.oneTimeDues.map((dues) =>
              dues.id === duesId
                ? {
                    ...dues,
                    status: closed ? "closed" : "active",
                  }
                : dues
            ),
          }
        })
      )
    },
    []
  )

  const deleteOneTimeDues = useCallback(async (accountId: string, duesId: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              oneTimeDues: acc.oneTimeDues.filter((dues) => dues.id !== duesId),
            }
          : acc
      )
    )
  }, [])

  const toggleOneTimeDuesRecord = useCallback(
    async (accountId: string, duesId: string, memberId: string) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            oneTimeDues: acc.oneTimeDues.map((dues) => {
              if (dues.id !== duesId) return dues
              if (dues.status === "closed") return dues
              return {
                ...dues,
                records: dues.records.map((record) => {
                  if (record.memberId !== memberId) return record
                  if (record.status === "unpaid") {
                    return {
                      ...record,
                      status: "paid" as const,
                      paidDate: new Date().toISOString().split("T")[0],
                    }
                  }
                  return {
                    ...record,
                    status: "unpaid" as const,
                    paidDate: undefined,
                  }
                }),
              }
            }),
          }
        })
      )

      await backendAdapter.toggleOneTimeDuesRecord(accountId, duesId, memberId)
    },
    [backendAdapter]
  )

  const createMember = useCallback(
    async (accountId: string, data: UpsertMemberInput) => {
      const remoteMember = await backendAdapter.createMember(accountId, data)

      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          const nextMember = remoteMember ?? createLocalMember(data, acc.members.length)
          const nextDues = acc.oneTimeDues.map((dues) => ({
            ...dues,
            records: [...dues.records, { memberId: nextMember.id, status: "unpaid" as const }],
          }))

          return {
            ...acc,
            members: [...acc.members, nextMember],
            duesRecords: [
              ...acc.duesRecords,
              {
                memberId: nextMember.id,
                month: new Date().toISOString().slice(0, 7),
                status: "unpaid" as const,
                amount: acc.monthlyDuesAmount,
              },
            ],
            oneTimeDues: nextDues,
          }
        })
      )
    },
    [backendAdapter]
  )

  const updateMember = useCallback(
    async (accountId: string, memberId: string, data: UpsertMemberInput) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            members: acc.members.map((member) =>
              member.id === memberId
                ? {
                    ...member,
                    name: data.name,
                    phone: data.phone,
                    role: data.role,
                    initials: buildMemberInitials(data.name),
                  }
                : member
            ),
          }
        })
      )

      await backendAdapter.updateMember(accountId, memberId, data)
    },
    [backendAdapter]
  )

  const deleteMember = useCallback(
    async (accountId: string, memberId: string) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            members: acc.members.filter((member) => member.id !== memberId),
            duesRecords: acc.duesRecords.filter((record) => record.memberId !== memberId),
            oneTimeDues: acc.oneTimeDues.map((dues) => ({
              ...dues,
              records: dues.records.filter((record) => record.memberId !== memberId),
            })),
          }
        })
      )

      await backendAdapter.deleteMember(accountId, memberId)
    },
    [backendAdapter]
  )

  const createTransaction = useCallback(
    async (accountId: string, data: UpsertTransactionInput) => {
      const remoteTransaction = await backendAdapter.createTransaction(accountId, data)
      const nextTransaction = remoteTransaction ?? createLocalTransaction(data)

      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            balance: acc.balance + getTransactionImpact(nextTransaction),
            transactions: sortTransactions([nextTransaction, ...acc.transactions]),
          }
        })
      )
    },
    [backendAdapter]
  )

  const updateTransaction = useCallback(
    async (accountId: string, transactionId: string, data: UpsertTransactionInput) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          const currentTransaction = acc.transactions.find((tx) => tx.id === transactionId)
          if (!currentTransaction) return acc

          const nextTransaction: Transaction = {
            ...currentTransaction,
            ...data,
          }

          return {
            ...acc,
            balance:
              acc.balance -
              getTransactionImpact(currentTransaction) +
              getTransactionImpact(nextTransaction),
            transactions: sortTransactions(
              acc.transactions.map((tx) => (tx.id === transactionId ? nextTransaction : tx))
            ),
          }
        })
      )

      await backendAdapter.updateTransaction(accountId, transactionId, data)
    },
    [backendAdapter]
  )

  const deleteTransaction = useCallback(
    async (accountId: string, transactionId: string) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          const currentTransaction = acc.transactions.find((tx) => tx.id === transactionId)
          if (!currentTransaction) return acc

          return {
            ...acc,
            balance: acc.balance - getTransactionImpact(currentTransaction),
            transactions: acc.transactions.filter((tx) => tx.id !== transactionId),
          }
        })
      )

      await backendAdapter.deleteTransaction(accountId, transactionId)
    },
    [backendAdapter]
  )

  const updateNotificationPreferences = useCallback(async (next: NotificationPreferences) => {
    setNotificationPreferences(next)
  }, [])

  const resetNotificationPreferences = useCallback(() => {
    setNotificationPreferences(defaultNotificationPreferences)
  }, [])

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
  }, [])

  const clearNotifications = useCallback(async () => {
    setNotifications([])
  }, [])

  const restoreNotifications = useCallback(async () => {
    setNotifications([...initialNotifications])
  }, [])

  const resetDemoData = useCallback(() => {
    setUsers(cloneUsers(defaultUsers))
    setAccounts(cloneAccounts(defaultAccounts))
    setCurrentUser(null)
    setSelectedAccountId(null)
    setNotifications([...initialNotifications])
    setNotificationPreferences(defaultNotificationPreferences)
    setDataSource("demo")
    setLastSyncError(null)
  }, [])

  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  )

  const runtimeContextValue = useMemo<AppRuntimeContextType>(
    () => ({
      isBootstrapping,
      isRefreshingAccounts,
      lastSyncError,
      dataSource,
      prefersRealApi,
      refreshAccounts,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      restoreNotifications,
      defaultNotificationPreferences,
      notificationPreferences,
      updateNotificationPreferences,
      resetNotificationPreferences,
    }),
    [
      clearNotifications,
      dataSource,
      defaultNotificationPreferences,
      isBootstrapping,
      isRefreshingAccounts,
      lastSyncError,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      notificationPreferences,
      prefersRealApi,
      refreshAccounts,
      resetNotificationPreferences,
      restoreNotifications,
      unreadNotificationCount,
      updateNotificationPreferences,
    ]
  )

  const authContextValue = useMemo<AppAuthContextType>(
    () => ({
      currentUser,
      login,
      signup,
      updateProfile,
      logout,
      withdraw,
    }),
    [currentUser, login, logout, signup, updateProfile, withdraw]
  )

  const accountsContextValue = useMemo<AppAccountsContextType>(
    () => ({
      accounts,
      selectedAccountId,
      selectAccount,
      clearSelectedAccount,
      createAccount,
      deleteAccount,
      toggleDues,
      updateAutoTransfer,
      updateAccount,
      createOneTimeDues,
      updateOneTimeDues,
      closeOneTimeDues,
      deleteOneTimeDues,
      toggleOneTimeDuesRecord,
      createMember,
      updateMember,
      deleteMember,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      resetDemoData,
    }),
    [
      accounts,
      clearSelectedAccount,
      closeOneTimeDues,
      createAccount,
      createMember,
      createOneTimeDues,
      createTransaction,
      deleteAccount,
      deleteMember,
      deleteOneTimeDues,
      deleteTransaction,
      resetDemoData,
      selectAccount,
      selectedAccountId,
      toggleDues,
      toggleOneTimeDuesRecord,
      updateAccount,
      updateAutoTransfer,
      updateMember,
      updateOneTimeDues,
      updateTransaction,
    ]
  )

  return (
    <AppRuntimeContext.Provider value={runtimeContextValue}>
      <AppAuthContext.Provider value={authContextValue}>
        <AppAccountsContext.Provider value={accountsContextValue}>{children}</AppAccountsContext.Provider>
      </AppAuthContext.Provider>
    </AppRuntimeContext.Provider>
  )
}
