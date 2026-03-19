import { useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { createAccountsBackendV1Adapter } from "@features/accounts/api"
import { createMeetingWithSwaggerApi } from "@features/accounts/api/swagger-api"
import type { AppUser, GroupAccount } from "@features/accounts/model/types"
import type { NotificationItem } from "@shared/lib/notification-state"
import type { Dispatch, SetStateAction } from "react"
import { useAccountsOperations } from "./useAccountsOperations"

type DataSource = "demo" | "remote"

interface UseAccountsProviderInput {
  backendAdapter: ReturnType<typeof createAccountsBackendV1Adapter>
  prefersRealApi: boolean
  runBusy: <T>(task: () => Promise<T>) => Promise<T>
  currentUser: AppUser | null
  authTokens: { accessToken: string; refreshToken: string } | null
  accounts: GroupAccount[]
  selectedAccountId: string | null
  resetDemoData: () => void
  setAccounts: Dispatch<SetStateAction<GroupAccount[]>>
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>
  setDataSource: Dispatch<SetStateAction<DataSource>>
}

export function useAccountsProvider({
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
}: UseAccountsProviderInput) {
  const swaggerCreateMeetingMutation = useMutation({
    mutationFn: ({ accessToken, title, bankName, bankAccount }: { accessToken: string; title: string; bankName: string; bankAccount: number }) =>
      createMeetingWithSwaggerApi(accessToken, { title, bankName, bankAccount }),
  })

  // Clear selected account when it no longer exists in the list
  useEffect(() => {
    if (!selectedAccountId) return
    if (accounts.some((account) => account.id === selectedAccountId)) return
    setSelectedAccountId(null)
  }, [accounts, selectedAccountId, setSelectedAccountId])

  const ops = useAccountsOperations({
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

  return {
    accounts,
    selectedAccountId,
    resetDemoData,
    ...ops,
  }
}
