const NOTIFICATION_PREFERENCES_KEY = "getdon:notification-preferences"
const AMOUNT_MASK_KEY = "getdon:mask-amounts"

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

export function readAmountMaskPreference(): boolean {
  if (!canUseStorage()) return false

  try {
    return globalThis.localStorage.getItem(AMOUNT_MASK_KEY) === "1"
  } catch {
    return false
  }
}

export function writeAmountMaskPreference(masked: boolean) {
  if (!canUseStorage()) return

  try {
    globalThis.localStorage.setItem(AMOUNT_MASK_KEY, masked ? "1" : "0")
  } catch {}
}
