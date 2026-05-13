"use client"

import { useEffect, useMemo, useState } from "react"
import {
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  KeyRound,
  Cpu,
  Sliders,
  Trash2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import {
  type AISettings,
  detectProvider,
  PROVIDERS,
  resolveModelForKey,
} from "@/lib/ai-settings"

interface ToolsSheetProps {
  open: boolean
  onClose: () => void
  settings: AISettings
  onSave: (settings: AISettings) => void
  onClear: () => void
}

export function ToolsSheet({
  open,
  onClose,
  settings,
  onSave,
  onClear,
}: ToolsSheetProps) {
  const [draft, setDraft] = useState<AISettings>(settings)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(settings)
      setShowKey(false)
      setSaved(false)
    }
  }, [open, settings])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const detectedProvider = useMemo(
    () => detectProvider(draft.apiKey),
    [draft.apiKey],
  )
  const providerInfo =
    detectedProvider === "unknown" ? null : PROVIDERS[detectedProvider]

  const availableModels = providerInfo?.models ?? []

  /** When the user types a key, snap the model to a valid one for that provider */
  const handleKeyChange = (value: string) => {
    const nextProvider = detectProvider(value)
    const nextModel =
      nextProvider === "unknown"
        ? draft.model
        : resolveModelForKey(value, draft.model)
    setDraft((d) => ({ ...d, apiKey: value, model: nextModel }))
  }

  const handleSave = () => {
    onSave(draft)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 700)
  }

  const handleClear = () => {
    onClear()
    setDraft({
      apiKey: "",
      model: "",
      systemPrompt: "",
      temperature: 0.7,
    })
  }

  const keyValid = draft.apiKey.trim().length >= 20 && detectedProvider !== "unknown"

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nástroje a nastavenia"
        className={`absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full sm:translate-y-4"
        } ${open ? "sm:opacity-100" : "sm:opacity-0"}`}
      >
        <div
          className="relative w-full sm:max-w-[480px] sm:mx-auto bg-[#0a0a0d] sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88dvh] pb-safe"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), 0 -20px 60px -20px rgba(6,182,212,0.15), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-2 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-3 sm:pt-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)",
                  boxShadow:
                    "0 0 0 1px rgba(6,182,212,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                <Sliders className="w-4 h-4 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white tracking-tight">
                  Nástroje
                </h2>
                <p className="text-[11px] text-white/40 tracking-tight">
                  Pripojte AI providera
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zavrieť"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6 scrollbar-hide">
            {/* API KEY SECTION */}
            <section>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <KeyRound
                    className="w-3.5 h-3.5 text-cyan-400/80"
                    strokeWidth={2}
                  />
                  <h3 className="text-[11px] font-semibold text-white/80 tracking-[0.1em] uppercase">
                    Univerzálny API kľúč
                  </h3>
                </div>

                {/* Detected provider badge */}
                {providerInfo ? (
                  <span
                    data-testid="detected-provider"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.06em] px-2 py-1 rounded-md text-emerald-300"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.1) 100%)",
                      boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.3)",
                    }}
                  >
                    <Sparkles className="w-3 h-3" strokeWidth={2.25} />
                    {providerInfo.shortName}
                  </span>
                ) : draft.apiKey.trim().length > 0 ? (
                  <span
                    data-testid="unknown-provider"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.06em] px-2 py-1 rounded-md text-amber-300"
                    style={{
                      background: "rgba(245,158,11,0.12)",
                      boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.3)",
                    }}
                  >
                    <AlertCircle className="w-3 h-3" strokeWidth={2.25} />
                    Neznámy formát
                  </span>
                ) : null}
              </div>

              <div
                className="relative rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <input
                  type={showKey ? "text" : "password"}
                  value={draft.apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="sk-… / sk-ant-… / gsk_… / AIza… / …"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent outline-none text-white placeholder:text-white/30 text-[14px] px-4 pr-12 py-3.5 font-mono tracking-tight"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? "Skryť kľúč" : "Zobraziť kľúč"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="w-[16px] h-[16px]" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-[16px] h-[16px]" strokeWidth={1.75} />
                  )}
                </button>
              </div>

              <div className="mt-2.5 flex items-start gap-2 text-[11.5px] text-white/45 leading-relaxed">
                <ShieldCheck
                  className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-400/70"
                  strokeWidth={2}
                />
                <span>
                  Vložte ľubovoľný kľúč z{" "}
                  <span className="text-white/65">OpenAI, Anthropic, Mistral, Groq, Google</span>{" "}
                  alebo <span className="text-white/65">xAI</span>. Providera
                  zistíme automaticky. Kľúč sa ukladá iba lokálne vo vašom
                  zariadení.
                </span>
              </div>

              {providerInfo && (
                <a
                  href={providerInfo.consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Konzola {providerInfo.name}
                  <ExternalLink className="w-3 h-3" strokeWidth={2} />
                </a>
              )}
            </section>

            {/* MODEL PICKER (provider-aware) */}
            {availableModels.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <Cpu
                    className="w-3.5 h-3.5 text-cyan-400/80"
                    strokeWidth={2}
                  />
                  <h3 className="text-[11px] font-semibold text-white/80 tracking-[0.1em] uppercase">
                    Model — {providerInfo?.shortName}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  {availableModels.map((m) => {
                    const selected = draft.model === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDraft({ ...draft, model: m.id })}
                        className={`group w-full text-left p-3 rounded-2xl transition-all duration-150 ${
                          selected
                            ? "bg-white/[0.05]"
                            : "bg-white/[0.02] hover:bg-white/[0.035]"
                        }`}
                        style={{
                          boxShadow: selected
                            ? "inset 0 0 0 1px rgba(6,182,212,0.45), 0 0 0 3px rgba(6,182,212,0.08)"
                            : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[14px] font-medium text-white truncate block">
                              {m.name}
                            </span>
                            {m.description && (
                              <p className="text-[12px] text-white/45 mt-0.5 leading-snug">
                                {m.description}
                              </p>
                            )}
                          </div>
                          <div
                            className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              selected
                                ? "bg-cyan-400 text-black"
                                : "bg-white/5 text-transparent"
                            }`}
                          >
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* TEMPERATURE */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[11px] font-semibold text-white/80 tracking-[0.1em] uppercase">
                  Kreativita
                </h3>
                <span className="text-[12px] font-mono text-cyan-400 tabular-nums">
                  {draft.temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.05}
                value={draft.temperature}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    temperature: Number.parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-400 h-1.5"
              />
              <div className="flex justify-between text-[10px] text-white/35 mt-1.5 tracking-wide">
                <span>Presný</span>
                <span>Vyvážený</span>
                <span>Kreatívny</span>
              </div>
            </section>

            {/* SYSTEM PROMPT */}
            <section>
              <h3 className="text-[11px] font-semibold text-white/80 tracking-[0.1em] uppercase mb-2.5">
                Systémový prompt (voliteľné)
              </h3>
              <div
                className="rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <textarea
                  value={draft.systemPrompt}
                  onChange={(e) =>
                    setDraft({ ...draft, systemPrompt: e.target.value })
                  }
                  placeholder="Napr. Si expert na UX dizajn, odpovedaj stručne a v slovenčine…"
                  rows={3}
                  className="w-full bg-transparent outline-none text-white placeholder:text-white/30 text-[13.5px] leading-relaxed px-4 py-3 resize-none"
                />
              </div>
            </section>

            {/* DANGER ZONE */}
            {settings.apiKey && (
              <section>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.05] transition-colors"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(248,113,113,0.15)",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  Vymazať uložený API kľúč
                </button>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pt-3 pb-3 border-t border-white/[0.06] bg-black/40 backdrop-blur-md">
            <button
              type="button"
              onClick={handleSave}
              disabled={!keyValid}
              className={`w-full h-12 rounded-2xl text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              style={{
                background: keyValid
                  ? "linear-gradient(135deg, #06b6d4 0%, #0891b2 60%, #10b981 100%)"
                  : "rgba(255,255,255,0.04)",
                boxShadow: keyValid
                  ? "0 0 0 1px rgba(6,182,212,0.35), 0 10px 28px -8px rgba(6,182,212,0.55), inset 0 1px 0 rgba(255,255,255,0.3)"
                  : "inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  Uložené
                </>
              ) : providerInfo ? (
                `Uložiť a pokračovať s ${providerInfo.shortName}`
              ) : (
                "Uložiť a pokračovať"
              )}
            </button>
            <p className="text-center text-[10.5px] text-white/30 mt-2 tracking-tight">
              Nastavenia sa uložia bezpečne lokálne na vašom zariadení.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
