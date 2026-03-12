import type { AppUser, GroupAccount, Member, Transaction } from "../model/types"
import type {
  ApiAuthResponse,
  ApiBootstrapResponse,
  ApiGroupAccount,
  ApiMember,
  ApiTransaction,
  ApiUser,
} from "./dto"

export function toDomainUser(user: ApiUser): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
  }
}

function toDomainMember(member: ApiMember): Member {
  return {
    id: member.id,
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
