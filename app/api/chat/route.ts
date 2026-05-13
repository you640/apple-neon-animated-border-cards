import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createMistral } from "@ai-sdk/mistral"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createXai } from "@ai-sdk/xai"
import { convertToModelMessages, streamText, type UIMessage } from "ai"
import {
  detectProvider,
  PROVIDERS,
  isValidModel,
  type AIProvider,
} from "@/lib/provider-detection"

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

/**
 * Returns an AI SDK LanguageModel for the detected provider, instantiated with
 * the user's API key.
 */
function getModelForProvider(
  provider: Exclude<AIProvider, "unknown">,
  apiKey: string,
  modelId: string,
) {
  const safeModel = isValidModel(provider, modelId)
    ? modelId
    : PROVIDERS[provider].defaultModel

  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey })(safeModel)
    case "anthropic":
      return createAnthropic({ apiKey })(safeModel)
    case "mistral":
      return createMistral({ apiKey })(safeModel)
    case "groq":
      return createGroq({ apiKey })(safeModel)
    case "google":
      return createGoogleGenerativeAI({ apiKey })(safeModel)
    case "xai":
      return createXai({ apiKey })(safeModel)
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key")?.trim()

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Chýba API kľúč. Otvorte Nástroje v ChatCipiky PRO a vložte svoj API kľúč.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    const provider = detectProvider(apiKey)
    if (provider === "unknown") {
      return new Response(
        JSON.stringify({
          error:
            "Nepodarilo sa rozpoznať providera podľa kľúča. Podporujeme OpenAI, Anthropic, Mistral, Groq, Google a xAI.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const body = (await req.json()) as ChatRequestBody
    const {
      messages,
      model = PROVIDERS[provider].defaultModel,
      systemPrompt,
      temperature = 0.7,
    } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Chýbajú správy." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const languageModel = getModelForProvider(provider, apiKey, model)

    const result = streamText({
      model: languageModel,
      system: systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      temperature: Math.max(0, Math.min(1.5, temperature)),
    })

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("[v0] AI stream error:", error)
        if (error instanceof Error) {
          const msg = error.message.toLowerCase()
          if (
            msg.includes("unauthorized") ||
            msg.includes("401") ||
            msg.includes("invalid api key") ||
            msg.includes("invalid_api_key") ||
            msg.includes("authentication")
          ) {
            return `Neplatný API kľúč pre ${PROVIDERS[provider].name}. Skontrolujte ho v Nástrojoch.`
          }
          if (msg.includes("rate") || msg.includes("429")) {
            return "Prekročený limit požiadaviek. Skúste o chvíľu znova."
          }
          if (msg.includes("model") && msg.includes("not found")) {
            return `Model nie je dostupný v ${PROVIDERS[provider].name}. Vyberte iný model v Nástrojoch.`
          }
          return error.message
        }
        return `Nastala neočakávaná chyba pri komunikácii s ${PROVIDERS[provider].name}.`
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
