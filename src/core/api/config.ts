export type ApiMode = "mock" | "real" | "auto"

const DEFAULT_TIMEOUT_MS = 8000

export interface ApiConfig {
  mode: ApiMode
  baseUrl: string | null
  timeoutMs: number
}

function parseApiMode(value: string | undefined): ApiMode {
  if (value === "real" || value === "auto" || value === "mock") {
    return value
  }
  return "mock"
}

function parseTimeout(value: string | undefined): number {
  if (!value) return DEFAULT_TIMEOUT_MS
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS
  }
  return parsed
}

function parseBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return trimmed.replace(/\/+$/, "")
}

type EnvShape = Record<string, string | undefined>

export function createApiConfig(env: EnvShape = process.env): ApiConfig {
  return {
    mode: parseApiMode(env.EXPO_PUBLIC_API_MODE),
    baseUrl: parseBaseUrl(env.EXPO_PUBLIC_API_BASE_URL),
    timeoutMs: parseTimeout(env.EXPO_PUBLIC_API_TIMEOUT_MS),
  }
}

export const apiConfig = createApiConfig()

export function shouldUseRealApi(config: ApiConfig = apiConfig): boolean {
  if (config.mode === "mock") return false
  if (config.mode === "real") return true
  return Boolean(config.baseUrl)
}
