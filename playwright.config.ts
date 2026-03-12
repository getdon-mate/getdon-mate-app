import { defineConfig, devices } from "@playwright/test"

const port = process.env.PW_PORT ?? "19006"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `CI=1 EXPO_NO_TELEMETRY=1 pnpm exec expo start --web --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
})
