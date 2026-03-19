import { ApiError } from "./errors"

export interface ApiFailureInfo {
  code?: string
  status?: number
  message?: string
}

/** HTTP 상태 코드별 사용자용 메시지 (200, 201만 정상 처리, 그 외는 예외 처리) */
const STATUS_MESSAGES: Record<number, string> = {
  400: "잘못된 요청입니다. 입력 내용(이메일 형식, 비밀번호 등)을 확인해주세요.",
  401: "인증이 필요합니다. 로그인 정보를 확인해주세요.",
  403: "접근 권한이 없습니다. 다시 로그인하거나 관리자에게 문의해주세요.",
  404: "요청한 리소스를 찾을 수 없습니다. 주소를 확인하거나 잠시 후 다시 시도해주세요.",
  409: "이미 사용 중인 이메일이거나 충돌이 발생했습니다. 다른 정보로 시도해주세요.",
}

const STATUS_RANGE_MESSAGES: { min: number; max: number; message: string }[] = [
  { min: 500, max: 599, message: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
]

export function mapApiFailureToUserMessage(failure: ApiFailureInfo | null | undefined): string {
  if (!failure) {
    return "실서버 연결에 실패해 데모 데이터를 유지합니다. 잠시 후 다시 시도해주세요."
  }

  if (failure.code === "API_BASE_URL_MISSING") {
    return "API 주소가 설정되지 않아 데모 데이터로 동작합니다. 환경변수를 확인해주세요."
  }

  if (failure.code === "API_TIMEOUT") {
    return "서버 응답이 지연되고 있습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요."
  }

  if (failure.code === "API_NETWORK_ERROR") {
    return "네트워크 연결이 불안정합니다. 연결 상태를 확인한 뒤 다시 시도해주세요."
  }

  if (failure.status === 400) {
    return failure.message?.trim() || "입력 값을 확인해주세요."
  }

  if (failure.status === 401) {
    return "로그인이 만료되었습니다. 다시 로그인해주세요."
  }

  if (failure.status === 403) {
    return "이 작업을 수행할 권한이 없습니다."
  }

  if (failure.status === 404) {
    return "요청한 데이터를 찾을 수 없습니다. 목록에서 다시 선택해 주세요."
  }

  if (failure.status === 409) {
    return failure.message?.trim() || "이미 존재하는 데이터입니다."
  }

  if (failure.status && failure.status >= 500) {
    return "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
  }
  const status = failure.status
  if (status != null) {
    const exact = STATUS_MESSAGES[status]
    if (exact) return exact
    const range = STATUS_RANGE_MESSAGES.find((r) => status >= r.min && status <= r.max)
    if (range) return range.message
  }

  return failure.message?.trim() || "요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요."
}

/**
 * unknown 에러를 사용자 친화적 메시지로 변환.
 * ApiError는 HTTP 상태/코드로 매핑, 일반 Error는 message 사용.
 */
export function getErrorMessage(err: unknown, fallback = "오류가 발생했습니다. 잠시 후 다시 시도해주세요."): string {
  if (err instanceof ApiError) {
    return mapApiFailureToUserMessage({ code: err.code, status: err.status, message: err.message })
  }
  if (err instanceof Error && err.message) {
    return err.message
  }
  return fallback
}
