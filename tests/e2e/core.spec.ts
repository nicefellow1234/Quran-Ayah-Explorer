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

test("theme switcher defaults to System and persists an explicit theme", async ({ page }) => {
  await page.goto("/");
  const root = page.locator("html");

  await expect(root).toHaveAttribute("data-theme-preference", "system");
  await page.getByRole("button", { name: "Color theme: System" }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(root).toHaveAttribute("data-theme-preference", "dark");
  await expect(page.getByRole("button", { name: "Color theme: Dark" })).toBeVisible();

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(root).toHaveAttribute("data-theme-preference", "dark");

  await page.getByRole("button", { name: "Color theme: Dark" }).click();
  await page.getByRole("menuitemradio", { name: "System" }).click();
  await expect(root).toHaveAttribute("data-theme-preference", "system");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveAttribute("data-theme", "dark");
});

test("header Quran navigator opens with the keyboard and routes references", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+K");
  await expect(page.getByRole("dialog", { name: "Go anywhere in the Quran" })).toBeVisible();
  await page.getByRole("textbox", { name: "Jump to a Surah or ayah" }).fill("2:10");
  await page.getByRole("button", { name: "Open Quran reference" }).click();
  await expect(page).toHaveURL(/\/ayah\/2:10$/);
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
  await expect(page.locator(".reading-mode-header")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Arabic", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Translation", exact: true })).toBeVisible();
  await expect(page.locator(".arabic-text").first()).toBeVisible();
  await expect(page.locator(".translations-list")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Open tafsir/ })).toHaveCount(0);

  await page.getByRole("tab", { name: "Translation", exact: true }).click();
  await expect(page).toHaveURL(/view=translation/);
  await expect(page.locator(".arabic-text")).toHaveCount(0);
  await expect(page.locator(".translations-list").first()).toBeVisible();
});
