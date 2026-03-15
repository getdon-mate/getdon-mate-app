import { defineConfig, devices } from "@playwright/test"

const port = process.env.PW_PORT ?? "19006"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
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
    command: `sh -c "CI=1 EXPO_NO_TELEMETRY=1 pnpm run export:web >/tmp/getdon-mate-playwright-export.log && python3 -m http.server ${port} -d dist"`,
    url: `http://127.0.0.1:${port}`,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
})
