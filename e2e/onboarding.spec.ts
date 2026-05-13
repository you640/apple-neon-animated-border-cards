import { test, expect } from "@playwright/test"

test.describe("ChatCipiky PRO — onboarding", () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage between runs
    await context.clearCookies()
  })

  test("shows the connect-AI welcome state on first visit", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: /pripojme mistral ai/i }))
      .toBeVisible()
    await expect(
      page.getByRole("button", { name: /zadať api kľúč/i }),
    ).toBeVisible()
  })

  test("auto-opens Tools sheet on first visit", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /^nástroje$/i }),
    ).toBeVisible()
  })

  test("save button is disabled until key is 20+ chars", async ({ page }) => {
    await page.goto("/")
    const input = page.getByPlaceholder(/vložte sem svoj mistral/i)
    const save = page.getByRole("button", { name: /uložiť/i })

    await expect(save).toBeDisabled()
    await input.fill("short-key")
    await expect(save).toBeDisabled()
    await input.fill("a".repeat(25))
    await expect(save).toBeEnabled()
  })

  test("can save a valid key and proceed to chat ready state", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByPlaceholder(/vložte sem svoj mistral/i).fill("a".repeat(30))
    await page.getByRole("button", { name: /uložiť/i }).click()

    // Should close and reveal the ready welcome
    await expect(
      page.getByRole("heading", { name: /rád ťa vidím/i }),
    ).toBeVisible()
    // Suggestions visible
    await expect(page.getByText(/napíš mi krátku báseň/i)).toBeVisible()
    // Composer placeholder
    await expect(
      page.getByPlaceholder(/opýtaj sa čokoľvek/i),
    ).toBeVisible()
  })

  test("API key link points to console.mistral.ai", async ({ page }) => {
    await page.goto("/")
    const link = page.getByRole("link", { name: /získať api kľúč/i })
    await expect(link).toHaveAttribute("href", /console\.mistral\.ai/)
    await expect(link).toHaveAttribute("target", "_blank")
  })
})
