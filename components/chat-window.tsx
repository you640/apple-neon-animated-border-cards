"use client"

import { useState, useRef, useEffect } from "react"
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
      content: "Welcome to ChatCipiky PRO. I&apos;m your premium AI assistant, ready to help.",
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
        "The interface uses frosted translucent surfaces with subtle blur effects, elegant reflections, and soft inner glow—creating a premium, calming experience.",
      sender: "assistant",
      timestamp: new Date(Date.now() - 60000),
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
        content:
          "That&apos;s a great question. I&apos;m continuously learning to provide better assistance.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative w-full h-[100dvh] max-w-[720px] mx-auto p-3 sm:p-5 pt-safe">
      {/* Premium chat container */}
      <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
        {/* Frosted glass background */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent backdrop-blur-xl" />

        {/* Subtle top accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-96 bg-gradient-to-b from-cyan-500/5 to-transparent blur-3xl rounded-b-full pointer-events-none" />

        {/* Premium border */}
        <div className="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none" />

        {/* Inner frosted shadow */}
        <div
          className="absolute inset-0 rounded-[2rem] pointer-events-none"
          style={{
            boxShadow:
              "inset 0 1px 3px rgba(255,255,255,0.08), inset 0 0 1px rgba(255,255,255,0.04), 0 20px 60px -20px rgba(0,0,0,0.6)",
          }}
        />

        {/* Main content container */}
        <div className="relative h-full flex flex-col">
          {/* Premium header with branding */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-md">
            {/* Left: Logo and branding */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 relative">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                    boxShadow: "0 8px 24px rgba(6, 182, 212, 0.25)",
                  }}
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white leading-tight">
                  ChatCipiky
                </h1>
                <p className="text-[11px] text-white/40 leading-tight">PRO</p>
              </div>
            </div>

            {/* Right: Quick actions */}
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors duration-200"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 text-white/60 hover:text-white/80" />
              </button>
              <button
                className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors duration-200"
                aria-label="Help"
              >
                <HelpCircle className="w-4 h-4 text-white/60 hover:text-white/80" />
              </button>
            </div>
          </div>

          {/* Hero section when no messages - not shown since we have messages */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                  boxShadow: "0 12px 40px rgba(6, 182, 212, 0.2)",
                }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2 text-center">
                Welcome to ChatCipiky PRO
              </h2>
              <p className="text-sm text-white/50 text-center max-w-xs">
                Experience premium AI conversations with a refined interface
              </p>
            </div>
          )}

          {/* Messages container */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10">
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
                      className="max-w-[75%] px-4 py-3 text-sm leading-relaxed text-white rounded-2xl rounded-br-md border border-white/10"
                      style={{
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, rgba(6, 182, 212, 0.4) 100%)",
                        boxShadow:
                          "0 8px 32px rgba(6, 182, 212, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      {message.content}
                    </div>
                  ) : (
                    // Assistant message - frosted glass only
                    <div
                      className="max-w-[75%] px-4 py-3 text-sm leading-relaxed text-white/90 rounded-2xl rounded-bl-md border border-white/8"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                        boxShadow:
                          "inset 0 1px 2px rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.3)",
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
                    className="px-4 py-3 rounded-2xl rounded-bl-md border border-white/8"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full bg-cyan-400"
                        style={{
                          animation: "pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          animationDelay: "0ms",
                        }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-cyan-400"
                        style={{
                          animation: "pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          animationDelay: "200ms",
                        }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-cyan-400"
                        style={{
                          animation: "pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
          <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-white/[0.06] bg-gradient-to-t from-white/[0.01] to-transparent backdrop-blur-sm">
            <div
              className="rounded-xl border border-white/8 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.05), 0 8px 24px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="flex flex-col p-3 gap-3">
                {/* Text input */}
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent text-white placeholder-white/35 text-sm resize-none outline-none px-1 py-2 min-h-[32px] max-h-[100px] font-medium"
                  rows={1}
                />

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  {/* Left actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors duration-200"
                      aria-label="Add file"
                    >
                      <Plus className="w-4 h-4 text-white/60 hover:text-white/80" />
                    </button>

                    {/* Encrypted badge */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                      <Lock className="w-3 h-3 text-white/50" />
                      <span className="text-[10px] text-white/40 font-medium">
                        Encrypted
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors duration-200"
                      aria-label="Voice input"
                    >
                      <Mic className="w-4 h-4 text-white/60 hover:text-white/80" />
                    </button>

                    {/* Premium send button */}
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: inputValue.trim()
                          ? "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)"
                          : "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                        boxShadow: inputValue.trim()
                          ? "0 6px 20px rgba(6, 182, 212, 0.35)"
                          : "0 2px 8px rgba(6, 182, 212, 0.15)",
                      }}
                      aria-label="Send message"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-[10px] text-white/30 text-center mt-2">
              ChatCipiky PRO • Premium Encrypted AI
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
