import { test, expect, type Page } from "@playwright/test"

/**
 * Seeds the API key into localStorage before page navigation.
 */
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

/**
 * Intercept /api/chat and respond with a valid AI SDK v6 UI message stream
 * (SSE-encoded) so the chat renders an assistant message without a real Mistral key.
 */
async function mockChatStream(page: Page, fullText: string) {
  await page.route("**/api/chat", async (route) => {
    const id = "asst-1"
    const lines: string[] = []

    // Start the assistant message
    lines.push(
      `data: ${JSON.stringify({ type: "start", messageId: id })}\n\n`,
    )
    lines.push(
      `data: ${JSON.stringify({
        type: "start-step",
      })}\n\n`,
    )
    lines.push(
      `data: ${JSON.stringify({
        type: "text-start",
        id: "txt-1",
      })}\n\n`,
    )

    // Stream the text in chunks
    const chunks = fullText.match(/.{1,10}/g) ?? [fullText]
    for (const c of chunks) {
      lines.push(
        `data: ${JSON.stringify({ type: "text-delta", id: "txt-1", delta: c })}\n\n`,
      )
    }

    lines.push(
      `data: ${JSON.stringify({ type: "text-end", id: "txt-1" })}\n\n`,
    )
    lines.push(`data: ${JSON.stringify({ type: "finish-step" })}\n\n`)
    lines.push(`data: ${JSON.stringify({ type: "finish" })}\n\n`)
    lines.push(`data: [DONE]\n\n`)

    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      headers: {
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: lines.join(""),
    })
  })
}

test.describe("ChatCipiky PRO — chat flow", () => {
  test("composer enables send button as user types", async ({ page }) => {
    await seedKey(page)
    await page.goto("/")

    const textarea = page.getByPlaceholder(/opýtaj sa čokoľvek/i)
    await expect(page.getByLabel(/hlasový vstup/i)).toBeVisible()

    await textarea.fill("Ahoj")
    await expect(page.getByLabel(/odoslať/i)).toBeVisible()
    await expect(page.getByLabel(/hlasový vstup/i)).toHaveCount(0)
  })

  test("sending a message renders the user bubble and an assistant reply", async ({
    page,
  }) => {
    await seedKey(page)
    await mockChatStream(page, "Ahoj! Som ChatCipiky PRO, ako pomôžem?")
    await page.goto("/")

    const textarea = page.getByPlaceholder(/opýtaj sa čokoľvek/i)
    await textarea.fill("Povedz ahoj.")
    await page.getByLabel(/odoslať/i).click()

    // User bubble
    await expect(page.getByText(/povedz ahoj\./i)).toBeVisible()
    // Assistant reply (streamed)
    await expect(
      page.getByText(/som chatcipiky pro/i),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("Enter sends, Shift+Enter inserts newline", async ({ page }) => {
    await seedKey(page)
    await mockChatStream(page, "OK")
    await page.goto("/")

    const textarea = page.getByPlaceholder(/opýtaj sa čokoľvek/i)
    await textarea.click()
    await textarea.type("Riadok 1")
    await page.keyboard.down("Shift")
    await page.keyboard.press("Enter")
    await page.keyboard.up("Shift")
    await textarea.type("Riadok 2")

    // Should NOT have sent yet (mocked endpoint hasn't fired)
    await expect(page.getByText("Riadok 1")).toHaveCount(0)

    await page.keyboard.press("Enter")
    // The user message is rendered including the newline
    await expect(page.locator("text=Riadok 1")).toBeVisible()
  })

  test("clicking a suggestion sends the prompt", async ({ page }) => {
    await seedKey(page)
    await mockChatStream(page, "Píšem báseň…")
    await page.goto("/")

    await page.getByText(/napíš mi krátku báseň/i).click()
    await expect(page.getByText(/o tichu a oceáne/i)).toBeVisible()
    await expect(page.getByText(/píšem báseň/i)).toBeVisible({
      timeout: 10_000,
    })
  })

  test("New chat resets the conversation", async ({ page }) => {
    await seedKey(page)
    await mockChatStream(page, "Vitajte späť.")
    await page.goto("/")

    await page
      .getByPlaceholder(/opýtaj sa čokoľvek/i)
      .fill("Otázka pred resetom")
    await page.getByLabel(/odoslať/i).click()
    await expect(page.getByText(/otázka pred resetom/i)).toBeVisible()

    await page.getByLabel(/nový chat/i).click()
    await expect(page.getByText(/otázka pred resetom/i)).toHaveCount(0)
    // Back to welcome screen
    await expect(
      page.getByRole("heading", { name: /rád ťa vidím/i }),
    ).toBeVisible()
  })

  test("auth error renders an error banner with Tools CTA", async ({
    page,
  }) => {
    await seedKey(page, "a".repeat(40))
    // Mock 401-like error stream
    await page.route("**/api/chat", async (route) => {
      const lines = [
        `data: ${JSON.stringify({ type: "start", messageId: "err-1" })}\n\n`,
        `data: ${JSON.stringify({
          type: "error",
          errorText: "Neplatný Mistral API kľúč. Skontrolujte ho v Nástrojoch.",
        })}\n\n`,
        `data: [DONE]\n\n`,
      ]
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: { "x-vercel-ai-ui-message-stream": "v1" },
        body: lines.join(""),
      })
    })
    await page.goto("/")

    await page.getByPlaceholder(/opýtaj sa čokoľvek/i).fill("test")
    await page.getByLabel(/odoslať/i).click()
    await expect(page.getByText(/neplatný mistral api kľúč/i)).toBeVisible({
      timeout: 10_000,
    })
  })
})
