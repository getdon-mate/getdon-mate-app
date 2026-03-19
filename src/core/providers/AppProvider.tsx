import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiConfig, getErrorMessage, isApiError, mapApiFailureToUserMessage, shouldUseRealApi } from "@core/api"
import { createAccountsBackendV1Adapter, getLastBackendFailure } from "@features/accounts/api"
import {
  createMeetingWithSwaggerApi,
  createRemoteUser,
  fetchMyMeetings,
  loginWithSwaggerApi,
  signupWithSwaggerApi,
  toGroupAccountSummary,
  type SwaggerMeetingSummary,
} from "@features/accounts/api/swagger-api"
import { defaultAccounts, defaultUsers } from "@features/accounts/model/fixtures"
import { appEnv } from "@shared/config/app-env"
import type { AppUser, AutoTransfer, GroupAccount } from "@features/accounts/model/types"
import { logger } from "@shared/lib/logger"
import { defaultNotificationPreferences, initialNotifications, type NotificationItem } from "@shared/lib/notification-state"
import {
  readAmountMaskPreference,
  readNotificationPreferences,
  writeAmountMaskPreference,
  writeNotificationPreferences,
  type NotificationPreferences,
} from "@shared/lib/preferences-storage"
import { clearPersistedSession, readPersistedSession, writeLastEmail, writePersistedSession } from "@shared/lib/session-storage"
import { clearPersistedAuthTokens, readPersistedAuthTokens, writePersistedAuthTokens } from "@shared/lib/auth-token-storage"
import {
  cloneAccounts,
  cloneUsers,
  delay,
  type CreateAccountInput,
  type CreateBoardCommentInput,
  type CreateBoardPostInput,
  type UpsertMemberInput,
  type UpsertTransactionInput,
} from "./helpers"
import { useAccountsOperations } from "./hooks/useAccountsOperations"

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
  withdraw: () => void
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
  const queryClient = useQueryClient()
  const backendAdapter = useMemo(() => createAccountsBackendV1Adapter(), [])
  const prefersRealApi = useMemo(() => shouldUseRealApi(apiConfig), [])
  const initialSession = useMemo(() => readPersistedSession(), [])
  const initialTokens = useMemo(() => readPersistedAuthTokens(), [])

  // ─── Shared state ───────────────────────────────────────────────────────────
  const [users, setUsers] = useState<AppUser[]>(() => cloneUsers(defaultUsers))
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isRefreshingAccounts, setIsRefreshingAccounts] = useState(false)
  const [busyCount, setBusyCount] = useState(0)
  const [lastSyncError, setLastSyncError] = useState<string | null>(null)
  const [lastMutationError, setLastMutationError] = useState<string | null>(null)
  const [authRecoveryNotice, setAuthRecoveryNotice] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<DataSource>(prefersRealApi ? "remote" : "demo")
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [accounts, setAccounts] = useState<GroupAccount[]>(() => cloneAccounts(defaultAccounts))
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(initialSession?.selectedAccountId ?? null)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [...initialNotifications])
  const [maskAmounts, setMaskAmounts] = useState<boolean>(() => readAmountMaskPreference())
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    () => readNotificationPreferences() ?? defaultNotificationPreferences
  )
  const [authTokens, setAuthTokens] = useState(() => initialTokens)

  // ─── Remote data queries ────────────────────────────────────────────────────
  const remoteMeetingsQuery = useQuery({
    queryKey: ["swaggerMeetings", authTokens?.accessToken],
    queryFn: async () => {
      if (!authTokens?.accessToken) return []
      return fetchMyMeetings(authTokens.accessToken)
    },
    enabled: prefersRealApi && Boolean(authTokens?.accessToken && currentUser),
  })

  const swaggerLoginMutation = useMutation({ mutationFn: loginWithSwaggerApi })
  const swaggerSignupMutation = useMutation({ mutationFn: signupWithSwaggerApi })
  const swaggerCreateMeetingMutation = useMutation({
    mutationFn: ({ accessToken, title, bankName, bankAccount }: { accessToken: string; title: string; bankName: string; bankAccount: number }) =>
      createMeetingWithSwaggerApi(accessToken, { title, bankName, bankAccount }),
  })

  // ─── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadBootstrap() {
      if (prefersRealApi) {
        setLastSyncError(null)
        setIsBootstrapping(false)
        return
      }
      await delay(appEnv.uiDemoDelayMs)
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
    return () => { cancelled = true }
  }, [backendAdapter, prefersRealApi])

  // ─── Session restore ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isBootstrapping) return
    const persisted = readPersistedSession()
    if (!persisted) {
      setAuthRecoveryNotice(null)
      return
    }
    if (persisted.userId) {
      const restoredUser =
        users.find((user) => user.id === persisted.userId) ??
        (persisted.currentUser ? { ...persisted.currentUser, password: "" } : null)
      setAuthRecoveryNotice(restoredUser ? null : "저장된 로그인 정보를 복원하지 못해 다시 확인이 필요합니다.")
      setCurrentUser(restoredUser)
    } else {
      setAuthRecoveryNotice(null)
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

  // ─── Session persistence ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isBootstrapping) return
    if (!currentUser && !selectedAccountId) {
      clearPersistedSession()
      return
    }
    writePersistedSession({
      userId: currentUser?.id ?? null,
      selectedAccountId,
      currentUser: currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : null,
    })
  }, [currentUser, isBootstrapping, selectedAccountId])

  useEffect(() => {
    if (!authTokens) {
      clearPersistedAuthTokens()
      return
    }
    writePersistedAuthTokens(authTokens)
  }, [authTokens])

  // ─── Remote meetings sync ────────────────────────────────────────────────────
  useEffect(() => {
    if (!prefersRealApi || !currentUser) return
    if (!remoteMeetingsQuery.data) return
    setAccounts(cloneAccounts(remoteMeetingsQuery.data.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, currentUser))))
    setDataSource("remote")
    setLastSyncError(null)
  }, [currentUser, prefersRealApi, remoteMeetingsQuery.data])

  useEffect(() => {
    if (!remoteMeetingsQuery.error) return
    if (isApiError(remoteMeetingsQuery.error) && remoteMeetingsQuery.error.status === 401) {
      setAuthTokens(null)
      setCurrentUser(null)
      setSelectedAccountId(null)
      setAuthRecoveryNotice("로그인이 만료되었습니다. 다시 로그인해주세요.")
    }
  }, [remoteMeetingsQuery.error])

  // ─── Preferences persistence ─────────────────────────────────────────────────
  useEffect(() => { writeNotificationPreferences(notificationPreferences) }, [notificationPreferences])
  useEffect(() => { writeAmountMaskPreference(maskAmounts) }, [maskAmounts])

  // ─── Core utilities ───────────────────────────────────────────────────────────
  const clearMutationError = useCallback(() => { setLastMutationError(null) }, [])

  const runBusy = useCallback(async <T,>(task: () => Promise<T>) => {
    setBusyCount((prev) => prev + 1)
    try {
      await delay(appEnv.uiDemoDelayMs)
      return await task()
    } catch (err) {
      setLastMutationError(getErrorMessage(err, "작업 처리 중 오류가 발생했습니다."))
      throw err
    } finally {
      setBusyCount((prev) => Math.max(0, prev - 1))
    }
  }, [])

  // ─── Auth operations ─────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      if (prefersRealApi) {
        try {
          const tokens = await swaggerLoginMutation.mutateAsync({ email, password })
          const remoteUser = createRemoteUser(email)
          setAuthTokens(tokens)
          setCurrentUser(remoteUser)
          setUsers((prev) => {
            const withoutDup = prev.filter((user) => user.email !== email)
            return [...withoutDup, remoteUser]
          })
          const meetings = await queryClient.fetchQuery({
            queryKey: ["swaggerMeetings", tokens.accessToken],
            queryFn: () => fetchMyMeetings(tokens.accessToken),
          })
          setAccounts(cloneAccounts(meetings.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, remoteUser))))
          setDataSource("remote")
          setLastSyncError(null)
          writeLastEmail(email)
          return true
        } catch (error) {
          logger.error({ scope: "auth.login", message: "Login failed", details: error })
          setLastSyncError(mapApiFailureToUserMessage(getLastBackendFailure()) ?? "실서버 로그인에 실패했습니다.")
          return false
        }
      }
      return false
    },
    [prefersRealApi, queryClient, swaggerLoginMutation]
  )

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      console.log(`[AppAuth] Signup attempt - Mode: ${prefersRealApi ? "Real" : "Demo"}, BaseURL: ${apiConfig.baseUrl}`)
      
      if (prefersRealApi) {
        try {
          console.log(`[AppAuth] Calling signup API for ${email}`)
          await swaggerSignupMutation.mutateAsync({ userName: name.trim(), email: email.trim(), password })
          const tokens = await swaggerLoginMutation.mutateAsync({ email: email.trim(), password })
          const remoteUser = createRemoteUser(email.trim(), name.trim())
          setAuthTokens(tokens)
          setCurrentUser(remoteUser)
          setUsers((prev) => {
            const withoutDup = prev.filter((user) => user.email !== email.trim())
            return [...withoutDup, remoteUser]
          })
          const meetings = await queryClient.fetchQuery({
            queryKey: ["swaggerMeetings", tokens.accessToken],
            queryFn: () => fetchMyMeetings(tokens.accessToken),
          })
          setAccounts(cloneAccounts(meetings.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, remoteUser))))
          setDataSource("remote")
          setLastSyncError(null)
          writeLastEmail(email.trim())
          return true
        } catch (error) {
          const userMessage = mapApiFailureToUserMessage(getLastBackendFailure()) ?? "실서버 회원가입에 실패했습니다."
          setLastSyncError(userMessage)
          return false
        }
      }

      if (users.some((u) => u.email === email)) return false
      console.log(`[AppAuth] Falling back to demo mode for ${email}`)
      const newUser: AppUser = {
        id: `u${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        password,
      }
      setUsers((prev) => [...prev, newUser])
      setDataSource("demo")
      setCurrentUser(newUser)
      return true
    },
    [prefersRealApi, queryClient, swaggerLoginMutation, swaggerSignupMutation]
  )

  const updateProfile = useCallback(
    async (data: UpdateProfileInput) => {
      await runBusy(async () => {
        setUsers((prev) =>
          prev.map((user) =>
            currentUser && user.id === currentUser.id
              ? { ...user, name: data.name, email: data.email }
              : user
          )
        )
        setCurrentUser((prev) => (prev ? { ...prev, name: data.name, email: data.email } : prev))
      })
    },
    [currentUser, runBusy]
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setSelectedAccountId(null)
    setAuthTokens(null)
  }, [])

  const continueAsGuest = useCallback(() => {
    setDataSource("demo")
    setCurrentUser({
      id: "guest",
      name: "게스트",
      email: "guest@example.com",
      password: "",
    })
  }, [])

  const withdraw = useCallback(() => {
    if (!currentUser) return
    const userId = currentUser.id
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setCurrentUser(null)
    setSelectedAccountId(null)
    setAuthTokens(null)
    void backendAdapter.deleteUser(userId)
  }, [backendAdapter, currentUser])

  // ─── Runtime operations ───────────────────────────────────────────────────────
  const refreshAccounts = useCallback(async () => {
    if (prefersRealApi && authTokens?.accessToken && currentUser) {
      setIsRefreshingAccounts(true)
      try {
        const meetings = await queryClient.fetchQuery({
          queryKey: ["swaggerMeetings", authTokens.accessToken],
          queryFn: () => fetchMyMeetings(authTokens.accessToken),
        })
        setAccounts(cloneAccounts(meetings.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, currentUser))))
        setDataSource("remote")
        setLastSyncError(null)
        return "remote" as const
      } catch (err) {
        if (isApiError(err) && err.status === 401) {
          setAuthTokens(null)
          setCurrentUser(null)
          setSelectedAccountId(null)
          setAuthRecoveryNotice("로그인이 만료되었습니다. 다시 로그인해주세요.")
          return "remote" as const
        }
        setLastSyncError("모임 목록을 다시 불러오지 못했습니다.")
        return "remote" as const
      } finally {
        setIsRefreshingAccounts(false)
      }
    }

    setIsRefreshingAccounts(true)
    try {
      await delay(appEnv.uiDemoDelayMs)
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
  }, [authTokens?.accessToken, backendAdapter, currentUser, prefersRealApi, queryClient])

  const toggleMaskAmounts = useCallback(() => { setMaskAmounts((prev) => !prev) }, [])

  // ─── Notification operations ──────────────────────────────────────────────────
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

  const clearNotifications = useCallback(async () => { setNotifications([]) }, [])

  const restoreNotifications = useCallback(async () => { setNotifications([...initialNotifications]) }, [])

  const resetDemoData = useCallback(() => {
    setUsers(cloneUsers(defaultUsers))
    setAccounts(cloneAccounts(defaultAccounts))
    setCurrentUser(null)
    setSelectedAccountId(null)
    setNotifications([...initialNotifications])
    setMaskAmounts(false)
    setNotificationPreferences(defaultNotificationPreferences)
    setDataSource("demo")
    setLastSyncError(null)
  }, [])

  // ─── Accounts operations (delegated to hook) ──────────────────────────────────
  const accountsOps = useAccountsOperations({
    backendAdapter,
    prefersRealApi,
    runBusy,
    currentUser,
    authTokens,
    accounts,
    selectedAccountId,
    setAccounts,
    setSelectedAccountId,
    setNotifications,
    setDataSource,
    swaggerCreateMeetingMutation,
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
      isMutating: busyCount > 0,
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
      busyCount,
      clearMutationError,
      clearNotifications,
      dataSource,
      defaultNotificationPreferences,
      authRecoveryNotice,
      isBootstrapping,
      isRefreshingAccounts,
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

  const authContextValue = useMemo<AppAuthContextType>(
    () => ({ currentUser, login, signup, updateProfile, logout, withdraw, continueAsGuest }),
    [currentUser, login, logout, signup, updateProfile, withdraw, continueAsGuest]
  )

  const accountsContextValue = useMemo<AppAccountsContextType>(
    () => ({
      accounts,
      selectedAccountId,
      resetDemoData,
      ...accountsOps,
    }),
    [accounts, selectedAccountId, resetDemoData, accountsOps]
  )

  return (
    <AppRuntimeContext.Provider value={runtimeContextValue}>
      <AppAuthContext.Provider value={authContextValue}>
        <AppAccountsContext.Provider value={accountsContextValue}>{children}</AppAccountsContext.Provider>
      </AppAuthContext.Provider>
    </AppRuntimeContext.Provider>
  )
}
