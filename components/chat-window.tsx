"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import {
  ArrowUp,
  Mic,
  Plus,
  Sparkles,
  SlidersHorizontal,
  MoreHorizontal,
  PenSquare,
  AlertCircle,
  KeyRound,
} from "lucide-react"
import { ToolsSheet } from "@/components/tools-sheet"
import {
  loadSettings,
  saveSettings,
  clearSettings,
  DEFAULT_SETTINGS,
  detectProvider,
  PROVIDERS,
  type AISettings,
} from "@/lib/ai-settings"

const SUGGESTIONS = [
  { title: "Napíš mi krátku báseň", subtitle: "o tichu a oceáne" },
  { title: "Vysvetli kvantovú fyziku", subtitle: "ako mám 12 rokov" },
  { title: "Naplánuj víkend v Prahe", subtitle: "pre dvoch, ideálne počasie" },
  { title: "Sumarizuj môj e-mail", subtitle: "v troch bodoch" },
]

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function ChatWindow() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    setSettingsLoaded(true)
    if (!loaded.apiKey) {
      // Prompt for API key on first visit
      setToolsOpen(true)
    }
  }, [])

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: msgs, id }) => ({
        body: {
          id,
          messages: msgs,
          model: settings.model,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
        },
        headers: {
          "x-api-key": settings.apiKey,
        },
      }),
    }),
  })

  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [inputValue])

  const handleSend = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      if (!settings.apiKey) {
        setToolsOpen(true)
        return
      }
      sendMessage({ text: trimmed })
      setInputValue("")
    },
    [sendMessage, settings.apiKey],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputValue)
    }
  }

  const handleSaveSettings = (next: AISettings) => {
    saveSettings(next)
    setSettings(next)
  }

  const handleClearSettings = () => {
    clearSettings()
    setSettings(DEFAULT_SETTINGS)
  }

  const handleNewChat = () => {
    setMessages([])
    setInputValue("")
  }

  const hasInput = inputValue.trim().length > 0
  const isEmpty = messages.length === 0
  const hasKey = settings.apiKey.length > 0
  const provider = detectProvider(settings.apiKey)
  const providerInfo = provider === "unknown" ? null : PROVIDERS[provider]
  const currentModel =
    providerInfo?.models.find((m) => m.id === settings.model)?.name ??
    providerInfo?.shortName ??
    "AI"

  return (
    <div className="relative w-full h-dvh max-w-[640px] mx-auto flex flex-col bg-black overflow-hidden">
      {/* Very subtle ambient accents — restraint */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] h-64 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[120%] h-64 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(16,185,129,0.05) 0%, transparent 70%)",
        }}
      />

      {/* ─────────── HEADER ─────────── */}
      <header className="relative z-10 flex-shrink-0 pt-safe">
        <div className="flex items-center justify-between px-4 sm:px-5 h-14 sm:h-16">
          {/* Left: Logo + brand + PRO */}
          <button
            type="button"
            onClick={() => setToolsOpen(true)}
            className="flex items-center gap-2.5 min-w-0 rounded-xl p-1 -ml-1 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
            aria-label="Otvoriť nastavenia"
          >
            <div
              className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)",
                boxShadow:
                  "0 0 0 1px rgba(6,182,212,0.25), 0 8px 20px -8px rgba(6,182,212,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              <Sparkles
                className="w-[15px] h-[15px] sm:w-4 sm:h-4 text-white"
                strokeWidth={2.25}
              />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <div className="flex items-baseline gap-1.5">
                <h1 className="text-[15px] sm:text-base font-semibold text-white tracking-[-0.01em] truncate">
                  ChatCipiky
                </h1>
                <span
                  className="flex-shrink-0 text-[9px] font-bold tracking-[0.08em] px-1.5 py-[3px] rounded-md text-cyan-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(6,182,212,0.18) 0%, rgba(16,185,129,0.12) 100%)",
                    boxShadow:
                      "inset 0 0 0 1px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  PRO
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[10.5px] text-white/40 leading-none mt-0.5 truncate">
                {hasKey && providerInfo ? (
                  <>
                    <span
                      aria-hidden
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: providerInfo.accent }}
                    />
                    <span className="truncate">
                      {providerInfo.shortName} · {currentModel}
                    </span>
                  </>
                ) : (
                  "Pripojte AI providera"
                )}
              </span>
            </div>
          </button>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleNewChat}
              aria-label="Nový chat"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors"
            >
              <PenSquare className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setToolsOpen(true)}
              aria-label="Nástroje a nastavenia"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors"
            >
              <MoreHorizontal className="w-[20px] h-[20px]" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        {/* Hairline divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </header>

      {/* ─────────── CHAT AREA / EMPTY STATE ─────────── */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide">
        {isEmpty ? (
          <div className="min-h-full flex flex-col items-center justify-center px-6 py-10">
            <div className="w-full max-w-[420px] mx-auto flex flex-col items-center text-center">
              {/* Premium glyph */}
              <div className="relative mb-7 sm:mb-8">
                <div
                  aria-hidden
                  className="absolute inset-0 -m-6 rounded-full blur-2xl opacity-70"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)",
                  }}
                />
                <div
                  className="relative w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-[22px] flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)",
                    boxShadow:
                      "0 0 0 1px rgba(6,182,212,0.3), 0 20px 50px -12px rgba(6,182,212,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  <Sparkles
                    className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                    strokeWidth={2}
                  />
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-[26px] sm:text-[32px] font-semibold text-white leading-[1.1] tracking-[-0.02em] text-balance">
                {hasKey ? "Rád ťa vidím." : "Pripojme AI."}
              </h2>
              <p className="mt-3 sm:mt-3.5 text-[14px] sm:text-[15px] leading-relaxed text-white/50 max-w-[320px] text-pretty">
                {hasKey
                  ? "Váš priestor pre kreativitu a inteligenciu."
                  : "Vložte ľubovoľný API kľúč — OpenAI, Anthropic, Mistral, Groq, Google alebo xAI. Zvyšok zariadime."}
              </p>

              {/* CTA when no key */}
              {!hasKey && settingsLoaded && (
                <button
                  type="button"
                  onClick={() => setToolsOpen(true)}
                  className="mt-7 inline-flex items-center gap-2 h-11 px-5 rounded-full text-[14px] font-semibold text-white transition-transform active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #0891b2 60%, #10b981 100%)",
                    boxShadow:
                      "0 0 0 1px rgba(6,182,212,0.35), 0 12px 30px -8px rgba(6,182,212,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  <KeyRound className="w-4 h-4" strokeWidth={2} />
                  Zadať API kľúč
                </button>
              )}

              {/* Suggestion chips (only when key is set) */}
              {hasKey && (
                <div className="mt-8 sm:mt-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => handleSend(`${s.title} — ${s.subtitle}`)}
                      className="group text-left p-3 sm:p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
                    >
                      <div className="text-[13px] sm:text-[13.5px] font-medium text-white/90 leading-snug">
                        {s.title}
                      </div>
                      <div className="mt-0.5 text-[12px] text-white/40 leading-snug">
                        {s.subtitle}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-5 py-6 sm:py-8">
            <div className="flex flex-col gap-5 sm:gap-6 max-w-[560px] mx-auto">
              {messages.map((m) => (
                <MessageRow
                  key={m.id}
                  role={m.role}
                  text={getMessageText(m)}
                  streaming={
                    isStreaming &&
                    m === messages[messages.length - 1] &&
                    m.role === "assistant"
                  }
                />
              ))}
              {isStreaming &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <TypingIndicator />
                )}
              {error && (
                <ErrorBanner
                  message={error.message || "Nastala chyba."}
                  onOpenSettings={() => setToolsOpen(true)}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* ─────────── COMPOSER ─────────── */}
      <div className="relative z-10 flex-shrink-0 pb-safe">
        <div className="px-3 sm:px-4 pt-2 pb-3 sm:pb-4">
          <div
            className="relative rounded-[26px] sm:rounded-[28px]"
            style={{
              background: "rgba(255,255,255,0.03)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 40px -20px rgba(0,0,0,0.6)",
            }}
          >
            {/* Soft accent glow underneath when typing */}
            {(hasInput || isStreaming) && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[26px] sm:rounded-[28px] opacity-100 transition-opacity duration-500"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px rgba(6,182,212,0.25), 0 0 40px -8px rgba(6,182,212,0.25)",
                }}
              />
            )}

            <div className="relative flex flex-col px-1.5 pt-1.5 pb-1.5">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  hasKey
                    ? `Opýtaj sa čokoľvek${providerInfo ? ` (${providerInfo.shortName})` : ""}…`
                    : "Najprv vložte ľubovoľný API kľúč v Nástrojoch…"
                }
                rows={1}
                disabled={!settingsLoaded}
                className="w-full bg-transparent text-white placeholder:text-white/35 text-[15px] sm:text-[15.5px] leading-[1.5] resize-none outline-none px-3.5 sm:px-4 pt-3 pb-1.5 min-h-[44px] max-h-[140px] disabled:opacity-50"
              />

              {/* Bottom row */}
              <div className="flex items-center justify-between px-1.5 pb-1">
                {/* Left actions */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Pridať prílohu"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors"
                  >
                    <Plus className="w-[20px] h-[20px]" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToolsOpen(true)}
                    aria-label="Nástroje"
                    className={`h-10 px-3 rounded-full flex items-center gap-1.5 transition-colors ${
                      hasKey
                        ? "text-white/65 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1]"
                        : "text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/15"
                    }`}
                  >
                    <SlidersHorizontal
                      className="w-[16px] h-[16px]"
                      strokeWidth={1.75}
                    />
                    <span className="text-[13px] font-medium">Nástroje</span>
                  </button>
                </div>

                {/* Right action: Mic / Send / Stop */}
                <div className="flex items-center">
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={() => stop()}
                      aria-label="Zastaviť"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/15 active:scale-95 transition-all duration-200"
                      style={{
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
                      }}
                    >
                      <span className="w-3 h-3 rounded-[3px] bg-white" />
                    </button>
                  ) : !hasInput ? (
                    <button
                      type="button"
                      aria-label="Hlasový vstup"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors"
                    >
                      <Mic className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSend(inputValue)}
                      aria-label="Odoslať"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #0891b2 60%, #10b981 100%)",
                        boxShadow:
                          "0 0 0 1px rgba(6,182,212,0.35), 0 8px 20px -6px rgba(6,182,212,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[11px] text-white/30 mt-2.5 tracking-tight">
            Poháňané{" "}
            <span className="text-white/45 font-medium">
              {providerInfo ? providerInfo.name : "AI"}
            </span>{" "}
            · ChatCipiky PRO môže robiť chyby.
          </p>
        </div>
      </div>

      {/* Tools / Settings Sheet */}
      <ToolsSheet
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onClear={handleClearSettings}
      />
    </div>
  )
}

