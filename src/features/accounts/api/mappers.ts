import { memberAccentPalette } from "@shared/ui/palette"
import type { AppUser, GroupAccount, Member, Transaction } from "../model/types"
import type {
  ApiAuthResponse,
  ApiBootstrapResponse,
  ApiGroupAccount,
  ApiMember,
  ApiTransaction,
  ApiUser,
} from "./dto"
import type { SwaggerMeetingSummary } from "./swagger-api"

export function toDomainUser(user: ApiUser): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

function toDomainMember(member: ApiMember): Member {
  return {
    id: member.id,
    userId: member.userId,
    name: member.name,
    role: member.role,
    initials: member.initials,
    phone: member.phone,
    joinDate: member.joinDate,
    color: member.color,
  }
}

export function toDomainTransaction(transaction: ApiTransaction): Transaction {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    category: transaction.category,
    memberId: transaction.memberId,
  }
}

export function toDomainAccount(account: ApiGroupAccount): GroupAccount {
  return {
    id: account.id,
    groupName: account.groupName,
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    balance: account.balance,
    monthlyDuesAmount: account.monthlyDuesAmount,
    dueDay: account.dueDay,
    members: account.members.map(toDomainMember),
    duesRecords: account.duesRecords.map((record) => ({ ...record })),
    transactions: account.transactions.map(toDomainTransaction),
    autoTransfer: { ...account.autoTransfer },
    oneTimeDues: account.oneTimeDues.map((dues) => ({
      ...dues,
      status: dues.status ?? "active",
      records: dues.records.map((record) => ({ ...record })),
    })),
    reminders: [],
    boardPosts: [],
  }
}

export function toDomainAuthResponse(response: ApiAuthResponse) {
  return {
    user: toDomainUser(response.user),
    accounts: response.accounts?.map(toDomainAccount),
  }
}

export function toDomainBootstrapResponse(response: ApiBootstrapResponse) {
  return {
    users: response.users.map(toDomainUser),
    accounts: response.accounts.map(toDomainAccount),
  }
}

function deriveInitials(name: string) {
  return name.trim().slice(-2) || "??"
}

export function createRemoteUser(email: string, name?: string): AppUser {
  const derivedName = name?.trim() || email.split("@")[0] || "사용자"
  return {
    id: `remote:${email}`,
    name: derivedName,
    email,
  }
}

export function toGroupAccountSummary(meeting: SwaggerMeetingSummary, currentUser: AppUser | null): GroupAccount {
  return {
    id: String(meeting.meetingId),
    groupName: meeting.title,
    bankName: meeting.bankName,
    accountNumber: "",
    balance: meeting.amount,
    monthlyDuesAmount: 0,
    dueDay: 25,
    members: currentUser
      ? [
          {
            id: `leader-${meeting.meetingId}`,
            userId: currentUser.id,
            name: currentUser.name,
            role: "총무",
            initials: deriveInitials(currentUser.name),
            phone: "",
            joinDate: new Date().toISOString().split("T")[0],
            color: memberAccentPalette[0],
          },
        ]
      : [],
    duesRecords: [],
    transactions: [],
    autoTransfer: {
      enabled: false,
      dayOfMonth: 25,
      amount: 0,
      fromAccount: "",
    },
    oneTimeDues: [],
    reminders: [],
    boardPosts: [],
  }
}
