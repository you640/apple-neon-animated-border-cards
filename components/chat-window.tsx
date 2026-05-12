"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import {
  Send,
  Mic,
  Plus,
  Sparkles,
  MessageSquare,
  Settings,
  HelpCircle,
  Lock,
} from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Welcome to ChatCipiky PRO. I'm your premium AI assistant, ready to help.",
      sender: "assistant",
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: "2",
      content: "How does the frozen glass aesthetic work?",
      sender: "user",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "3",
      content:
        "The interface uses frosted translucent surfaces with subtle blur effects, elegant reflections, and a soft inner glow — creating a premium, calming experience.",
      sender: "assistant",
      timestamp: new Date(Date.now() - 60000),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [inputValue])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
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
          "That's a great question. I'm continuously learning to provide better assistance.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1600)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative w-full h-dvh max-w-[820px] mx-auto flex flex-col px-3 pt-3 pb-3 sm:px-5 sm:pt-5 sm:pb-5 pl-safe pr-safe pt-safe pb-safe">
      {/* Premium chat container */}
      <div className="relative flex-1 min-h-0 w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
        {/* Frosted glass background */}
        <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-b from-white/[0.04] via-white/[0.015] to-transparent backdrop-blur-xl" />

        {/* Subtle top accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-72 sm:h-96 bg-gradient-to-b from-cyan-500/[0.08] to-transparent blur-3xl rounded-b-full pointer-events-none" />

        {/* Premium border */}
        <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 pointer-events-none" />

        {/* Inner frosted shadow */}
        <div
          className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] pointer-events-none"
          style={{
            boxShadow:
              "inset 0 1px 3px rgba(255,255,255,0.08), inset 0 0 1px rgba(255,255,255,0.04), 0 20px 60px -20px rgba(0,0,0,0.6)",
          }}
        />

        {/* Main content container */}
        <div className="relative h-full flex flex-col">
          {/* Premium header with branding */}
          <header className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 h-14 sm:h-16 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-md">
            {/* Left: Logo and branding */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex-shrink-0 relative">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                    boxShadow:
                      "0 8px 24px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
                  }}
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0d]" />
              </div>
              <div className="min-w-0 flex items-baseline gap-1.5 sm:gap-2">
                <h1 className="text-[15px] sm:text-base font-semibold text-white leading-tight tracking-tight truncate">
                  ChatCipiky
                </h1>
                <span
                  className="flex-shrink-0 text-[9px] sm:text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-md border border-cyan-400/30 text-cyan-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)",
                  }}
                >
                  PRO
                </span>
              </div>
            </div>

            {/* Right: Quick actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-white/5 flex items-center justify-center transition-colors duration-200"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white/60" />
              </button>
              <button
                type="button"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] border border-white/5 flex items-center justify-center transition-colors duration-200"
                aria-label="Help"
              >
                <HelpCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white/60" />
              </button>
            </div>
          </header>

          {/* Hero section (when no messages) */}
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-5"
                style={{
                  background:
                    "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                  boxShadow:
                    "0 12px 40px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 tracking-tight">
                Welcome to ChatCipiky PRO
              </h2>
              <p className="text-[13px] sm:text-sm text-white/50 max-w-xs leading-relaxed text-pretty">
                Experience premium AI conversations with a refined, calm interface.
              </p>
            </div>
          ) : (
            /* Messages container */
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 sm:py-5 space-y-3 sm:space-y-4 scrollbar-hide">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "user" ? (
                    // User message - gradient frosted glass
                    <div
                      className="max-w-[85%] sm:max-w-[75%] px-3.5 sm:px-4 py-2.5 sm:py-3 text-[14px] sm:text-[15px] leading-relaxed text-white rounded-2xl rounded-br-md border border-white/10"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(6, 182, 212, 0.55) 100%)",
                        boxShadow:
                          "0 8px 32px rgba(6, 182, 212, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.22)",
                      }}
                    >
                      {message.content}
                    </div>
                  ) : (
                    // Assistant message - frosted glass only
                    <div
                      className="max-w-[85%] sm:max-w-[75%] px-3.5 sm:px-4 py-2.5 sm:py-3 text-[14px] sm:text-[15px] leading-relaxed text-white/90 rounded-2xl rounded-bl-md border border-white/10"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                        boxShadow:
                          "inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {message.content}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-md border border-white/10"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                        style={{
                          animation:
                            "ccPulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          animationDelay: "0ms",
                        }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                        style={{
                          animation:
                            "ccPulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          animationDelay: "200ms",
                        }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                        style={{
                          animation:
                            "ccPulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          animationDelay: "400ms",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Premium composer */}
          <div className="flex-shrink-0 px-3 sm:px-5 pb-3 sm:pb-4 pt-2 sm:pt-3 border-t border-white/[0.06] bg-gradient-to-t from-white/[0.02] to-transparent backdrop-blur-sm">
            <div
              className="rounded-2xl border border-white/10 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.06), 0 8px 24px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="flex flex-col p-2.5 sm:p-3 gap-2 sm:gap-2.5">
                {/* Text input */}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  rows={1}
                  className="w-full bg-transparent text-white placeholder-white/35 text-[15px] sm:text-[15px] resize-none outline-none px-1.5 py-1.5 min-h-[28px] max-h-[120px] leading-relaxed"
                />

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-2">
                  {/* Left actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <button
                      type="button"
                      className="flex-shrink-0 w-9 h-9 sm:w-9 sm:h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/5 flex items-center justify-center transition-colors duration-200"
                      aria-label="Add attachment"
                    >
                      <Plus className="w-[18px] h-[18px] text-white/65" />
                    </button>

                    {/* Encrypted badge */}
                    <div className="hidden xs:flex items-center gap-1.5 px-2 h-9 rounded-xl bg-white/[0.025] border border-white/5">
                      <Lock className="w-3 h-3 text-emerald-400/70" />
                      <span className="text-[10px] sm:text-[11px] text-white/50 font-medium tracking-wide">
                        Encrypted
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      className="w-9 h-9 sm:w-9 sm:h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/5 flex items-center justify-center transition-colors duration-200"
                      aria-label="Voice input"
                    >
                      <Mic className="w-[18px] h-[18px] text-white/65" />
                    </button>

                    {/* Premium send button */}
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="w-10 h-10 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                        boxShadow: inputValue.trim()
                          ? "0 8px 24px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255,255,255,0.25)"
                          : "0 2px 8px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
                      }}
                      aria-label="Send message"
                    >
                      <Send className="w-[16px] h-[16px] text-white -translate-x-px" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-[10px] sm:text-[11px] text-white/30 text-center mt-2 sm:mt-2.5 tracking-wide">
              ChatCipiky PRO · Premium Encrypted AI
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ccPulse {
          0%,
          100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-1px);
          }
        }
      `}</style>
    </div>
  )
}
