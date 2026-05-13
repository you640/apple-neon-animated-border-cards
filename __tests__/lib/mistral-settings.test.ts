import { describe, it, expect, beforeEach } from "vitest"
import {
  loadSettings,
  saveSettings,
  clearSettings,
  DEFAULT_SETTINGS,
  MISTRAL_MODELS,
  type MistralSettings,
} from "@/lib/mistral-settings"

const STORAGE_KEY = "chatcipiky.mistral.settings.v1"

describe("mistral-settings — integrity", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("MISTRAL_MODELS registry", () => {
    it("contains the expected canonical models", () => {
      const ids = MISTRAL_MODELS.map((m) => m.id)
      expect(ids).toContain("mistral-large-latest")
      expect(ids).toContain("mistral-small-latest")
      expect(ids).toContain("codestral-latest")
      expect(ids).toContain("pixtral-large-latest")
    })

    it("has unique model ids (no duplicates)", () => {
      const ids = MISTRAL_MODELS.map((m) => m.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it("every model has id, name and description", () => {
      for (const m of MISTRAL_MODELS) {
        expect(m.id).toBeTruthy()
        expect(m.name).toBeTruthy()
        expect(m.description.length).toBeGreaterThan(5)
      }
    })

    it("default settings model is present in the registry", () => {
      const ids = MISTRAL_MODELS.map((m) => m.id)
      expect(ids).toContain(DEFAULT_SETTINGS.model)
    })

    it("badges, if present, are from the allowed set", () => {
      const allowed = new Set(["Flagship", "Rýchly", "Kód", "Vízia", "Lacný"])
      for (const m of MISTRAL_MODELS) {
        if (m.badge !== undefined) {
          expect(allowed.has(m.badge)).toBe(true)
        }
      }
    })
  })

  describe("DEFAULT_SETTINGS", () => {
    it("has sane defaults", () => {
      expect(DEFAULT_SETTINGS.apiKey).toBe("")
      expect(DEFAULT_SETTINGS.systemPrompt).toBe("")
      expect(DEFAULT_SETTINGS.temperature).toBeGreaterThanOrEqual(0)
      expect(DEFAULT_SETTINGS.temperature).toBeLessThanOrEqual(1.5)
      expect(DEFAULT_SETTINGS.model).toBe("mistral-large-latest")
    })
  })

  describe("loadSettings", () => {
    it("returns DEFAULT_SETTINGS when storage is empty", () => {
      const result = loadSettings()
      expect(result).toEqual(DEFAULT_SETTINGS)
    })

    it("returns DEFAULT_SETTINGS when stored JSON is malformed", () => {
      localStorage.setItem(STORAGE_KEY, "{not-json")
      const result = loadSettings()
      expect(result).toEqual(DEFAULT_SETTINGS)
    })

    it("loads a previously saved valid value", () => {
      const value: MistralSettings = {
        apiKey: "sk-test-key-1234567890abcdef",
        model: "codestral-latest",
        systemPrompt: "Buď stručný.",
        temperature: 0.42,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      const result = loadSettings()
      expect(result).toEqual(value)
    })

    it("falls back to default model when stored model id is unknown", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...DEFAULT_SETTINGS, model: "totally-not-a-model" }),
      )
      const result = loadSettings()
      expect(result.model).toBe(DEFAULT_SETTINGS.model)
    })

    it("clamps invalid temperature back to default", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...DEFAULT_SETTINGS, temperature: 99 }),
      )
      expect(loadSettings().temperature).toBe(DEFAULT_SETTINGS.temperature)

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...DEFAULT_SETTINGS, temperature: -5 }),
      )
      expect(loadSettings().temperature).toBe(DEFAULT_SETTINGS.temperature)

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...DEFAULT_SETTINGS, temperature: "hot" }),
      )
      expect(loadSettings().temperature).toBe(DEFAULT_SETTINGS.temperature)
    })

    it("coerces missing fields to safe defaults", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({}))
      const result = loadSettings()
      expect(result.apiKey).toBe("")
      expect(result.systemPrompt).toBe("")
      expect(result.model).toBe(DEFAULT_SETTINGS.model)
      expect(result.temperature).toBe(DEFAULT_SETTINGS.temperature)
    })

    it("rejects non-string apiKey", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ apiKey: 12345 }),
      )
      expect(loadSettings().apiKey).toBe("")
    })
  })

  describe("saveSettings → loadSettings round trip", () => {
    it("persists and restores identical data", () => {
      const value: MistralSettings = {
        apiKey: "my-secret-key-abcdefghijklmnop",
        model: "mistral-small-latest",
        systemPrompt: "Použi slovenčinu.",
        temperature: 0.9,
      }
      saveSettings(value)
      expect(loadSettings()).toEqual(value)
    })

    it("does not throw when called multiple times", () => {
      saveSettings(DEFAULT_SETTINGS)
      saveSettings({ ...DEFAULT_SETTINGS, apiKey: "k".repeat(40) })
      expect(loadSettings().apiKey.length).toBe(40)
    })
  })

  describe("clearSettings", () => {
    it("removes stored data", () => {
      saveSettings({ ...DEFAULT_SETTINGS, apiKey: "stored-key-XXXXXXXX" })
      clearSettings()
      expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it("is a no-op when nothing is stored", () => {
      expect(() => clearSettings()).not.toThrow()
    })
  })
})
