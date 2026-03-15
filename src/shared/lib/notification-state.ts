import type { NotificationPreferences } from "./preferences-storage"

export type NotificationItem = {
  id: string
  title: string
  body: string
  time: string
  unread: boolean
}

export type NotificationCategory = "reminder" | "notice" | "activity"

export const defaultNotificationPreferences: NotificationPreferences = {
  duesReminder: true,
  transactionAlert: true,
  noticeAlert: true,
}

export const initialNotifications: NotificationItem[] = [
  {
    id: "notice-1",
    title: "회비 마감이 다가오고 있어요",
    body: "이번 달 회비 납부 마감이 3일 남았습니다.",
    time: "방금 전",
    unread: true,
  },
  {
    id: "notice-2",
    title: "생활비 통장에 입금이 반영됐어요",
    body: "김토스님이 50,000원을 채웠습니다.",
    time: "10분 전",
    unread: true,
  },
  {
    id: "notice-3",
    title: "모임 공지가 등록됐어요",
    body: "이번 주 정산 안내를 확인해보세요.",
    time: "어제",
    unread: false,
  },
]

export function getNotificationCategory(item: NotificationItem): NotificationCategory {
  const text = `${item.title} ${item.body}`

  if (text.includes("공지")) return "notice"
  if (text.includes("안내") || text.includes("송금 요청") || text.includes("회비")) return "reminder"
  return "activity"
}
