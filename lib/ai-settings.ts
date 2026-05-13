"use client"

import {
  detectProvider,
  getProviderInfo,
  isValidModel,
  PROVIDERS,
  type AIProvider,
} from "@/lib/provider-detection"

export interface AISettings {
  /** Raw API key as entered by the user */
  apiKey: string
  /** Last known model id (provider-specific) */
  model: string
  /** Optional system prompt */
  systemPrompt: string
  /** Sampling temperature (0..1.5) */
  temperature: number
}

const STORAGE_KEY = "chatcipiky.ai.settings.v2"
/** Older key used while only Mistral was supported. We migrate from this. */
const LEGACY_KEY = "chatcipiky.mistral.settings.v1"

export const DEFAULT_SETTINGS: AISettings = {
  apiKey: "",
  model: "",
  systemPrompt: "",
  temperature: 0.7,
}

/**
 * Returns a sane model id for the current API key. If the user's stored model
 * doesn't match the detected provider (e.g. they swapped from OpenAI to
 * Anthropic), we fall back to that provider's default.
 */
export function resolveModelForKey(apiKey: string, storedModel: string): string {
  const provider = detectProvider(apiKey)
  if (provider === "unknown") return storedModel || ""
  if (storedModel && isValidModel(provider, storedModel)) return storedModel
  return PROVIDERS[provider].defaultModel
}

export function loadSettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY)

    // Migrate from legacy mistral-only storage if present.
    if (!raw) {
      const legacy = window.localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        raw = legacy
        window.localStorage.setItem(STORAGE_KEY, legacy)
      }
    }

    if (!raw) return DEFAULT_SETTINGS

    const parsed = JSON.parse(raw) as Partial<AISettings>
    const apiKey = typeof parsed.apiKey === "string" ? parsed.apiKey : ""
    const storedModel = typeof parsed.model === "string" ? parsed.model : ""

    return {
      apiKey,
      model: resolveModelForKey(apiKey, storedModel),
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

export function saveSettings(settings: AISettings) {
  if (typeof window === "undefined") return
  try {
    const normalized: AISettings = {
      ...settings,
      model: resolveModelForKey(settings.apiKey, settings.model),
      temperature: Math.max(0, Math.min(1.5, settings.temperature)),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    /* quota / private mode — ignore */
  }
}

export function clearSettings() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* ignore */
  }
}

/** Re-exports so callers can import everything from a single module */
export { detectProvider, getProviderInfo, PROVIDERS }
export type { AIProvider }
