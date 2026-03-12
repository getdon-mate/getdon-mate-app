import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { createAccountsBackendV1Adapter } from "@features/accounts/api"
import { defaultAccounts, defaultUsers } from "@features/accounts/model/mock-data"
import type { AppUser, AutoTransfer, GroupAccount, OneTimeDues, OneTimeDuesRecord } from "@features/accounts/model/types"

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

interface AppContextType {
  isBootstrapping: boolean
  currentUser: AppUser | null
  accounts: GroupAccount[]
  selectedAccountId: string | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  withdraw: () => void
  selectAccount: (id: string) => void
  clearSelectedAccount: () => void
  createAccount: (data: CreateAccountInput) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  toggleDues: (memberId: string, month: string) => Promise<void>
  updateAutoTransfer: (accountId: string, autoTransfer: AutoTransfer) => Promise<void>
  createOneTimeDues: (accountId: string, data: CreateOneTimeDuesInput) => Promise<void>
  toggleOneTimeDuesRecord: (accountId: string, duesId: string, memberId: string) => Promise<void>
  resetDemoData: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider")
  }
  return ctx
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

export function AppProvider({ children }: { children: ReactNode }) {
  const backendAdapter = useMemo(() => createAccountsBackendV1Adapter(), [])

  const [users, setUsers] = useState<AppUser[]>(() => cloneUsers(defaultUsers))
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [accounts, setAccounts] = useState<GroupAccount[]>(() => cloneAccounts(defaultAccounts))
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadBootstrap() {
      const bootstrap = await backendAdapter.loadBootstrap()
      if (!bootstrap || cancelled) return

      setUsers(cloneUsers(bootstrap.users))
      setAccounts(cloneAccounts(bootstrap.accounts))
      setIsBootstrapping(false)
    }

    void loadBootstrap()

    return () => {
      cancelled = true
    }
  }, [backendAdapter])

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
        if (remoteAuth.accounts) {
          setAccounts(cloneAccounts(remoteAuth.accounts))
        }
        return true
      }

      const user = users.find((u) => u.email === email && u.password === password)
      if (!user) return false
      setCurrentUser(user)
      return true
    },
    [backendAdapter, users]
  )

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const remoteAuth = await backendAdapter.signup({ name, email, password })
      if (remoteAuth?.user) {
        setCurrentUser(remoteAuth.user)
        if (remoteAuth.accounts) {
          setAccounts(cloneAccounts(remoteAuth.accounts))
        }
        return true
      }

      if (users.some((u) => u.email === email)) return false
      const newUser: AppUser = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
      }
      setUsers((prev) => [...prev, newUser])
      setCurrentUser(newUser)
      return true
    },
    [backendAdapter, users]
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setSelectedAccountId(null)
  }, [])

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
            records,
          }
          return { ...acc, oneTimeDues: [...acc.oneTimeDues, newDues] }
        })
      )

      await backendAdapter.createOneTimeDues(accountId, data)
    },
    [backendAdapter]
  )

  const toggleOneTimeDuesRecord = useCallback(
    async (accountId: string, duesId: string, memberId: string) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            oneTimeDues: acc.oneTimeDues.map((dues) => {
              if (dues.id !== duesId) return dues
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

  const resetDemoData = useCallback(() => {
    setUsers(cloneUsers(defaultUsers))
    setAccounts(cloneAccounts(defaultAccounts))
    setCurrentUser(null)
    setSelectedAccountId(null)
  }, [])

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isBootstrapping,
        accounts,
        selectedAccountId,
        login,
        signup,
        logout,
        withdraw,
        selectAccount,
        clearSelectedAccount,
        createAccount,
        deleteAccount,
        toggleDues,
        updateAutoTransfer,
        createOneTimeDues,
        toggleOneTimeDuesRecord,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
