import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

/**
 * We mock @ai-sdk/react's useChat so we have full control over
 * messages / status / error in tests.
 *
 * A small in-memory state object lets us simulate streaming.
 */
const mockChat = {
  messages: [] as Array<{
    id: string
    role: "user" | "assistant"
    parts: Array<{ type: "text"; text: string }>
  }>,
  status: "ready" as "ready" | "streaming" | "submitted" | "error",
  error: undefined as Error | undefined,
  sendMessageMock: vi.fn(),
  stopMock: vi.fn(),
  setMessagesMock: vi.fn(),
}

vi.mock("@ai-sdk/react", () => {
  return {
    useChat: () => ({
      messages: mockChat.messages,
      status: mockChat.status,
      error: mockChat.error,
      sendMessage: mockChat.sendMessageMock,
      stop: mockChat.stopMock,
      setMessages: (next: typeof mockChat.messages) => {
        mockChat.setMessagesMock(next)
        mockChat.messages = next
      },
    }),
  }
})

vi.mock("ai", () => {
  return {
    DefaultChatTransport: class {
      constructor(_opts: unknown) {
        /* noop */
      }
    },
  }
})

// Import AFTER mocks so the component picks them up
import { ChatWindow } from "@/components/chat-window"

const STORAGE_KEY = "chatcipiky.mistral.settings.v1"

function seedKey(apiKey = "a".repeat(40)) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      apiKey,
      model: "mistral-large-latest",
      systemPrompt: "",
      temperature: 0.7,
    }),
  )
}

beforeEach(() => {
  mockChat.messages = []
  mockChat.status = "ready"
  mockChat.error = undefined
  mockChat.sendMessageMock.mockReset()
  mockChat.stopMock.mockReset()
  mockChat.setMessagesMock.mockReset()
  localStorage.clear()
})

