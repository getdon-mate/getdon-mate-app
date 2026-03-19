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

  // TODO: [Cleanup] Vercel 빌드 시 환경 변수 주입이 완벽하게 확인되면 아래 Failsafe 로직은 제거해도 됩니다.
  // 현재는 빌드시 EXPO_PUBLIC_API_MODE가 누락되는 이슈를 방지하기 위해 배포 환경(non-localhost)에서 기본값을 real로 강제합니다.
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
