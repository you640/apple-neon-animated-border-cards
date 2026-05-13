/**
 * Auto-detect AI provider from an API key based on its prefix / format.
 *
 * Provider key conventions:
 *  - OpenAI       : sk-... / sk-proj-... / sk-svcacct-...
 *  - Anthropic    : sk-ant-...
 *  - Groq         : gsk_...
 *  - xAI (Grok)   : xai-...
 *  - Google Gemini: AIza...
 *  - Mistral      : 32+ alphanumeric chars (no special prefix)
 */

export type AIProvider =
  | "openai"
  | "anthropic"
  | "mistral"
  | "groq"
  | "google"
  | "xai"
  | "unknown"

export interface ProviderInfo {
  id: AIProvider
  name: string
  /** Short, human-friendly label shown in UI */
  shortName: string
  /** Where the user can grab a key */
  consoleUrl: string
  /** Brand accent (used for tiny badges) */
  accent: string
  /** Default model id for that provider */
  defaultModel: string
  /** Available models for that provider (id + display name) */
  models: { id: string; name: string; description?: string }[]
}

export const PROVIDERS: Record<Exclude<AIProvider, "unknown">, ProviderInfo> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    shortName: "OpenAI",
    consoleUrl: "https://platform.openai.com/api-keys",
    accent: "#10a37f",
    defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Flagship multimodálny model." },
      { id: "gpt-4o-mini", name: "GPT-4o mini", description: "Rýchly a lacný." },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Predošlá generácia." },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Veľmi lacný." },
    ],
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    shortName: "Claude",
    consoleUrl: "https://console.anthropic.com/settings/keys",
    accent: "#d97706",
    defaultModel: "claude-3-5-sonnet-latest",
    models: [
      {
        id: "claude-3-5-sonnet-latest",
        name: "Claude 3.5 Sonnet",
        description: "Najlepší pomer výkonu a ceny.",
      },
      {
        id: "claude-3-5-haiku-latest",
        name: "Claude 3.5 Haiku",
        description: "Rýchly a lacný.",
      },
      {
        id: "claude-3-opus-latest",
        name: "Claude 3 Opus",
        description: "Najvýkonnejší pre komplexné úlohy.",
      },
    ],
  },
  mistral: {
    id: "mistral",
    name: "Mistral AI",
    shortName: "Mistral",
    consoleUrl: "https://console.mistral.ai/api-keys",
    accent: "#fa520f",
    defaultModel: "mistral-large-latest",
    models: [
      {
        id: "mistral-large-latest",
        name: "Mistral Large",
        description: "Najvýkonnejší model.",
      },
      {
        id: "mistral-medium-latest",
        name: "Mistral Medium",
        description: "Vyvážený výkon a rýchlosť.",
      },
      {
        id: "mistral-small-latest",
        name: "Mistral Small",
        description: "Rýchly a efektívny.",
      },
      {
        id: "codestral-latest",
        name: "Codestral",
        description: "Špecializovaný na kód.",
      },
      {
        id: "pixtral-large-latest",
        name: "Pixtral Large",
        description: "Multimodálny s obrázkami.",
      },
      {
        id: "open-mistral-nemo",
        name: "Mistral Nemo",
        description: "Open-source, dlhý kontext.",
      },
    ],
  },
  groq: {
    id: "groq",
    name: "Groq",
    shortName: "Groq",
    consoleUrl: "https://console.groq.com/keys",
    accent: "#f55036",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        description: "Univerzálny, veľmi rýchly.",
      },
      {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B",
        description: "Bleskovo rýchly.",
      },
      {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B",
        description: "Dlhý kontext.",
      },
      {
        id: "gemma2-9b-it",
        name: "Gemma 2 9B",
        description: "Google open-source.",
      },
    ],
  },
  google: {
    id: "google",
    name: "Google Gemini",
    shortName: "Gemini",
    consoleUrl: "https://aistudio.google.com/app/apikey",
    accent: "#4285f4",
    defaultModel: "gemini-2.0-flash",
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Najnovší rýchly model.",
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Najvýkonnejší (2M kontext).",
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        description: "Rýchly s veľkým kontextom.",
      },
    ],
  },
  xai: {
    id: "xai",
    name: "xAI Grok",
    shortName: "Grok",
    consoleUrl: "https://console.x.ai/",
    accent: "#ffffff",
    defaultModel: "grok-2-latest",
    models: [
      {
        id: "grok-2-latest",
        name: "Grok 2",
        description: "Flagship od xAI.",
      },
      {
        id: "grok-2-vision-latest",
        name: "Grok 2 Vision",
        description: "Multimodálny s obrázkami.",
      },
      {
        id: "grok-beta",
        name: "Grok Beta",
        description: "Experimentálny.",
      },
    ],
  },
}

/**
 * Detects which AI provider an API key belongs to based on its prefix/shape.
 * Returns "unknown" if the key is empty or doesn't match any known pattern.
 */
export function detectProvider(apiKey: string): AIProvider {
  const key = (apiKey ?? "").trim()
  if (!key) return "unknown"

  // Anthropic must be checked BEFORE OpenAI because both can start with "sk-".
  if (key.startsWith("sk-ant-")) return "anthropic"
  if (key.startsWith("xai-")) return "xai"
  if (key.startsWith("gsk_")) return "groq"
  if (key.startsWith("AIza")) return "google"
  if (key.startsWith("sk-")) return "openai"

  // Mistral keys are typically 32 alphanumeric chars with no prefix.
  if (/^[a-zA-Z0-9]{20,}$/.test(key)) return "mistral"

  return "unknown"
}

/**
 * Returns provider info for a given key, or null if unknown.
 */
export function getProviderInfo(apiKey: string): ProviderInfo | null {
  const id = detectProvider(apiKey)
  if (id === "unknown") return null
  return PROVIDERS[id]
}

/**
 * Returns the list of all known providers (for UI listing).
 */
export function listProviders(): ProviderInfo[] {
  return Object.values(PROVIDERS)
}

/**
 * Returns true if a model id is valid for a given provider.
 */
export function isValidModel(provider: AIProvider, modelId: string): boolean {
  if (provider === "unknown") return false
  return PROVIDERS[provider].models.some((m) => m.id === modelId)
}
