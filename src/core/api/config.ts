export type ApiMode = "mock" | "real" | "auto"

const DEFAULT_TIMEOUT_MS = 8000

export interface ApiConfig {
  mode: ApiMode
  baseUrl: string
  timeoutMs: number
}

const DEFAULT_API_BASE_URL = "https://getdon-api.duckdns.org"

function parseApiMode(value: string | undefined): ApiMode {
  if (value === "real" || value === "auto" || value === "mock") {
    return value
  }
  return "real"
}

function parseTimeout(value: string | undefined): number {
  if (!value) return DEFAULT_TIMEOUT_MS
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS
  }
  return parsed
}

function parseBaseUrl(value: string | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed) return DEFAULT_API_BASE_URL
  return trimmed.replace(/\/+$/, "")
}

type EnvShape = Record<string, string | undefined>

export function createApiConfig(env: EnvShape = process.env): ApiConfig {
  const mode = parseApiMode(env.EXPO_PUBLIC_API_MODE)

  return {
    mode,
    baseUrl: parseBaseUrl(env.EXPO_PUBLIC_API_BASE_URL),
    timeoutMs: parseTimeout(env.EXPO_PUBLIC_API_TIMEOUT_MS),
  }
}

export const apiConfig = createApiConfig()

// 디버깅을 위한 환경 변수 로그 (개발 환경에서만 출력)
if (typeof __DEV__ !== "undefined" && __DEV__ && typeof window !== "undefined") {
  console.log("[api.config] Current API Mode:", apiConfig.mode)
  console.log("[api.config] Current API BaseURL:", apiConfig.baseUrl ?? "RELATIVE (Proxy mode)")
  console.log("[api.config] EXPO_PUBLIC_API_MODE:", process.env.EXPO_PUBLIC_API_MODE)
}

export function shouldUseRealApi(config: ApiConfig = apiConfig): boolean {
  if (config.mode === "mock") return false
  if (config.mode === "real") return true
  return Boolean(config.baseUrl)
}
