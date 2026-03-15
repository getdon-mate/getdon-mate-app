export type MemberRole = "총무" | "멤버"

export interface Member {
  id: string
  userId?: string
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
  status: "active" | "closed"
  records: OneTimeDuesRecord[]
}

export type ReminderType = "payment-reminder" | "transfer-request"

export interface ReminderItem {
  id: string
  memberId: string
  month: string
  type: ReminderType
  message: string
  createdAt: string
}

export interface BoardComment {
  id: string
  authorName: string
  body: string
  createdAt: string
}

export interface BoardPost {
  id: string
  title: string
  body: string
  pinned: boolean
  createdAt: string
  authorName: string
  comments: BoardComment[]
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
  reminders: ReminderItem[]
  boardPosts: BoardPost[]
}

export interface AppUser {
  id: string
  name: string
  email: string
  password: string
}
