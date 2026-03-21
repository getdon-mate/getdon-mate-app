import { useCallback, useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage, isApiError, mapApiFailureToUserMessage } from "@core/api"
import { createAccountsBackendV1Adapter, getLastBackendFailure } from "@features/accounts/api"
import { fetchMyMeetings, refreshAccessToken, type SwaggerMeetingSummary } from "@features/accounts/api/swagger-api"
import { meetingKeys } from "@core/api/query-keys"
import { toGroupAccountSummary } from "@features/accounts/api/mappers"
import { defaultAccounts, defaultUsers } from "@features/accounts/model/fixtures"
import type { AppUser, GroupAccount } from "@features/accounts/model/types"
import { appEnv } from "@shared/config/app-env"
import { defaultNotificationPreferences, initialNotifications, type NotificationItem } from "@shared/lib/notification-state"
import {
  readAmountMaskPreference,
  readNotificationPreferences,
  writeAmountMaskPreference,
  writeNotificationPreferences,
  type NotificationPreferences,
} from "@shared/lib/preferences-storage"
import { clearPersistedSession, readPersistedSession, writePersistedSession } from "@shared/lib/session-storage"
import { clearPersistedAuthTokens, writePersistedAuthTokens } from "@shared/lib/auth-token-storage"
import { cloneAccounts, cloneUsers, delay } from "../helpers"
import type { Dispatch, SetStateAction } from "react"

type DataSource = "demo" | "remote"

interface UseRuntimeProviderInput {
  prefersRealApi: boolean
  backendAdapter: ReturnType<typeof createAccountsBackendV1Adapter>
  users: AppUser[]
  currentUser: AppUser | null
  authTokens: { accessToken: string; refreshToken: string } | null
  accounts: GroupAccount[]
  selectedAccountId: string | null
  notifications: NotificationItem[]
  setUsers: Dispatch<SetStateAction<AppUser[]>>
  setCurrentUser: Dispatch<SetStateAction<AppUser | null>>
  setAuthTokens: Dispatch<SetStateAction<{ accessToken: string; refreshToken: string } | null>>
  setAccounts: Dispatch<SetStateAction<GroupAccount[]>>
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>
  setDataSource: Dispatch<SetStateAction<DataSource>>
  setLastSyncError: Dispatch<SetStateAction<string | null>>
}

