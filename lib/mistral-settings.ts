"use client"

export type MistralModelId =
  | "mistral-large-latest"
  | "mistral-medium-latest"
  | "mistral-small-latest"
  | "ministral-8b-latest"
  | "ministral-3b-latest"
  | "codestral-latest"
  | "pixtral-large-latest"
  | "open-mistral-nemo"

export interface MistralModelOption {
  id: MistralModelId
  name: string
  description: string
  badge?: "Flagship" | "Rýchly" | "Kód" | "Vízia" | "Lacný"
}

export const MISTRAL_MODELS: MistralModelOption[] = [
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    description: "Najvýkonnejší model pre komplexné úlohy.",
    badge: "Flagship",
  },
  {
    id: "mistral-medium-latest",
    name: "Mistral Medium",
    description: "Rovnováha výkonu a rýchlosti.",
  },
  {
    id: "mistral-small-latest",
    name: "Mistral Small",
    description: "Rýchly a efektívny pre bežnú konverzáciu.",
    badge: "Rýchly",
  },
  {
    id: "ministral-8b-latest",
    name: "Ministral 8B",
    description: "Kompaktný model s nízkou latenciou.",
    badge: "Lacný",
  },
  {
    id: "ministral-3b-latest",
    name: "Ministral 3B",
    description: "Najmenší model, ideálny pre rýchle odpovede.",
  },
  {
    id: "codestral-latest",
    name: "Codestral",
    description: "Špecializovaný na programovanie a kód.",
    badge: "Kód",
  },
  {
    id: "pixtral-large-latest",
    name: "Pixtral Large",
    description: "Multimodálny model s podporou obrázkov.",
    badge: "Vízia",
  },
  {
    id: "open-mistral-nemo",
    name: "Mistral Nemo",
    description: "Open-source model s dlhým kontextom.",
  },
]

export interface MistralSettings {
  apiKey: string
  model: MistralModelId
  systemPrompt: string
  temperature: number
}

const STORAGE_KEY = "chatcipiky.mistral.settings.v1"

export const DEFAULT_SETTINGS: MistralSettings = {
  apiKey: "",
  model: "mistral-large-latest",
  systemPrompt: "",
  temperature: 0.7,
}

export function loadSettings(): MistralSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<MistralSettings>
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      model:
        MISTRAL_MODELS.some((m) => m.id === parsed.model)
          ? (parsed.model as MistralModelId)
          : DEFAULT_SETTINGS.model,
      systemPrompt:
        typeof parsed.systemPrompt === "string" ? parsed.systemPrompt : "",
      temperature:
        typeof parsed.temperature === "number" &&
        parsed.temperature >= 0 &&
        parsed.temperature <= 1.5
          ? parsed.temperature
          : DEFAULT_SETTINGS.temperature,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: MistralSettings) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* quota / private mode — ignore */
  }
}

export function clearSettings() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
