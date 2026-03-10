export type MemberRole = "총무" | "멤버"

export interface Member {
  id: string
  name: string
  role: MemberRole
  initials: string
  phone: string
  joinDate: string
  color: string
}

export type DuesStatus = "paid" | "unpaid" | "exempt"

export interface DuesRecord {
  memberId: string
  month: string
  status: DuesStatus
  paidDate?: string
  amount: number
}

export type TransactionType = "income" | "expense"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  category: string
  memberId?: string
}

export interface AutoTransfer {
  enabled: boolean
  dayOfMonth: number
  amount: number
  fromAccount: string
}

export interface OneTimeDuesRecord {
  memberId: string
  status: DuesStatus
  paidDate?: string
}

export interface OneTimeDues {
  id: string
  title: string
  amount: number
  dueDate: string
  records: OneTimeDuesRecord[]
}

export interface GroupAccount {
  id: string
  groupName: string
  bankName: string
  accountNumber: string
  balance: number
  monthlyDuesAmount: number
  dueDay: number
  members: Member[]
  duesRecords: DuesRecord[]
  transactions: Transaction[]
  autoTransfer: AutoTransfer
  oneTimeDues: OneTimeDues[]
}

export interface AppUser {
  id: string
  name: string
  email: string
  password: string
}

