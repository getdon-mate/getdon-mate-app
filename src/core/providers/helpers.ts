import type {
  AppUser,
  BoardComment,
  BoardPost,
  GroupAccount,
  Member,
  MemberRole,
  OneTimeDues,
  ReminderItem,
  ReminderType,
  Transaction,
  TransactionType,
} from "@features/accounts/model/types"
import { memberAccentPalette } from "@shared/ui/palette"
import type { NotificationItem } from "@shared/lib/notification-state"

export interface CreateAccountInput {
  groupName: string
  bankName: string
  accountNumber: string
  monthlyDuesAmount: number
  dueDay: number
}

export interface UpsertMemberInput {
  name: string
  phone: string
  role: MemberRole
}

export interface UpsertTransactionInput {
  type: TransactionType
  amount: number
  description: string
  date: string
  category: string
}

export interface CreateBoardPostInput {
  title: string
  body: string
  pinned: boolean
}

export interface CreateBoardCommentInput {
  body: string
}

export function cloneUsers(source: AppUser[]): AppUser[] {
  return source.map((user) => ({ ...user }))
}

export function cloneAccounts(source: GroupAccount[]): GroupAccount[] {
  return source.map((account) => ({
    ...account,
    members: normalizeMemberRoles(account.members.map((member) => ({ ...member }))),
    duesRecords: account.duesRecords.map((record) => ({ ...record })),
    transactions: account.transactions.map((tx) => ({ ...tx })),
    autoTransfer: { ...account.autoTransfer },
    oneTimeDues: account.oneTimeDues.map((dues) => ({
      ...dues,
      status: dues.status ?? "active",
      records: dues.records.map((record) => ({ ...record })),
    })),
    reminders: account.reminders.map((item) => ({ ...item })),
    boardPosts: account.boardPosts.map((post) => ({
      ...post,
      likedByUserIds: [...(post.likedByUserIds ?? [])],
      comments: post.comments.map((comment) => ({ ...comment })),
    })),
  }))
}

export function createLocalAccount(data: CreateAccountInput, currentUser: AppUser): GroupAccount {
  const timestamp = Date.now()
  return {
    id: `acc${timestamp}`,
    groupName: data.groupName,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    balance: 0,
    monthlyDuesAmount: data.monthlyDuesAmount,
    dueDay: data.dueDay,
    members: [
      {
        id: `mem${timestamp}`,
        userId: currentUser.id,
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
    reminders: [],
    boardPosts: [],
  }
}

export function buildMemberInitials(name: string) {
  return name.trim().slice(-2) || "멤버"
}

export function pickMemberColor(index: number) {
  return memberAccentPalette[index % memberAccentPalette.length]
}

export function createLocalMember(data: UpsertMemberInput, memberCount: number): Member {
  return {
    id: `mem${Date.now()}`,
    name: data.name,
    role: data.role,
    initials: buildMemberInitials(data.name),
    phone: data.phone,
    joinDate: new Date().toISOString().split("T")[0],
    color: pickMemberColor(memberCount),
  }
}

export function normalizeMemberRoles(members: Member[], preferredManagerId?: string): Member[] {
  if (members.length === 0) return members
  const chosenManagerId =
    (preferredManagerId && members.some((member) => member.id === preferredManagerId) && preferredManagerId) ||
    members.find((member) => member.role === "총무")?.id ||
    members[0]?.id
  return members.map((member) => ({
    ...member,
    role: member.id === chosenManagerId ? "총무" : "멤버",
  }))
}

export function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.id.localeCompare(a.id)
  })
}

export function getTransactionImpact(transaction: Pick<Transaction, "type" | "amount">) {
  return transaction.type === "income" ? transaction.amount : -transaction.amount
}

export function createLocalTransaction(data: UpsertTransactionInput): Transaction {
  return {
    id: `tx${Date.now()}`,
    type: data.type,
    amount: data.amount,
    description: data.description,
    date: data.date,
    category: data.category,
  }
}

export function createReminder(memberId: string, month: string, type: ReminderType, memberName: string): ReminderItem {
  return {
    id: `rem${Date.now()}`,
    memberId,
    month,
    type,
    message:
      type === "payment-reminder"
        ? `${memberName}님께 ${month} 회비 납부 안내를 보냈습니다.`
        : `${memberName}님께 ${month} 회비 송금 요청을 보냈습니다.`,
    createdAt: new Date().toISOString(),
  }
}

export function createReminderNotification(memberName: string, month: string, type: ReminderType): NotificationItem {
  return {
    id: `notice-${Date.now()}`,
    title: type === "payment-reminder" ? "납부 안내를 보냈어요" : "송금 요청을 보냈어요",
    body:
      type === "payment-reminder"
        ? `${memberName}님에게 ${month} 회비 납부 안내를 전송했습니다.`
        : `${memberName}님에게 ${month} 회비 송금 요청을 전송했습니다.`,
    time: "방금 전",
    unread: true,
  }
}

export function buildBoardPost(data: CreateBoardPostInput, authorId: string, authorName: string): BoardPost {
  return {
    id: `post${Date.now()}`,
    title: data.title.trim(),
    body: data.body.trim(),
    pinned: data.pinned,
    createdAt: new Date().toISOString(),
    authorUserId: authorId,
    authorName,
    likedByUserIds: [],
    comments: [],
  }
}

export function buildBoardComment(data: CreateBoardCommentInput, authorId: string, authorName: string): BoardComment {
  return {
    id: `comment${Date.now()}`,
    authorUserId: authorId,
    authorName,
    body: data.body.trim(),
    createdAt: new Date().toISOString(),
  }
}

export function delay(ms: number) {
  if (ms <= 0) return Promise.resolve()
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}
