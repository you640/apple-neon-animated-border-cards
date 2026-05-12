"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Plus, Sparkles, Minus, Maximize2 } from "lucide-react"

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
      content: "Hello! I'm Aurora, your AI assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
    {
      id: "2",
      content: "Can you show me how the neon glow effect works?",
      sender: "user",
      timestamp: new Date(),
    },
    {
      id: "3",
      content:
        "Of course! The animated border uses a conic gradient that rotates smoothly, creating a vibrant neon halo around the window.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        content: "Thanks for your message! I'm here to assist you with anything you need.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative w-full max-w-[560px] mx-auto">
      {/* Outer bloom — sits behind the card, doesn't affect layout */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2.25rem] opacity-70 blur-2xl"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, #22d3ee 0%, #3b82f6 25%, #a855f7 50%, #ec4899 75%, #22d3ee 100%)",
          animation: "neon-spin 6s linear infinite",
        }}
      />

      {/* Card wrapper with animated gradient border */}
      <div className="relative rounded-[1.75rem] p-[1.5px] overflow-hidden">
        {/* Spinning conic gradient border */}
        <div
          aria-hidden
          className="absolute inset-[-50%]"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, #22d3ee 0%, #3b82f6 20%, #a855f7 40%, #ec4899 60%, #22d3ee 100%)",
            animation: "neon-spin 6s linear infinite",
          }}
        />

        {/* Inner card content */}
        <div
          className="relative flex flex-col rounded-[1.65rem] overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #0b0b12 0%, #0a0a10 50%, #08080d 100%)",
            height: "min(78vh, 640px)",
            minHeight: "480px",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.04), 0 30px 80px -20px rgba(34,211,238,0.15), 0 20px 60px -20px rgba(168,85,247,0.18)",
          }}
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <button
                className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all"
                aria-label="Close"
              />
              <button
                className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all"
                aria-label="Minimize"
              >
                <Minus className="w-2 h-2 mx-auto opacity-0 hover:opacity-100 text-black/60" />
              </button>
              <button
                className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all"
                aria-label="Maximize"
              >
                <Maximize2 className="w-1.5 h-1.5 mx-auto opacity-0 hover:opacity-100 text-black/60" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NeonChat</span>
            </div>

            <div className="w-14" />
          </div>

          {/* Header with avatar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                    boxShadow: "0 0 16px rgba(34,211,238,0.4)",
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0a0a10]" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm leading-tight">Aurora</h2>
                <p className="text-white/40 text-[11px] leading-tight">Online · AI Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="w-1 h-1 rounded-full bg-white/30" />
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "user" ? (
                  <div
                    className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed text-white rounded-2xl rounded-br-md"
                    style={{
                      background:
                        "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
                      boxShadow: "0 6px 24px -6px rgba(34,211,238,0.45)",
                    }}
                  >
                    {message.content}
                  </div>
                ) : (
                  <div
                    className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed text-white/90 rounded-2xl rounded-bl-md border border-white/[0.06]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                    }}
                  >
                    {message.content}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.03]">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="p-3">
            <div
              className="rounded-2xl border border-white/[0.06]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px -8px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex flex-col p-2.5 gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message…"
                  className="w-full bg-transparent text-white placeholder-white/35 text-sm resize-none outline-none px-2 py-1.5 min-h-[28px] max-h-[120px]"
                  rows={1}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                      aria-label="Add attachment"
                    >
                      <Plus className="w-4 h-4 text-white/70" />
                    </button>

                    <button className="flex items-center gap-1.5 px-1 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors">
                      <span className="relative w-4 h-4 rounded-full border border-cyan-400/80 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      </span>
                      <span>Tools</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                      aria-label="Voice input"
                    >
                      <Mic className="w-4 h-4 text-white/70" />
                    </button>

                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
                        boxShadow: inputValue.trim()
                          ? "0 4px 18px rgba(34,211,238,0.5)"
                          : "0 2px 8px rgba(34,211,238,0.15)",
                      }}
                      aria-label="Send message"
                    >
                      <Send className="w-3.5 h-3.5 text-white -translate-x-px translate-y-px" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes neon-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
