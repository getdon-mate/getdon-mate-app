export interface ApiFailureInfo {
  code?: string
  status?: number
  message?: string
}

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

  if (failure.status === 401 || failure.status === 403) {
    return "인증이 만료되었거나 권한이 없습니다. 다시 로그인한 뒤 재시도해주세요."
  }

  if (failure.status === 404) {
    return "요청한 데이터를 찾을 수 없습니다. 목록에서 다시 선택해 주세요."
  }

  if (failure.status && failure.status >= 500) {
    return "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
  }

  return failure.message?.trim() || "요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요."
}
