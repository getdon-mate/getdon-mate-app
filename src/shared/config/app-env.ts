function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue
  if (value === "1" || value.toLowerCase() === "true") return true
  if (value === "0" || value.toLowerCase() === "false") return false
  return defaultValue
}

function parseNumber(value: string | undefined, defaultValue: number) {
  if (value === undefined) return defaultValue
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

const devMode = typeof __DEV__ !== "undefined" ? __DEV__ : false

export const appEnv = {
  showDemoControls: parseBoolean(process.env.EXPO_PUBLIC_ENABLE_DEMO_CONTROLS, devMode),
  showTestCredentials: parseBoolean(process.env.EXPO_PUBLIC_SHOW_TEST_CREDENTIALS, devMode),
  enableObservability: parseBoolean(process.env.EXPO_PUBLIC_ENABLE_OBSERVABILITY, true),
  uiDemoDelayMs: parseNumber(process.env.EXPO_PUBLIC_UI_DEMO_DELAY_MS, devMode ? 350 : 0),
} as const
