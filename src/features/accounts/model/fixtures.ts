import type { AppUser, BoardPost, DuesRecord, GroupAccount, Member, ReminderItem, Transaction } from "./types"

export const defaultUsers: AppUser[] = [
  {
    id: "u1",
    name: "김지현",
    email: "test@test.com",
    password: "password",
  },
]

const studyMembers: Member[] = [
  { id: "m1", userId: "u1", name: "김지현", role: "총무", initials: "지현", phone: "010-1234-5678", joinDate: "2025-06-01", color: memberAccentPalette[0] },
  { id: "m2", name: "이승우", role: "멤버", initials: "승우", phone: "010-2345-6789", joinDate: "2025-06-01", color: memberAccentPalette[1] },
  { id: "m3", name: "박소연", role: "멤버", initials: "소연", phone: "010-3456-7890", joinDate: "2025-06-15", color: memberAccentPalette[2] },
  { id: "m4", name: "정민호", role: "멤버", initials: "민호", phone: "010-4567-8901", joinDate: "2025-07-01", color: memberAccentPalette[3] },
]

const hikingMembers: Member[] = [
  { id: "h1", userId: "u1", name: "김지현", role: "총무", initials: "지현", phone: "010-1234-5678", joinDate: "2025-03-01", color: memberAccentPalette[0] },
  { id: "h2", name: "오정석", role: "멤버", initials: "정석", phone: "010-1111-2222", joinDate: "2025-03-01", color: memberAccentPalette[1] },
  { id: "h3", name: "서영희", role: "멤버", initials: "영희", phone: "010-3333-4444", joinDate: "2025-04-01", color: memberAccentPalette[2] },
]

const studyDuesRecords: DuesRecord[] = [
  { memberId: "m1", month: "2026-03", status: "paid", paidDate: "2026-03-02", amount: 50000 },
  { memberId: "m2", month: "2026-03", status: "paid", paidDate: "2026-03-01", amount: 50000 },
  { memberId: "m3", month: "2026-03", status: "unpaid", amount: 50000 },
  { memberId: "m4", month: "2026-03", status: "unpaid", amount: 50000 },
  { memberId: "m1", month: "2026-02", status: "paid", paidDate: "2026-02-01", amount: 50000 },
  { memberId: "m2", month: "2026-02", status: "paid", paidDate: "2026-02-02", amount: 50000 },
  { memberId: "m3", month: "2026-02", status: "paid", paidDate: "2026-02-05", amount: 50000 },
  { memberId: "m4", month: "2026-02", status: "paid", paidDate: "2026-02-03", amount: 50000 },
]

const hikingDuesRecords: DuesRecord[] = [
  { memberId: "h1", month: "2026-03", status: "paid", paidDate: "2026-03-01", amount: 30000 },
  { memberId: "h2", month: "2026-03", status: "paid", paidDate: "2026-03-02", amount: 30000 },
  { memberId: "h3", month: "2026-03", status: "unpaid", amount: 30000 },
  { memberId: "h1", month: "2026-02", status: "paid", paidDate: "2026-02-01", amount: 30000 },
  { memberId: "h2", month: "2026-02", status: "paid", paidDate: "2026-02-02", amount: 30000 },
  { memberId: "h3", month: "2026-02", status: "paid", paidDate: "2026-02-03", amount: 30000 },
]

const studyTransactions: Transaction[] = [
  { id: "t1", type: "income", amount: 50000, description: "3월 회비", date: "2026-03-04", category: "회비", memberId: "m1" },
  { id: "t2", type: "income", amount: 50000, description: "3월 회비", date: "2026-03-03", category: "회비", memberId: "m2" },
  { id: "t3", type: "expense", amount: 35000, description: "스터디 카페 대관", date: "2026-03-03", category: "장소" },
  { id: "t4", type: "expense", amount: 12500, description: "간식 구매", date: "2026-03-02", category: "간식" },
  { id: "t5", type: "income", amount: 50000, description: "2월 회비", date: "2026-02-22", category: "회비", memberId: "m3" },
  { id: "t6", type: "expense", amount: 18000, description: "2월 자료 출력", date: "2026-02-21", category: "운영" },
]

const hikingTransactions: Transaction[] = [
  { id: "ht1", type: "income", amount: 30000, description: "3월 회비", date: "2026-03-03", category: "회비", memberId: "h1" },
  { id: "ht2", type: "expense", amount: 45000, description: "등산 장비 구매", date: "2026-03-02", category: "장비" },
  { id: "ht3", type: "expense", amount: 85000, description: "점심 식사", date: "2026-02-22", category: "식비" },
]

const studyReminders: ReminderItem[] = [
  {
    id: "rem1",
    memberId: "m3",
    month: "2026-03",
    type: "payment-reminder",
    message: "3월 회비 납부 안내를 보냈습니다.",
    createdAt: "2026-03-07T09:00:00.000Z",
  },
]

const hikingReminders: ReminderItem[] = []

const studyBoardPosts: BoardPost[] = [
  {
    id: "post1",
    title: "이번 주 스터디 장소 안내",
    body: "이번 주는 2층 회의실에서 진행합니다. 10분 전에 도착해주세요.",
    pinned: true,
    createdAt: "2026-03-04T09:00:00.000Z",
    authorName: "김지현",
    comments: [
      {
        id: "comment1",
        authorName: "이승우",
        body: "확인했습니다.",
        createdAt: "2026-03-04T09:15:00.000Z",
      },
    ],
  },
  {
    id: "post2",
    title: "간식 정산 공유",
    body: "이번 주 간식비는 거래 탭에 반영했습니다.",
    pinned: false,
    createdAt: "2026-03-03T12:00:00.000Z",
    authorName: "김지현",
    comments: [],
  },
]

const hikingBoardPosts: BoardPost[] = [
  {
    id: "hpost1",
    title: "다음 산행 공지",
    body: "토요일 오전 8시에 입구에서 모입니다.",
    pinned: true,
    createdAt: "2026-03-02T07:30:00.000Z",
    authorName: "김지현",
    comments: [],
  },
]

export const defaultAccounts: GroupAccount[] = [
  {
    id: "acc1",
    groupName: "개발자 스터디 모임",
    bankName: "토스뱅크",
    accountNumber: "1234-5678-9012",
    balance: 1850000,
    monthlyDuesAmount: 50000,
    dueDay: 10,
    members: studyMembers,
    duesRecords: studyDuesRecords,
    transactions: studyTransactions,
    autoTransfer: { enabled: false, dayOfMonth: 10, amount: 50000, fromAccount: "" },
    oneTimeDues: [],
    reminders: studyReminders,
    boardPosts: studyBoardPosts,
  },
  {
    id: "acc2",
    groupName: "주말 산악회",
    bankName: "카카오뱅크",
    accountNumber: "3333-01-1234567",
    balance: 520000,
    monthlyDuesAmount: 30000,
    dueDay: 5,
    members: hikingMembers,
    duesRecords: hikingDuesRecords,
    transactions: hikingTransactions,
    autoTransfer: { enabled: true, dayOfMonth: 5, amount: 30000, fromAccount: "국민 123-456-789" },
    oneTimeDues: [],
    reminders: hikingReminders,
    boardPosts: hikingBoardPosts,
  },
]

export const availableMonths = ["2026-03", "2026-02"]
import { memberAccentPalette } from "@shared/ui/palette"
