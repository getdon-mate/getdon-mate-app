function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue
  if (value === "1" || value.toLowerCase() === "true") return true
  if (value === "0" || value.toLowerCase() === "false") return false
  return defaultValue
}

const devMode = typeof __DEV__ !== "undefined" ? __DEV__ : false

export const appEnv = {
  showDemoControls: parseBoolean(process.env.EXPO_PUBLIC_ENABLE_DEMO_CONTROLS, devMode),
  showTestCredentials: parseBoolean(process.env.EXPO_PUBLIC_SHOW_TEST_CREDENTIALS, devMode),
  enableObservability: parseBoolean(process.env.EXPO_PUBLIC_ENABLE_OBSERVABILITY, true),
} as const
