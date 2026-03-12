const SESSION_STORAGE_KEY = "getdon:session"

interface PersistedSession {
  userId: string | null
  selectedAccountId: string | null
}

function canUseStorage() {
  return typeof globalThis !== "undefined" && "localStorage" in globalThis
}

export function readPersistedSession(): PersistedSession | null {
  if (!canUseStorage()) return null

  try {
    const raw = globalThis.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedSession
    return {
      userId: typeof parsed.userId === "string" ? parsed.userId : null,
      selectedAccountId: typeof parsed.selectedAccountId === "string" ? parsed.selectedAccountId : null,
    }
  } catch {
    return null
  }
}

export function writePersistedSession(session: PersistedSession) {
  if (!canUseStorage()) return

  try {
    globalThis.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {}
}

export function clearPersistedSession() {
  if (!canUseStorage()) return

  try {
    globalThis.localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {}
}
