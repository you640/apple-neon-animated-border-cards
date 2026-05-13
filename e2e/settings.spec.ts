import { test, expect, type Page } from "@playwright/test"

async function seedKey(page: Page, apiKey = "a".repeat(40)) {
  await page.addInitScript(
    ([k]) => {
      window.localStorage.setItem(
        "chatcipiky.mistral.settings.v1",
        JSON.stringify({
          apiKey: k,
          model: "mistral-large-latest",
          systemPrompt: "",
          temperature: 0.7,
        }),
      )
    },
    [apiKey],
  )
}

test.describe("ChatCipiky PRO — settings persistence", () => {
  test("model change persists across reloads", async ({ page }) => {
    await seedKey(page)
    await page.goto("/")

    // Open tools via header brand
    await page.getByRole("button", { name: /otvoriť nastavenia/i }).click()

    await expect(page.getByRole("dialog")).toBeVisible()
    // Select Codestral
    await page.getByText(/^Codestral$/i).click()
    await page.getByRole("button", { name: /uložiť/i }).click()

    // Header subtitle reflects the new model
    await expect(page.getByText(/codestral/i)).toBeVisible({ timeout: 5_000 })

    // Reload — should still be Codestral
    await page.reload()
    await expect(page.getByText(/codestral/i)).toBeVisible()
  })

  test("Vymazať API kľúč clears state and returns to onboarding", async ({
    page,
  }) => {
    await seedKey(page)
    await page.goto("/")

    await page.getByRole("button", { name: /otvoriť nastavenia/i }).click()
    await page.getByText(/vymazať uložený api/i).click()

    // After clearing, key is gone — close sheet and we should see onboarding
    await page.getByLabel(/zavrieť/i).click()
    await expect(
      page.getByRole("heading", { name: /pripojme mistral ai/i }),
    ).toBeVisible()
  })

  test("toggle key visibility works", async ({ page }) => {
    await seedKey(page, "supersecret-abcdefghij")
    await page.goto("/")
    await page.getByRole("button", { name: /otvoriť nastavenia/i }).click()

    const input = page.getByPlaceholder(/vložte sem svoj mistral/i)
    await expect(input).toHaveAttribute("type", "password")
    await page.getByLabel(/zobraziť kľúč/i).click()
    await expect(input).toHaveAttribute("type", "text")
    await expect(input).toHaveValue("supersecret-abcdefghij")
  })

  test("ESC closes the Tools dialog", async ({ page }) => {
    await seedKey(page)
    await page.goto("/")
    await page.getByRole("button", { name: /otvoriť nastavenia/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })
})
