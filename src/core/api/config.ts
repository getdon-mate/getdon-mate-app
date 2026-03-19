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
  let mode = parseApiMode(env.EXPO_PUBLIC_API_MODE)

  // Failsafe: 배포된 환경(Vercel 등)에서 환경 변수가 누락된 경우 Real로 간주
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
    if (!env.EXPO_PUBLIC_API_MODE) {
      mode = "real"
    }
  }

  return {
    mode,
    baseUrl: parseBaseUrl(env.EXPO_PUBLIC_API_BASE_URL),
    timeoutMs: parseTimeout(env.EXPO_PUBLIC_API_TIMEOUT_MS),
  }
}

export const apiConfig = createApiConfig()

// 디버깅을 위한 환경 변수 로그 (배포 환경에서 확인용)
if (typeof window !== "undefined") {
  console.log("[api.config] Current API Mode:", apiConfig.mode)
  console.log("[api.config] Current API BaseURL:", apiConfig.baseUrl ?? "RELATIVE (Proxy mode)")
  console.log("[api.config] EXPO_PUBLIC_API_MODE:", process.env.EXPO_PUBLIC_API_MODE)
}

export function shouldUseRealApi(config: ApiConfig = apiConfig): boolean {
  if (config.mode === "mock") return false
  if (config.mode === "real") return true
  return Boolean(config.baseUrl)
}
