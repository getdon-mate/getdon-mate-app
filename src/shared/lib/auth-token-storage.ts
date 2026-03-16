const TOKEN_STORAGE_KEY = "getdon:auth-tokens"

export interface PersistedAuthTokens {
  accessToken: string
  refreshToken: string
}

function canUseStorage() {
  return typeof globalThis !== "undefined" && "localStorage" in globalThis
}

export function readPersistedAuthTokens(): PersistedAuthTokens | null {
  if (!canUseStorage()) return null

  try {
    const raw = globalThis.localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedAuthTokens
    if (!parsed.accessToken || !parsed.refreshToken) return null

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    }
  } catch {
    return null
  }
}

export function writePersistedAuthTokens(tokens: PersistedAuthTokens) {
  if (!canUseStorage()) return

  try {
    globalThis.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  } catch {}
}

export function clearPersistedAuthTokens() {
  if (!canUseStorage()) return

  try {
    globalThis.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {}
}
