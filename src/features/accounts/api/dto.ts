import type { MemberRole, TransactionType } from "../model/types"

export interface ApiUser {
  id: string
  name: string
  email: string
  password: string
}

export interface ApiMember {
  id: string
  userId?: string
  name: string
  role: MemberRole
  initials: string
  phone: string
  joinDate: string
  color: string
}

export interface ApiDuesRecord {
  memberId: string
  month: string
  status: "paid" | "unpaid" | "exempt"
  paidDate?: string
  amount: number
}

export interface ApiTransaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  category: string
  memberId?: string
}

export interface ApiAutoTransfer {
  enabled: boolean
  dayOfMonth: number
  amount: number
  fromAccount: string
}

export interface ApiOneTimeDuesRecord {
  memberId: string
  status: "paid" | "unpaid" | "exempt"
  paidDate?: string
}

export interface ApiOneTimeDues {
  id: string
  title: string
  amount: number
  dueDate: string
  status?: "active" | "closed"
  records: ApiOneTimeDuesRecord[]
}

export interface ApiGroupAccount {
  id: string
  groupName: string
  bankName: string
  accountNumber: string
  balance: number
  monthlyDuesAmount: number
  dueDay: number
  members: ApiMember[]
  duesRecords: ApiDuesRecord[]
  transactions: ApiTransaction[]
  autoTransfer: ApiAutoTransfer
  oneTimeDues: ApiOneTimeDues[]
}

export interface ApiAuthResponse {
  user: ApiUser
  accounts?: ApiGroupAccount[]
}

export interface ApiBootstrapResponse {
  users: ApiUser[]
  accounts: ApiGroupAccount[]
}
