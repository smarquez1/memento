import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    colorScheme: "dark",
    locale: "en-US",
    timezoneId: "UTC",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "android",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "ios",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command: "pnpm --filter @memento/web build && pnpm --filter @memento/web preview --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
