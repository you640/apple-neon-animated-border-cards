"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import {
  ArrowUp,
  Mic,
  Plus,
  Sparkles,
  SlidersHorizontal,
  MoreHorizontal,
  PenSquare,
} from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

const SUGGESTIONS = [
  { title: "Napíš mi krátku báseň", subtitle: "o tichu a oceáne" },
  { title: "Vysvetli kvantovú fyziku", subtitle: "ako mám 12 rokov" },
  { title: "Naplánuj víkend v Prahe", subtitle: "pre dvoch, ideálne počasie" },
  { title: "Sumarizuj môj e-mail", subtitle: "v troch bodoch" },
]

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [inputValue])

  const sendMessage = (content: string) => {
    if (!content.trim()) return
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Som ChatCipiky PRO. Rád ti pomôžem — pokojne sa pýtaj na čokoľvek, od kreatívneho písania až po komplexné analýzy.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1400)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const hasInput = inputValue.trim().length > 0
  const isEmpty = messages.length === 0

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
          <div className="flex items-center gap-2.5 min-w-0">
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
            <div className="flex items-baseline gap-1.5 min-w-0">
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
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Nový chat"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors"
            >
              <PenSquare className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Viac"
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
                Rád ťa vidím.
              </h2>
              <p className="mt-3 sm:mt-3.5 text-[14px] sm:text-[15px] leading-relaxed text-white/50 max-w-[300px] text-pretty">
                Váš priestor pre kreativitu a inteligenciu.
              </p>

              {/* Suggestion chips */}
              <div className="mt-8 sm:mt-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => sendMessage(`${s.title} — ${s.subtitle}`)}
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
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-5 py-6 sm:py-8">
            <div className="flex flex-col gap-5 sm:gap-6 max-w-[560px] mx-auto">
              {messages.map((m) => (
                <MessageRow key={m.id} message={m} />
              ))}
              {isTyping && <TypingIndicator />}
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
            {hasInput && (
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
                placeholder="Opýtaj sa čokoľvek…"
                rows={1}
                className="w-full bg-transparent text-white placeholder:text-white/35 text-[15px] sm:text-[15.5px] leading-[1.5] resize-none outline-none px-3.5 sm:px-4 pt-3 pb-1.5 min-h-[44px] max-h-[140px]"
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
                    aria-label="Nástroje"
                    className="h-10 px-3 rounded-full flex items-center gap-1.5 text-white/65 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors"
                  >
                    <SlidersHorizontal
                      className="w-[16px] h-[16px]"
                      strokeWidth={1.75}
                    />
                    <span className="text-[13px] font-medium">Nástroje</span>
                  </button>
                </div>

                {/* Right action: Mic or Send */}
                <div className="flex items-center">
                  {!hasInput ? (
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
                      onClick={() => sendMessage(inputValue)}
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
            ChatCipiky PRO môže robiť chyby. Skontrolujte dôležité informácie.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────── Subcomponents ─────────── */

function MessageRow({ message }: { message: Message }) {
  if (message.sender === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-[20px] rounded-br-[8px] text-[15px] leading-[1.5] text-white"
          style={{
            background: "rgba(255,255,255,0.06)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {message.content}
        </div>
      </div>
    )
  }

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
        <div className="text-[15px] leading-[1.55] text-white/90 text-pretty">
          {message.content}
        </div>
      </div>
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
