const NOTIFICATION_PREFERENCES_KEY = "getdon:notification-preferences"

export interface NotificationPreferences {
  duesReminder: boolean
  transactionAlert: boolean
  noticeAlert: boolean
}

function canUseStorage() {
  return typeof globalThis !== "undefined" && "localStorage" in globalThis
}

export function readNotificationPreferences(): NotificationPreferences | null {
  if (!canUseStorage()) return null

  try {
    const raw = globalThis.localStorage.getItem(NOTIFICATION_PREFERENCES_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>
    return {
      duesReminder: Boolean(parsed.duesReminder),
      transactionAlert: Boolean(parsed.transactionAlert),
      noticeAlert: Boolean(parsed.noticeAlert),
    }
  } catch {
    return null
  }
}

export function writeNotificationPreferences(preferences: NotificationPreferences) {
  if (!canUseStorage()) return

  try {
    globalThis.localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences))
  } catch {}
}