/* ─────────── Subcomponents ─────────── */

function MessageRow({
  role,
  text,
  streaming,
}: {
  role: "user" | "assistant" | "system"
  text: string
  streaming: boolean
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-[20px] rounded-br-[8px] text-[15px] leading-[1.5] text-white whitespace-pre-wrap break-words"
          style={{
            background: "rgba(255,255,255,0.06)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {text}
        </div>
      </div>
    )
  }

  if (role === "system") return null

  return (
    <div className="flex items-start gap-3">
      <div
        className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)",
          boxShadow:
            "0 0 0 1px rgba(6,182,212,0.3), 0 6px 16px -6px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <Sparkles className="w-[12px] h-[12px] text-white" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-[11px] font-medium text-white/40 mb-1 tracking-wide">
          ChatCipiky
        </div>
        <div className="text-[15px] leading-[1.6] text-white/90 text-pretty whitespace-pre-wrap break-words">
          {text}
          {streaming && (
            <span
              className="inline-block w-[7px] h-[15px] ml-0.5 -mb-0.5 bg-cyan-400 rounded-[1px]"
              style={{ animation: "ccCursor 1s steps(2) infinite" }}
            />
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes ccCursor {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)",
          boxShadow:
            "0 0 0 1px rgba(6,182,212,0.3), 0 6px 16px -6px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <Sparkles className="w-[12px] h-[12px] text-white" strokeWidth={2.25} />
      </div>
      <div className="flex items-center gap-1.5 pt-2.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-[6px] h-[6px] rounded-full bg-white/50"
            style={{
              animation: "ccDot 1.3s ease-in-out infinite",
              animationDelay: `${i * 160}ms`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes ccDot {
          0%,
          80%,
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  )
}

function ErrorBanner({
  message,
  onOpenSettings,
}: {
  message: string
  onOpenSettings: () => void
}) {
  const isAuth =
    message.toLowerCase().includes("api") ||
    message.toLowerCase().includes("kľúč") ||
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("401")
  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-2xl"
      style={{
        background: "rgba(248,113,113,0.06)",
        boxShadow: "inset 0 0 0 1px rgba(248,113,113,0.18)",
      }}
    >
      <AlertCircle
        className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0"
        strokeWidth={2}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-red-200/90 leading-relaxed">{message}</p>
        {isAuth && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="mt-2 text-[12px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Otvoriť Nástroje →
          </button>
        )}
      </div>
    </div>
  )
}
