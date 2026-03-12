import { appEnv } from "@shared/config/app-env"

export type LogLevel = "info" | "warn" | "error"

export interface LogEvent {
  scope: string
  message: string
  level?: LogLevel
  details?: unknown
}

function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
      .replace(/\b\d{2,4}-\d{3,4}-\d{4}\b/g, "[redacted-phone]")
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        if (/password|token|secret|authorization/i.test(key)) {
          return [key, "[redacted]"]
        }
        return [key, sanitize(entry)]
      })
    )
  }

  return value
}

function write(level: LogLevel, event: LogEvent) {
  if (!appEnv.enableObservability) return

  const payload = {
    scope: event.scope,
    message: event.message,
    details: sanitize(event.details),
  }

  if (level === "error") {
    console.error("[app]", payload)
    return
  }
  if (level === "warn") {
    console.warn("[app]", payload)
    return
  }
  console.info("[app]", payload)
}

export const logger = {
  info(event: LogEvent) {
    write("info", { ...event, level: "info" })
  },
  warn(event: LogEvent) {
    write("warn", { ...event, level: "warn" })
  },
  error(event: LogEvent) {
    write("error", { ...event, level: "error" })
  },
}
