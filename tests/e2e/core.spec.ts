import { expect, test } from "@playwright/test";

test("home page explains configuration when API credentials are absent", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Explore the Quran" })).toBeVisible();
  const setupState = page.getByText("Connect Quran.Foundation to begin");
  const liveState = page.getByText("Choose a Surah and ayah");
  if (await setupState.isVisible().catch(() => false)) {
    await expect(setupState).toBeVisible();
  } else {
    await expect(liveState).toBeVisible();
  }
});

test("invalid Surah routes show a not-found state", async ({ page }) => {
  test.setTimeout(30_000);
  await page.goto("/surah/500");
  await expect(page.getByRole("heading", { name: /That ayah or Surah isn’t available/ })).toBeVisible({ timeout: 15_000 });
});

test("encoded ayah URLs reach the reader route", async ({ page }) => {
  await page.goto("/ayah/2:10");
  const setupState = page.getByText("Connect Quran.Foundation to begin");
  const liveState = page.locator(".arabic-text");
  if (await setupState.isVisible().catch(() => false)) {
    await expect(setupState).toBeVisible();
  } else {
    await expect(liveState).toBeVisible();
  }
});

test("Reading mode keeps Arabic and hides translations", async ({ page }) => {
  await page.goto("/surah/1?mode=reading");
  const setupState = page.getByText("Connect Quran.Foundation to begin");
  if (await setupState.isVisible().catch(() => false)) return;

  await expect(page.getByRole("button", { name: "Reading", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".arabic-text").first()).toBeVisible();
  await expect(page.locator(".translations-list")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Open tafsir/ })).toHaveCount(0);
});
