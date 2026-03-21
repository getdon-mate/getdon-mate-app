import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage } from "@core/api"
import { meetingKeys } from "@core/api/query-keys"
import { createAccountsBackendV1Adapter } from "@features/accounts/api"
import { fetchMyMeetings, loginWithSwaggerApi, signupWithSwaggerApi, type SwaggerMeetingSummary } from "@features/accounts/api/swagger-api"
import { createRemoteUser, toGroupAccountSummary } from "@features/accounts/api/mappers"
import { defaultAccounts } from "@features/accounts/model/fixtures"
import type { AppUser, GroupAccount } from "@features/accounts/model/types"
import { logger } from "@shared/lib/logger"
import { writeLastEmail } from "@shared/lib/session-storage"
import { cloneAccounts } from "../helpers"
import type { Dispatch, SetStateAction } from "react"

type DataSource = "demo" | "remote"

interface UpdateProfileInput {
  name: string
  email: string
}

interface UseAuthProviderInput {
  prefersRealApi: boolean
  users: AppUser[]
  currentUser: AppUser | null
  backendAdapter: ReturnType<typeof createAccountsBackendV1Adapter>
  runBusy: <T>(task: () => Promise<T>) => Promise<T>
  setUsers: Dispatch<SetStateAction<AppUser[]>>
  setAccounts: Dispatch<SetStateAction<GroupAccount[]>>
  setCurrentUser: Dispatch<SetStateAction<AppUser | null>>
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>
  setAuthTokens: Dispatch<SetStateAction<{ accessToken: string; refreshToken: string } | null>>
  setDataSource: Dispatch<SetStateAction<DataSource>>
  setLastSyncError: Dispatch<SetStateAction<string | null>>
}

export function useAuthProvider({
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
}: UseAuthProviderInput) {
  const queryClient = useQueryClient()
  const swaggerLoginMutation = useMutation({ mutationFn: loginWithSwaggerApi })
  const swaggerSignupMutation = useMutation({ mutationFn: signupWithSwaggerApi })

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
            queryKey: meetingKeys.list(tokens.accessToken),
            queryFn: () => fetchMyMeetings(tokens.accessToken),
          })
          setAccounts(cloneAccounts(meetings.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, remoteUser))))
          setDataSource("remote")
          setLastSyncError(null)
          writeLastEmail(email)
          return true
        } catch (error) {
          logger.error({ scope: "auth.login", message: "Login failed", details: error })
          setLastSyncError(getErrorMessage(error, "실서버 로그인에 실패했습니다."))
          return false
        }
      }
      const localUser = users.find((u) => u.email === email && u.password !== undefined && u.password === password)
      if (localUser) {
        setCurrentUser(localUser)
        setAccounts(cloneAccounts(defaultAccounts))
        setDataSource("demo")
        setLastSyncError(null)
        return true
      }
      setLastSyncError("이메일 또는 비밀번호가 올바르지 않습니다.")
      return false
    },
    [prefersRealApi, queryClient, swaggerLoginMutation, users, setAuthTokens, setCurrentUser, setUsers, setAccounts, setDataSource, setLastSyncError]
  )

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      logger.info({ scope: "auth.signup", message: `Signup attempt - Mode: ${prefersRealApi ? "Real" : "Demo"}` })

      if (prefersRealApi) {
        try {
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
            queryKey: meetingKeys.list(tokens.accessToken),
            queryFn: () => fetchMyMeetings(tokens.accessToken),
          })
          setAccounts(cloneAccounts(meetings.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, remoteUser))))
          setDataSource("remote")
          setLastSyncError(null)
          writeLastEmail(email.trim())
          return true
        } catch (error) {
          setLastSyncError(getErrorMessage(error, "실서버 회원가입에 실패했습니다."))
          return false
        }
      }

      if (users.some((u) => u.email === email)) return false
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
    [prefersRealApi, queryClient, swaggerLoginMutation, swaggerSignupMutation, users, setAuthTokens, setCurrentUser, setUsers, setAccounts, setDataSource, setLastSyncError]
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
    [currentUser, runBusy, setUsers, setCurrentUser]
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setSelectedAccountId(null)
    setAuthTokens(null)
  }, [setCurrentUser, setSelectedAccountId, setAuthTokens])

  const continueAsGuest = useCallback(() => {
    setDataSource("demo")
    setCurrentUser({
      id: "guest",
      name: "게스트",
      email: "guest@example.com",
      password: "",
      isGuest: true,
    })
  }, [setDataSource, setCurrentUser])

  const withdraw = useCallback(async () => {
    if (!currentUser) return
    const userId = currentUser.id
    try {
      await backendAdapter.deleteUser(userId)
    } catch {
      // 백엔드 삭제 실패해도 로컬 상태는 초기화 (사용자 경험 우선)
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setCurrentUser(null)
    setSelectedAccountId(null)
    setAuthTokens(null)
    setAccounts(cloneAccounts(defaultAccounts))
    setDataSource("demo")
  }, [backendAdapter, currentUser, setUsers, setCurrentUser, setSelectedAccountId, setAuthTokens, setAccounts, setDataSource])

  return { login, signup, updateProfile, logout, continueAsGuest, withdraw }
}
