import { createMistral } from "@ai-sdk/mistral"
import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 60

type ChatRequestBody = {
  messages: UIMessage[]
  model?: string
  systemPrompt?: string
  temperature?: number
}

const DEFAULT_SYSTEM_PROMPT = `Si ChatCipiky PRO — premiový AI asistent.
Odpovedaj jasne, stručne a so štýlom. Komunikuj v jazyku používateľa.
Buď presný, užitočný a priateľský. Pri kóde používaj markdown bloky s jazykom.`

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-mistral-api-key")?.trim()

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Chýba Mistral API kľúč. Otvorte Nástroje v ChatCipiky PRO a zadajte svoj API kľúč.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    const body = (await req.json()) as ChatRequestBody
    const {
      messages,
      model = "mistral-large-latest",
      systemPrompt,
      temperature = 0.7,
    } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Chýbajú správy." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const mistral = createMistral({ apiKey })

    const result = streamText({
      model: mistral(model),
      system: systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      temperature: Math.max(0, Math.min(1.5, temperature)),
    })

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("[v0] Mistral stream error:", error)
        if (error instanceof Error) {
          if (
            error.message.toLowerCase().includes("unauthorized") ||
            error.message.toLowerCase().includes("401")
          ) {
            return "Neplatný Mistral API kľúč. Skontrolujte ho v Nástrojoch."
          }
          if (error.message.toLowerCase().includes("rate")) {
            return "Prekročený limit požiadaviek. Skúste o chvíľu znova."
          }
          return error.message
        }
        return "Nastala neočakávaná chyba pri komunikácii s Mistral AI."
      },
    })
  } catch (err) {
    console.error("[v0] /api/chat error:", err)
    const message =
      err instanceof Error ? err.message : "Neznáma chyba na serveri."
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
