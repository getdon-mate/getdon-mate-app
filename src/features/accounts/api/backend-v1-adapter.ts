import { apiClient, isApiError, shouldUseRealApi } from "@core/api"
import type { AppUser, AutoTransfer, GroupAccount, Member, MemberRole, Transaction, TransactionType } from "../model/types"

const API_V1_PREFIX = "/api/v1"

interface AuthPayload {
  email: string
  password: string
}

interface SignupPayload extends AuthPayload {
  name: string
}

interface CreateAccountPayload {
  groupName: string
  bankName: string
  accountNumber: string
  monthlyDuesAmount: number
  dueDay: number
}

interface CreateOneTimeDuesPayload {
  title: string
  amount: number
  dueDate: string
}

interface UpdateAccountPayload {
  groupName: string
  bankName: string
  accountNumber: string
  monthlyDuesAmount: number
  dueDay: number
}

interface UpsertMemberPayload {
  name: string
  phone: string
  role: MemberRole
}

interface UpsertTransactionPayload {
  type: TransactionType
  amount: number
  description: string
  date: string
  category: string
}

interface AuthResponse {
  user: AppUser
  accounts?: GroupAccount[]
}

interface BootstrapResponse {
  users: AppUser[]
  accounts: GroupAccount[]
}

export interface AccountsBackendAdapter {
  loadBootstrap: () => Promise<BootstrapResponse | null>
  login: (payload: AuthPayload) => Promise<AuthResponse | null>
  signup: (payload: SignupPayload) => Promise<AuthResponse | null>
  createAccount: (payload: CreateAccountPayload) => Promise<GroupAccount | null>
  deleteAccount: (accountId: string) => Promise<void>
  toggleDues: (accountId: string, memberId: string, month: string) => Promise<void>
  updateAutoTransfer: (accountId: string, autoTransfer: AutoTransfer) => Promise<void>
  updateAccount: (accountId: string, payload: UpdateAccountPayload) => Promise<void>
  createOneTimeDues: (accountId: string, payload: CreateOneTimeDuesPayload) => Promise<void>
  toggleOneTimeDuesRecord: (accountId: string, duesId: string, memberId: string) => Promise<void>
  createMember: (accountId: string, payload: UpsertMemberPayload) => Promise<Member | null>
  updateMember: (accountId: string, memberId: string, payload: UpsertMemberPayload) => Promise<void>
  deleteMember: (accountId: string, memberId: string) => Promise<void>
  createTransaction: (accountId: string, payload: UpsertTransactionPayload) => Promise<Transaction | null>
  updateTransaction: (accountId: string, transactionId: string, payload: UpsertTransactionPayload) => Promise<void>
  deleteTransaction: (accountId: string, transactionId: string) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
}

function backendEnabled(): boolean {
  if (!shouldUseRealApi()) return false
  return apiClient.hasBaseUrl
}

async function tryBackend<T>(operationName: string, operation: () => Promise<T>): Promise<T | null> {
  if (!backendEnabled()) {
    return null
  }

  try {
    return await operation()
  } catch (error) {
    if (isApiError(error)) {
      console.warn(`[api:${operationName}] ${error.code ?? "UNKNOWN"} (${error.status ?? "n/a"}) ${error.message}`)
    } else {
      console.warn(`[api:${operationName}] Unexpected backend error`, error)
    }
    return null
  }
}

async function fetchAccounts(): Promise<GroupAccount[] | null> {
  return tryBackend("accounts.list", () => apiClient.get<GroupAccount[]>(`${API_V1_PREFIX}/accounts`))
}

export function createAccountsBackendV1Adapter(): AccountsBackendAdapter {
  return {
    async loadBootstrap() {
      return tryBackend("bootstrap", () => apiClient.get<BootstrapResponse>(`${API_V1_PREFIX}/bootstrap`))
    },

    async login(payload) {
      const response = await tryBackend("auth.login", () =>
        apiClient.post<AuthResponse>(`${API_V1_PREFIX}/auth/login`, payload)
      )
      if (!response) return null

      if (!response.accounts) {
        const accounts = await fetchAccounts()
        if (accounts) {
          return { ...response, accounts }
        }
      }

      return response
    },

    async signup(payload) {
      const response = await tryBackend("auth.signup", () =>
        apiClient.post<AuthResponse>(`${API_V1_PREFIX}/auth/signup`, payload)
      )
      if (!response) return null

      if (!response.accounts) {
        const accounts = await fetchAccounts()
        if (accounts) {
          return { ...response, accounts }
        }
      }

      return response
    },

    async createAccount(payload) {
      return tryBackend("accounts.create", () => apiClient.post<GroupAccount>(`${API_V1_PREFIX}/accounts`, payload))
    },

    async deleteAccount(accountId) {
      await tryBackend("accounts.delete", () => apiClient.delete(`${API_V1_PREFIX}/accounts/${accountId}`))
    },

    async toggleDues(accountId, memberId, month) {
      await tryBackend("accounts.dues.toggle", () =>
        apiClient.patch(`${API_V1_PREFIX}/accounts/${accountId}/dues`, { memberId, month })
      )
    },

    async updateAutoTransfer(accountId, autoTransfer) {
      await tryBackend("accounts.autoTransfer.update", () =>
        apiClient.patch(`${API_V1_PREFIX}/accounts/${accountId}/auto-transfer`, autoTransfer)
      )
    },

    async updateAccount(accountId, payload) {
      await tryBackend("accounts.update", () =>
        apiClient.patch(`${API_V1_PREFIX}/accounts/${accountId}`, payload)
      )
    },

    async createOneTimeDues(accountId, payload) {
      await tryBackend("accounts.oneTimeDues.create", () =>
        apiClient.post(`${API_V1_PREFIX}/accounts/${accountId}/one-time-dues`, payload)
      )
    },

    async toggleOneTimeDuesRecord(accountId, duesId, memberId) {
      await tryBackend("accounts.oneTimeDues.record.toggle", () =>
        apiClient.patch(`${API_V1_PREFIX}/accounts/${accountId}/one-time-dues/${duesId}/records/${memberId}`)
      )
    },

    async createMember(accountId, payload) {
      return tryBackend("accounts.members.create", () =>
        apiClient.post<Member>(`${API_V1_PREFIX}/accounts/${accountId}/members`, payload)
      )
    },

    async updateMember(accountId, memberId, payload) {
      await tryBackend("accounts.members.update", () =>
        apiClient.patch(`${API_V1_PREFIX}/accounts/${accountId}/members/${memberId}`, payload)
      )
    },

    async deleteMember(accountId, memberId) {
      await tryBackend("accounts.members.delete", () =>
        apiClient.delete(`${API_V1_PREFIX}/accounts/${accountId}/members/${memberId}`)
      )
    },

    async createTransaction(accountId, payload) {
      return tryBackend("accounts.transactions.create", () =>
        apiClient.post<Transaction>(`${API_V1_PREFIX}/accounts/${accountId}/transactions`, payload)
      )
    },

    async updateTransaction(accountId, transactionId, payload) {
      await tryBackend("accounts.transactions.update", () =>
        apiClient.patch(`${API_V1_PREFIX}/accounts/${accountId}/transactions/${transactionId}`, payload)
      )
    },

    async deleteTransaction(accountId, transactionId) {
      await tryBackend("accounts.transactions.delete", () =>
        apiClient.delete(`${API_V1_PREFIX}/accounts/${accountId}/transactions/${transactionId}`)
      )
    },

    async deleteUser(userId) {
      await tryBackend("users.delete", () => apiClient.delete(`${API_V1_PREFIX}/users/${userId}`))
    },
  }
}
