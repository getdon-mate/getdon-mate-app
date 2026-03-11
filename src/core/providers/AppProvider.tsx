import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import {
  defaultAccounts,
  defaultUsers,
} from "@features/accounts/model/mock-data"
import type {
  AppUser,
  AutoTransfer,
  GroupAccount,
  OneTimeDues,
  OneTimeDuesRecord,
} from "@features/accounts/model/types"

export type AppView = "login" | "account-list" | "account-detail"

interface AppContextType {
  currentUser: AppUser | null
  currentView: AppView
  accounts: GroupAccount[]
  selectedAccountId: string | null
  login: (email: string, password: string) => boolean
  signup: (name: string, email: string, password: string) => boolean
  logout: () => void
  withdraw: () => void
  setCurrentView: (view: AppView) => void
  selectAccount: (id: string) => void
  createAccount: (data: {
    groupName: string
    bankName: string
    accountNumber: string
    monthlyDuesAmount: number
    dueDay: number
  }) => void
  deleteAccount: (id: string) => void
  toggleDues: (memberId: string, month: string) => void
  updateAutoTransfer: (accountId: string, autoTransfer: AutoTransfer) => void
  createOneTimeDues: (accountId: string, data: { title: string; amount: number; dueDate: string }) => void
  toggleOneTimeDuesRecord: (accountId: string, duesId: string, memberId: string) => void
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

export function AppProvider({ children }: { children: ReactNode }) {
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

  const [users, setUsers] = useState<AppUser[]>(() => cloneUsers(defaultUsers))
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [currentView, setCurrentView] = useState<AppView>("login")
  const [accounts, setAccounts] = useState<GroupAccount[]>(() => cloneAccounts(defaultAccounts))
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const login = useCallback(
    (email: string, password: string) => {
      const user = users.find((u) => u.email === email && u.password === password)
      if (!user) return false
      setCurrentUser(user)
      setCurrentView("account-list")
      return true
    },
    [users]
  )

  const signup = useCallback(
    (name: string, email: string, password: string) => {
      if (users.some((u) => u.email === email)) return false
      const newUser: AppUser = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
      }
      setUsers((prev) => [...prev, newUser])
      setCurrentUser(newUser)
      setCurrentView("account-list")
      return true
    },
    [users]
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setSelectedAccountId(null)
    setCurrentView("login")
  }, [])

  const withdraw = useCallback(() => {
    if (!currentUser) return
    setUsers((prev) => prev.filter((u) => u.id !== currentUser.id))
    setCurrentUser(null)
    setSelectedAccountId(null)
    setCurrentView("login")
  }, [currentUser])

  const selectAccount = useCallback((id: string) => {
    setSelectedAccountId(id)
    setCurrentView("account-detail")
  }, [])

  const createAccount = useCallback(
    (data: { groupName: string; bankName: string; accountNumber: string; monthlyDuesAmount: number; dueDay: number }) => {
      if (!currentUser) return
      const account: GroupAccount = {
        id: `acc${Date.now()}`,
        groupName: data.groupName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        balance: 0,
        monthlyDuesAmount: data.monthlyDuesAmount,
        dueDay: data.dueDay,
        members: [
          {
            id: `mem${Date.now()}`,
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
      setAccounts((prev) => [...prev, account])
    },
    [currentUser]
  )

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id))
    setSelectedAccountId(null)
    setCurrentView("account-list")
  }, [])

  const toggleDues = useCallback(
    (memberId: string, month: string) => {
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
    },
    [selectedAccountId]
  )

  const updateAutoTransfer = useCallback((accountId: string, autoTransfer: AutoTransfer) => {
    setAccounts((prev) => prev.map((acc) => (acc.id === accountId ? { ...acc, autoTransfer } : acc)))
  }, [])

  const createOneTimeDues = useCallback(
    (accountId: string, data: { title: string; amount: number; dueDate: string }) => {
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
    },
    []
  )

  const toggleOneTimeDuesRecord = useCallback((accountId: string, duesId: string, memberId: string) => {
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
  }, [])

  const resetDemoData = useCallback(() => {
    setUsers(cloneUsers(defaultUsers))
    setAccounts(cloneAccounts(defaultAccounts))
    setCurrentUser(null)
    setSelectedAccountId(null)
    setCurrentView("login")
  }, [])

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentView,
        accounts,
        selectedAccountId,
        login,
        signup,
        logout,
        withdraw,
        setCurrentView,
        selectAccount,
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