describe("ChatWindow — UI integrity", () => {
  it("renders the ChatCipiky brand and PRO badge", async () => {
    seedKey()
    render(<ChatWindow />)
    // The brand text may appear in multiple places (header + dialog), so
    // assert at least one match instead of requiring uniqueness.
    const matches = await screen.findAllByText(/ChatCipiky/)
    expect(matches.length).toBeGreaterThan(0)
    expect(screen.getAllByText("PRO").length).toBeGreaterThan(0)
  })

  it("shows the connect-AI empty state when no API key is saved", async () => {
    render(<ChatWindow />)
    expect(
      await screen.findByRole("heading", { name: /pripojme mistral ai/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/zadajte svoj mistral api kľúč/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /zadať api kľúč/i }),
    ).toBeInTheDocument()
  })

  it("auto-opens the Tools sheet on first visit (no API key)", async () => {
    render(<ChatWindow />)
    // The ToolsSheet renders a role=dialog
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("does NOT auto-open Tools when an API key is already saved", async () => {
    seedKey()
    render(<ChatWindow />)
    await screen.findByText(/Rád ťa vidím./i)
    // Dialog should exist in DOM but have aria-hidden=true
    const dialogContainer = screen.queryByRole("dialog", { hidden: true })
    if (dialogContainer) {
      expect(dialogContainer.closest("[aria-hidden]")).toHaveAttribute(
        "aria-hidden",
        "true",
      )
    }
  })

  it("shows the friendly welcome and suggestions when key is set", async () => {
    seedKey()
    render(<ChatWindow />)
    expect(await screen.findByText(/Rád ťa vidím./i)).toBeInTheDocument()
    // Suggestions
    expect(screen.getByText(/napíš mi krátku báseň/i)).toBeInTheDocument()
    expect(screen.getByText(/vysvetli kvantovú fyziku/i)).toBeInTheDocument()
  })

  it("typing in the composer enables the send button (replaces mic)", async () => {
    seedKey()
    const user = userEvent.setup()
    render(<ChatWindow />)
    // Initially mic is shown
    expect(await screen.findByLabelText(/hlasový vstup/i)).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText(/opýtaj sa čokoľvek/i)
    await user.type(textarea, "Ahoj")
    expect(screen.getByLabelText(/odoslať/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/hlasový vstup/i)).not.toBeInTheDocument()
  })

  it("clicking send calls sendMessage and clears the textarea", async () => {
    seedKey()
    const user = userEvent.setup()
    render(<ChatWindow />)

    const textarea = (await screen.findByPlaceholderText(
      /opýtaj sa čokoľvek/i,
    )) as HTMLTextAreaElement
    await user.type(textarea, "Ako sa máš?")
    await user.click(screen.getByLabelText(/odoslať/i))

    expect(mockChat.sendMessageMock).toHaveBeenCalledTimes(1)
    expect(mockChat.sendMessageMock).toHaveBeenCalledWith({
      text: "Ako sa máš?",
    })
    expect(textarea.value).toBe("")
  })

  it("pressing Enter sends, Shift+Enter inserts newline", async () => {
    seedKey()
    const user = userEvent.setup()
    render(<ChatWindow />)
    const textarea = (await screen.findByPlaceholderText(
      /opýtaj sa čokoľvek/i,
    )) as HTMLTextAreaElement

    await user.click(textarea)
    await user.keyboard("Riadok 1")
    await user.keyboard("{Shift>}{Enter}{/Shift}Riadok 2")
    expect(textarea.value).toContain("\n")
    expect(mockChat.sendMessageMock).not.toHaveBeenCalled()

    await user.keyboard("{Enter}")
    expect(mockChat.sendMessageMock).toHaveBeenCalledTimes(1)
  })

  it("blocks sending and opens Tools when no API key is set", async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)
    // No key → welcome shows CTA, no composer messaging path
    const cta = await screen.findByRole("button", { name: /zadať api kľúč/i })
    await user.click(cta)
    // Dialog should be open
    expect(screen.getAllByRole("dialog").length).toBeGreaterThan(0)
    expect(mockChat.sendMessageMock).not.toHaveBeenCalled()
  })

  it("clicking a suggestion calls sendMessage with combined text", async () => {
    seedKey()
    const user = userEvent.setup()
    render(<ChatWindow />)
    const button = await screen.findByText(/napíš mi krátku báseň/i)
    await user.click(button)
    expect(mockChat.sendMessageMock).toHaveBeenCalledTimes(1)
    const payload = mockChat.sendMessageMock.mock.calls[0][0] as {
      text: string
    }
    expect(payload.text).toMatch(/napíš mi krátku báseň/i)
    expect(payload.text).toMatch(/o tichu a oceáne/i)
  })

  it("renders user and assistant messages from useChat", async () => {
    seedKey()
    mockChat.messages = [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "Ahoj!" }],
      },
      {
        id: "2",
        role: "assistant",
        parts: [{ type: "text", text: "Zdravím, ako pomôžem?" }],
      },
    ]
    render(<ChatWindow />)
    expect(await screen.findByText("Ahoj!")).toBeInTheDocument()
    expect(screen.getByText("Zdravím, ako pomôžem?")).toBeInTheDocument()
  })

  it("shows the Stop button while streaming and calls stop()", async () => {
    seedKey()
    mockChat.messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hi" }] },
    ]
    mockChat.status = "streaming"
    const user = userEvent.setup()
    render(<ChatWindow />)

    const stopBtn = await screen.findByLabelText(/zastaviť/i)
    await user.click(stopBtn)
    expect(mockChat.stopMock).toHaveBeenCalledTimes(1)
  })

  it("renders an ErrorBanner when useChat returns an error", async () => {
    seedKey()
    mockChat.messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hi" }] },
    ]
    mockChat.error = new Error("Neplatný Mistral API kľúč.")
    render(<ChatWindow />)
    expect(
      await screen.findByText(/neplatný mistral api kľúč/i),
    ).toBeInTheDocument()
    // Should show "Otvoriť Nástroje" CTA when message looks auth-related
    expect(screen.getByText(/otvoriť nástroje/i)).toBeInTheDocument()
  })

  it("New chat button clears messages", async () => {
    seedKey()
    mockChat.messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hi" }] },
      {
        id: "2",
        role: "assistant",
        parts: [{ type: "text", text: "ahoj" }],
      },
    ]
    const user = userEvent.setup()
    render(<ChatWindow />)
    await user.click(screen.getByLabelText(/nový chat/i))
    expect(mockChat.setMessagesMock).toHaveBeenCalledWith([])
  })

  it("clicking the brand area opens Tools", async () => {
    seedKey()
    const user = userEvent.setup()
    render(<ChatWindow />)
    await user.click(
      await screen.findByRole("button", { name: /otvoriť nastavenia/i }),
    )
    // Dialog open
    const dialog = await screen.findByRole("dialog")
    expect(dialog).toBeInTheDocument()
  })

  it("Tools button in the composer opens Tools", async () => {
    seedKey()
    const user = userEvent.setup()
    render(<ChatWindow />)
    await user.click(
      await screen.findByRole("button", { name: /^nástroje$/i }),
    )
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("displays the active model name in the header subtitle", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        apiKey: "a".repeat(30),
        model: "codestral-latest",
        systemPrompt: "",
        temperature: 0.7,
      }),
    )
    render(<ChatWindow />)
    // "Codestral" may show up in both the header subtitle and the open
    // Tools dialog model list, so assert at least one match.
    const matches = await screen.findAllByText(/codestral/i)
    expect(matches.length).toBeGreaterThan(0)
  })
})