export function useRuntimeProvider({
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
}: UseRuntimeProviderInput) {
  const queryClient = useQueryClient()

  // ─── Internal state ──────────────────────────────────────────────────────────
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isRefreshingAccounts, setIsRefreshingAccounts] = useState(false)
  const [busyCount, setBusyCount] = useState(0)
  const [lastMutationError, setLastMutationError] = useState<string | null>(null)
  const [authRecoveryNotice, setAuthRecoveryNotice] = useState<string | null>(null)
  const [maskAmounts, setMaskAmounts] = useState<boolean>(() => readAmountMaskPreference())
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    () => readNotificationPreferences() ?? defaultNotificationPreferences
  )

  // ─── Remote data query ───────────────────────────────────────────────────────
  const remoteMeetingsQuery = useQuery({
    queryKey: meetingKeys.list(authTokens?.accessToken ?? ""),
    queryFn: async () => {
      if (!authTokens?.accessToken) return []
      return fetchMyMeetings(authTokens.accessToken)
    },
    enabled: prefersRealApi && Boolean(authTokens?.accessToken && currentUser),
  })

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
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
  }, [backendAdapter, prefersRealApi, setIsBootstrapping, setLastSyncError, setDataSource, setUsers, setAccounts])

  // ─── Session restore ─────────────────────────────────────────────────────────
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
  }, [accounts, isBootstrapping, users, setAuthRecoveryNotice, setCurrentUser, setSelectedAccountId])

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

  // ─── Auth token persistence ───────────────────────────────────────────────────
  useEffect(() => {
    if (!authTokens) {
      clearPersistedAuthTokens()
      return
    }
    writePersistedAuthTokens(authTokens)
  }, [authTokens])

  // ─── Remote meetings sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!prefersRealApi || !currentUser) return
    if (!remoteMeetingsQuery.data) return
    setAccounts(cloneAccounts(remoteMeetingsQuery.data.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, currentUser))))
    setDataSource("remote")
    setLastSyncError(null)
  }, [currentUser, prefersRealApi, remoteMeetingsQuery.data, setAccounts, setDataSource, setLastSyncError])

  // ─── Token refresh ────────────────────────────────────────────────────────────
  /**
   * refreshToken으로 새 accessToken 발급을 시도합니다.
   * 성공 시 authTokens 갱신(true 반환), 실패 시 강제 로그아웃(false 반환).
   */
  const tryRefreshTokens = useCallback(async (): Promise<boolean> => {
    if (!authTokens?.refreshToken) {
      setAuthTokens(null)
      setCurrentUser(null)
      setSelectedAccountId(null)
      return false
    }
    try {
      const newTokens = await refreshAccessToken(authTokens.refreshToken)
      setAuthTokens(newTokens)
      return true
    } catch {
      setAuthTokens(null)
      setCurrentUser(null)
      setSelectedAccountId(null)
      return false
    }
  }, [authTokens?.refreshToken, setAuthTokens, setCurrentUser, setSelectedAccountId])

  useEffect(() => {
    if (!remoteMeetingsQuery.error) return
    if (!isApiError(remoteMeetingsQuery.error) || remoteMeetingsQuery.error.status !== 401) return
    void (async () => {
      const refreshed = await tryRefreshTokens()
      if (!refreshed) {
        setAuthRecoveryNotice("로그인이 만료되었습니다. 다시 로그인해주세요.")
      }
      // 성공 시 authTokens 변경 → remoteMeetingsQuery 자동 재실행
    })()
  }, [remoteMeetingsQuery.error, tryRefreshTokens, setAuthRecoveryNotice])

  // ─── Preferences persistence ──────────────────────────────────────────────────
  useEffect(() => { writeNotificationPreferences(notificationPreferences) }, [notificationPreferences])
  useEffect(() => { writeAmountMaskPreference(maskAmounts) }, [maskAmounts])

  // ─── Core utilities ───────────────────────────────────────────────────────────
  const clearMutationError = useCallback(() => { setLastMutationError(null) }, [])

  const runBusy = useCallback(async <T,>(task: () => Promise<T>) => {
    setBusyCount((prev) => prev + 1)
    try {
      if (!prefersRealApi) await delay(appEnv.uiDemoDelayMs)
      return await task()
    } catch (err) {
      setLastMutationError(getErrorMessage(err, "작업 처리 중 오류가 발생했습니다."))
      throw err
    } finally {
      setBusyCount((prev) => Math.max(0, prev - 1))
    }
  }, [])

  // ─── refreshAccounts ─────────────────────────────────────────────────────────
  const refreshAccounts = useCallback(async () => {
    if (prefersRealApi && authTokens?.accessToken && currentUser) {
      setIsRefreshingAccounts(true)
      try {
        const meetings = await queryClient.fetchQuery({
          queryKey: meetingKeys.list(authTokens.accessToken),
          queryFn: () => fetchMyMeetings(authTokens.accessToken),
        })
        setAccounts(cloneAccounts(meetings.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, currentUser))))
        setDataSource("remote")
        setLastSyncError(null)
        return "remote" as const
      } catch (err) {
        if (isApiError(err) && err.status === 401) {
          const refreshed = await tryRefreshTokens()
          if (!refreshed) {
            setAuthRecoveryNotice("로그인이 만료되었습니다. 다시 로그인해주세요.")
          }
          // 성공 시 authTokens 변경 → 다음 refreshAccounts 호출 시 새 토큰 사용
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
  }, [authTokens?.accessToken, backendAdapter, currentUser, prefersRealApi, queryClient, tryRefreshTokens, setAccounts, setAuthTokens, setCurrentUser, setDataSource, setLastSyncError, setSelectedAccountId, setUsers])

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
  }, [setNotifications])

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
  }, [setNotifications])

  const clearNotifications = useCallback(async () => { setNotifications([]) }, [setNotifications])

  const restoreNotifications = useCallback(async () => { setNotifications([...initialNotifications]) }, [setNotifications])

  // ─── resetDemoData ────────────────────────────────────────────────────────────
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
    setLastMutationError(null)
    setAuthRecoveryNotice(null)
  }, [setUsers, setAccounts, setCurrentUser, setSelectedAccountId, setNotifications, setDataSource, setLastSyncError])

  return {
    isBootstrapping,
    isRefreshingAccounts,
    isMutating: busyCount > 0,
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
  }
}
