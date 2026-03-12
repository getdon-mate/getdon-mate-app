import { apiConfig, type ApiConfig } from "./config"
import { ApiError } from "./errors"
import { logger } from "@shared/lib/logger"

interface ApiEnvelope<T> {
  data: T
}

type QueryValue = string | number | boolean | null | undefined

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  query?: Record<string, QueryValue>
  timeoutMs?: number
}

function buildUrl(baseUrl: string, path: string, query: Record<string, QueryValue> = {}): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`${baseUrl}${normalizedPath}`)

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

function hasEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  if (!payload || typeof payload !== "object") return false
  return Object.prototype.hasOwnProperty.call(payload, "data")
}

function readMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback
  const candidate = (payload as { message?: unknown }).message
  return typeof candidate === "string" && candidate.trim() ? candidate : fallback
}

function readCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined
  const candidate = (payload as { code?: unknown }).code
  return typeof candidate === "string" && candidate.trim() ? candidate : undefined
}

async function parsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return response.json()
  }

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export class ApiClient {
  constructor(private readonly config: ApiConfig = apiConfig) {}

  get mode() {
    return this.config.mode
  }

  get hasBaseUrl() {
    return Boolean(this.config.baseUrl)
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    if (!this.config.baseUrl) {
      throw new ApiError("API base URL is not configured.", { code: "API_BASE_URL_MISSING" })
    }

    const controller = new AbortController()
    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs
    const method = options.method ?? "GET"
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const { body, query, headers, timeoutMs: _timeoutMs, ...rest } = options
      const url = buildUrl(this.config.baseUrl, path, query)
      const requestHeaders = new Headers(headers)

      let requestBody: BodyInit | undefined
      if (body !== undefined) {
        if (!requestHeaders.has("Content-Type")) {
          requestHeaders.set("Content-Type", "application/json")
        }
        requestBody = JSON.stringify(body)
      }

      const response = await fetch(url, {
        ...rest,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      })

      const payload = await parsePayload(response)
      if (!response.ok) {
        logger.warn({
          scope: "api.http-client",
          message: `HTTP ${response.status} ${method} ${path}`,
          details: payload,
        })
        throw new ApiError(readMessage(payload, `Request failed with ${response.status}`), {
          status: response.status,
          code: readCode(payload),
          details: payload,
        })
      }

      if (hasEnvelope<T>(payload)) {
        return payload.data
      }

      return payload as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        logger.warn({
          scope: "api.http-client",
          message: `Request timeout ${method} ${path}`,
        })
        throw new ApiError(`Request timeout (${timeoutMs}ms)`, { code: "API_TIMEOUT", cause: error })
      }
      logger.error({
        scope: "api.http-client",
        message: `Network request failed ${method} ${path}`,
        details: error,
      })
      throw new ApiError("Network request failed.", { code: "API_NETWORK_ERROR", cause: error })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  get<T>(path: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "GET" })
  }

  post<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "POST", body })
  }

  put<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "PUT", body })
  }

  patch<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "PATCH", body })
  }

  delete<T>(path: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
