import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { apiConfig, shouldUseRealApi } from "@core/api"
import { createAccountsBackendV1Adapter } from "@features/accounts/api"
import { defaultAccounts, defaultUsers } from "@features/accounts/model/fixtures"
import type { AppUser, AutoTransfer, GroupAccount } from "@features/accounts/model/types"
import { defaultNotificationPreferences, initialNotifications, type NotificationItem } from "@shared/lib/notification-state"
import { type NotificationPreferences } from "@shared/lib/preferences-storage"
import { readPersistedSession } from "@shared/lib/session-storage"
import { readPersistedAuthTokens } from "@shared/lib/auth-token-storage"
import {
  cloneAccounts,
  cloneUsers,
  type CreateAccountInput,
  type CreateBoardCommentInput,
  type CreateBoardPostInput,
  type UpsertMemberInput,
  type UpsertTransactionInput,
} from "./helpers"
import { useRuntimeProvider } from "./hooks/useRuntimeProvider"
import { useAuthProvider } from "./hooks/useAuthProvider"
import { useAccountsProvider } from "./hooks/useAccountsProvider"

type DataSource = "demo" | "remote"

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

interface UpdateBoardPostInput {
  title: string
  body: string
  pinned: boolean
}

interface UpdateBoardCommentInput {
  body: string
}

// ─── Context types ────────────────────────────────────────────────────────────

interface AppRuntimeContextType {
  isBootstrapping: boolean
  isRefreshingAccounts: boolean
  isMutating: boolean
  lastSyncError: string | null
  lastMutationError: string | null
  clearMutationError: () => void
  authRecoveryNotice: string | null
  dataSource: DataSource
  prefersRealApi: boolean
  maskAmounts: boolean
  toggleMaskAmounts: () => void
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
  withdraw: () => Promise<void>
  continueAsGuest: () => void
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
  delegateManager: (accountId: string, targetMemberId: string) => Promise<void>
  deleteMember: (accountId: string, memberId: string) => Promise<void>
  createTransaction: (accountId: string, data: UpsertTransactionInput) => Promise<void>
  updateTransaction: (accountId: string, transactionId: string, data: UpsertTransactionInput) => Promise<void>
  deleteTransaction: (accountId: string, transactionId: string) => Promise<void>
  sendPaymentReminder: (accountId: string, memberId: string, month: string) => Promise<void>
  sendTransferRequest: (accountId: string, memberId: string, month: string) => Promise<void>
  createBoardPost: (accountId: string, data: CreateBoardPostInput) => Promise<void>
  addBoardComment: (accountId: string, postId: string, data: CreateBoardCommentInput) => Promise<void>
  updateBoardPost: (accountId: string, postId: string, data: UpdateBoardPostInput) => Promise<void>
  deleteBoardPost: (accountId: string, postId: string) => Promise<void>
  updateBoardComment: (accountId: string, postId: string, commentId: string, data: UpdateBoardCommentInput) => Promise<void>
  deleteBoardComment: (accountId: string, postId: string, commentId: string) => Promise<void>
  toggleBoardPostLike: (accountId: string, postId: string) => Promise<void>
  resetDemoData: () => void
}

interface AppContextType extends AppRuntimeContextType, AppAuthContextType, AppAccountsContextType {}

// ─── Contexts & hooks ─────────────────────────────────────────────────────────

const AppRuntimeContext = createContext<AppRuntimeContextType | null>(null)
const AppAuthContext = createContext<AppAuthContextType | null>(null)
const AppAccountsContext = createContext<AppAccountsContextType | null>(null)

export function useAppRuntime() {
  const ctx = useContext(AppRuntimeContext)
  if (!ctx) throw new Error("useAppRuntime must be used within AppProvider")
  return ctx
}

export function useAppAuth() {
  const ctx = useContext(AppAuthContext)
  if (!ctx) throw new Error("useAppAuth must be used within AppProvider")
  return ctx
}

export function useAppAccounts() {
  const ctx = useContext(AppAccountsContext)
  if (!ctx) throw new Error("useAppAccounts must be used within AppProvider")
  return ctx
}

