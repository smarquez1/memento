import { expect, test } from "@playwright/test";
import { resetIndexedDB } from "./helpers/reset-db.js";

test("starts the app shell from the service worker without a network", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-30T12:00:00.000Z"));
  await page.goto("/");
  await resetIndexedDB(page);

  // Wait for the service worker to activate and precache the app shell.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  // Reload once online so this page is controlled by the service worker.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();

  // The page must be served by the service worker.
  const controlled = await page.evaluate(() => navigator.serviceWorker.controller !== null);
  expect(controlled).toBe(true);

  // The precache must contain the app shell and its assets.
  const precached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const cache = await caches.open(keys[0]);
    const urls = new Set<string>();
    const requests = await cache.keys();
    for (const request of requests) {
      urls.add(new URL(request.url).pathname);
    }
    return {
      hasShell: urls.has("/index.html"),
      hasBundle: [...urls].some((url) => url.startsWith("/assets/index-") && url.endsWith(".js")),
    };
  });
  expect(precached.hasShell).toBe(true);
  expect(precached.hasBundle).toBe(true);

  // Block every network request, then confirm the service worker still serves
  // the app shell from the precache. WebKit cannot navigate while offline, so
  // we exercise the service worker directly instead of reloading.
  await page.route("**/*", (route) => route.abort());
  const servedOffline = await page.evaluate(async () => {
    const response = await fetch("/", { cache: "no-store" });
    const html = await response.text();
    return html.includes("Memento");
  });
  expect(servedOffline).toBe(true);
});

test("exposes a valid installable manifest", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = (await response.json()) as {
    name: string;
    display: string;
    icons: { sizes: string; purpose?: string }[];
  };

  expect(manifest.name).toBe("Memento");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.some((icon) => icon.sizes === "192x192")).toBe(true);
  expect(manifest.icons.some((icon) => icon.sizes === "512x512")).toBe(true);
  expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(true);
});
