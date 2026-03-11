export interface ApiErrorMeta {
  status?: number
  code?: string
  details?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, meta: ApiErrorMeta = {}) {
    super(message)
    this.name = "ApiError"
    this.status = meta.status
    this.code = meta.code
    this.details = meta.details
    if (meta.cause !== undefined) {
      this.cause = meta.cause
    }
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}