export function useApp(): AppContextType {
  const runtime = useAppRuntime()
  const auth = useAppAuth()
  const accounts = useAppAccounts()
  return useMemo(() => ({ ...runtime, ...auth, ...accounts }), [runtime, auth, accounts])
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const backendAdapter = useMemo(() => createAccountsBackendV1Adapter(), [])
  const prefersRealApi = useMemo(() => shouldUseRealApi(apiConfig), [])
  const initialSession = useMemo(() => readPersistedSession(), [])
  const initialTokens = useMemo(() => readPersistedAuthTokens(), [])

  // ─── Shared state ────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<AppUser[]>(() => cloneUsers(defaultUsers))
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [authTokens, setAuthTokens] = useState(() => initialTokens)
  const [accounts, setAccounts] = useState<GroupAccount[]>(() => cloneAccounts(defaultAccounts))
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(initialSession?.selectedAccountId ?? null)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [...initialNotifications])
  const [dataSource, setDataSource] = useState<DataSource>(prefersRealApi ? "remote" : "demo")
  const [lastSyncError, setLastSyncError] = useState<string | null>(null)

  // ─── Hooks ───────────────────────────────────────────────────────────────────
  const {
    isBootstrapping,
    isRefreshingAccounts,
    isMutating,
    lastMutationError,
    authRecoveryNotice,
    maskAmounts,
    notificationPreferences,
    runBusy,
    clearMutationError,
    refreshAccounts,
    toggleMaskAmounts,
    updateNotificationPreferences,
    resetNotificationPreferences,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    restoreNotifications,
    resetDemoData,
  } = useRuntimeProvider({
    prefersRealApi,
    backendAdapter,
    users,
    currentUser,
    authTokens,
    accounts,
    selectedAccountId,
    notifications,
    setUsers,
    setCurrentUser,
    setAuthTokens,
    setAccounts,
    setSelectedAccountId,
    setNotifications,
    setDataSource,
    setLastSyncError,
  })

  const auth = useAuthProvider({
    prefersRealApi,
    users,
    currentUser,
    backendAdapter,
    runBusy,
    setUsers,
    setAccounts,
    setCurrentUser,
    setSelectedAccountId,
    setAuthTokens,
    setDataSource,
    setLastSyncError,
  })

  const accountsValue = useAccountsProvider({
    backendAdapter,
    prefersRealApi,
    runBusy,
    currentUser,
    authTokens,
    accounts,
    selectedAccountId,
    resetDemoData,
    setAccounts,
    setSelectedAccountId,
    setNotifications,
    setDataSource,
  })

  // ─── Context values ───────────────────────────────────────────────────────────
  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  )

  const runtimeContextValue = useMemo<AppRuntimeContextType>(
    () => ({
      isBootstrapping,
      isRefreshingAccounts,
      isMutating,
      lastSyncError,
      lastMutationError,
      clearMutationError,
      authRecoveryNotice,
      dataSource,
      prefersRealApi,
      maskAmounts,
      toggleMaskAmounts,
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
      authRecoveryNotice,
      clearMutationError,
      clearNotifications,
      dataSource,
      isBootstrapping,
      isRefreshingAccounts,
      isMutating,
      lastMutationError,
      lastSyncError,
      maskAmounts,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      notificationPreferences,
      prefersRealApi,
      refreshAccounts,
      resetNotificationPreferences,
      restoreNotifications,
      toggleMaskAmounts,
      unreadNotificationCount,
      updateNotificationPreferences,
    ]
  )

  const { login, signup, updateProfile, logout, continueAsGuest, withdraw } = auth

  const authContextValue = useMemo<AppAuthContextType>(
    () => ({ currentUser, login, signup, updateProfile, logout, continueAsGuest, withdraw }),
    [currentUser, login, signup, updateProfile, logout, continueAsGuest, withdraw]
  )

  const accountsContextValue = useMemo<AppAccountsContextType>(
    () => accountsValue,
    [accountsValue]
  )

  return (
    <AppRuntimeContext.Provider value={runtimeContextValue}>
      <AppAuthContext.Provider value={authContextValue}>
        <AppAccountsContext.Provider value={accountsContextValue}>{children}</AppAccountsContext.Provider>
      </AppAuthContext.Provider>
    </AppRuntimeContext.Provider>
  )
}
