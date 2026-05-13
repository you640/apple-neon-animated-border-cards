import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToolsSheet } from "@/components/tools-sheet"
import { DEFAULT_SETTINGS, type MistralSettings } from "@/lib/mistral-settings"

function setup(overrides?: Partial<MistralSettings> & { open?: boolean }) {
  const settings: MistralSettings = { ...DEFAULT_SETTINGS, ...overrides }
  const onClose = vi.fn()
  const onSave = vi.fn()
  const onClear = vi.fn()
  render(
    <ToolsSheet
      open={overrides?.open ?? true}
      onClose={onClose}
      settings={settings}
      onSave={onSave}
      onClear={onClear}
    />,
  )
  return { onClose, onSave, onClear }
}

describe("ToolsSheet — UI integrity", () => {
  it("renders the dialog header with brand context", () => {
    setup()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /nástroje/i })).toBeInTheDocument()
    expect(screen.getByText(/Pripojte Mistral AI agenta/i)).toBeInTheDocument()
  })

  it("renders the API key input with masked default", () => {
    setup({ apiKey: "secret-key-1234567890" })
    const input = screen.getByPlaceholderText(/vložte sem svoj mistral/i)
    expect(input).toHaveAttribute("type", "password")
    expect(input).toHaveValue("secret-key-1234567890")
  })

  it("toggles API key visibility when eye button is clicked", async () => {
    const user = userEvent.setup()
    setup({ apiKey: "abcdefghijklmnopqrst" })
    const input = screen.getByPlaceholderText(/vložte sem svoj mistral/i)
    expect(input).toHaveAttribute("type", "password")

    await user.click(screen.getByLabelText(/zobraziť kľúč/i))
    expect(input).toHaveAttribute("type", "text")

    await user.click(screen.getByLabelText(/skryť kľúč/i))
    expect(input).toHaveAttribute("type", "password")
  })

  it("save button is disabled when API key is shorter than 20 chars", async () => {
    const user = userEvent.setup()
    setup({ apiKey: "" })
    const save = screen.getByRole("button", { name: /uložiť/i })
    expect(save).toBeDisabled()

    await user.type(
      screen.getByPlaceholderText(/vložte sem svoj mistral/i),
      "short",
    )
    expect(save).toBeDisabled()
  })

  it("save button enables once API key is 20+ chars", async () => {
    const user = userEvent.setup()
    setup({ apiKey: "" })
    await user.type(
      screen.getByPlaceholderText(/vložte sem svoj mistral/i),
      "a".repeat(25),
    )
    const save = screen.getByRole("button", { name: /uložiť/i })
    expect(save).toBeEnabled()
  })

  it("clicking Save calls onSave with the drafted settings", async () => {
    const user = userEvent.setup()
    const { onSave } = setup({ apiKey: "a".repeat(25) })
    await user.click(screen.getByRole("button", { name: /uložiť/i }))
    expect(onSave).toHaveBeenCalledTimes(1)
    const arg = onSave.mock.calls[0][0] as MistralSettings
    expect(arg.apiKey).toBe("a".repeat(25))
    expect(arg.model).toBe(DEFAULT_SETTINGS.model)
  })

  it("clicking a model row updates the draft selection", async () => {
    const user = userEvent.setup()
    const { onSave } = setup({ apiKey: "a".repeat(25) })

    // Select Codestral
    await user.click(screen.getByText(/^Codestral$/i))
    await user.click(screen.getByRole("button", { name: /uložiť/i }))

    const arg = onSave.mock.calls[0][0] as MistralSettings
    expect(arg.model).toBe("codestral-latest")
  })

  it("renders every model from the registry", () => {
    setup()
    expect(screen.getByText(/^Mistral Large$/)).toBeInTheDocument()
    expect(screen.getByText(/^Mistral Medium$/)).toBeInTheDocument()
    expect(screen.getByText(/^Mistral Small$/)).toBeInTheDocument()
    expect(screen.getByText(/^Codestral$/)).toBeInTheDocument()
    expect(screen.getByText(/^Pixtral Large$/)).toBeInTheDocument()
  })

  it("temperature slider reflects and updates the value", async () => {
    setup({ apiKey: "a".repeat(25), temperature: 0.7 })
    const slider = screen.getByRole("slider") as HTMLInputElement
    expect(slider.value).toBe("0.7")
    expect(screen.getByText("0.70")).toBeInTheDocument()
  })

  it("system prompt textarea is editable", async () => {
    const user = userEvent.setup()
    const { onSave } = setup({ apiKey: "a".repeat(25) })
    const textarea = screen.getByPlaceholderText(/expert na UX/i)
    await user.type(textarea, "Buď výstižný.")
    await user.click(screen.getByRole("button", { name: /uložiť/i }))
    const arg = onSave.mock.calls[0][0] as MistralSettings
    expect(arg.systemPrompt).toBe("Buď výstižný.")
  })

  it("Clear key button shows only when a key is currently saved", () => {
    const { unmount } = render(
      <ToolsSheet
        open
        onClose={() => {}}
        onSave={() => {}}
        onClear={() => {}}
        settings={DEFAULT_SETTINGS}
      />,
    )
    expect(screen.queryByText(/vymazať uložený api/i)).not.toBeInTheDocument()
    unmount()

    render(
      <ToolsSheet
        open
        onClose={() => {}}
        onSave={() => {}}
        onClear={() => {}}
        settings={{ ...DEFAULT_SETTINGS, apiKey: "existing-key-abcdefghij" }}
      />,
    )
    expect(screen.getByText(/vymazať uložený api/i)).toBeInTheDocument()
  })

  it("Clear key button triggers onClear", async () => {
    const user = userEvent.setup()
    const { onClear } = setup({ apiKey: "existing-key-abcdefghij" })
    await user.click(screen.getByText(/vymazať uložený api/i))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("close button triggers onClose", async () => {
    const user = userEvent.setup()
    const { onClose } = setup()
    await user.click(screen.getByLabelText(/zavrieť/i))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("API key link points to console.mistral.ai", () => {
    setup()
    const link = screen.getByRole("link", {
      name: /získať api kľúč/i,
    }) as HTMLAnchorElement
    expect(link.href).toContain("console.mistral.ai")
    expect(link.target).toBe("_blank")
    expect(link.rel).toMatch(/noopener/)
  })
})
