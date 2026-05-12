"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Plus, Sparkles, X, Minus, Maximize2 } from "lucide-react"

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
      content: "Hello! How can I help you today?",
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

    // Simulate assistant response
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
    <div className="relative w-full max-w-[600px] h-[700px] min-h-[500px] p-[2px] rounded-3xl overflow-hidden group">
      {/* Animated neon border */}
      <span 
        className="absolute inset-[-200%] animate-[spin_6s_linear_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, #00ffff 0%, #0080ff 25%, #8000ff 50%, #ff00ff 75%, #00ffff 100%)",
        }}
      />
      
      {/* Secondary glow layer for depth */}
      <span 
        className="absolute inset-[-200%] animate-[spin_8s_linear_infinite_reverse] opacity-40 blur-sm"
        style={{
          background: "conic-gradient(from 180deg at 50% 50%, #ff00ff 0%, #00ffff 50%, #ff00ff 100%)",
        }}
      />

      {/* Outer glow effect */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 blur-xl -z-10"
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, #00ffff 0%, #0080ff 25%, #8000ff 50%, #ff00ff 75%, #00ffff 100%)",
          animation: "spin 6s linear infinite",
        }}
      />

      {/* Main window content */}
      <div 
        className="relative z-10 flex flex-col h-full w-full rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #0a0a0f 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* macOS-style title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-2">
            <button className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors" aria-label="Close">
              <X className="w-2 h-2 mx-auto opacity-0 hover:opacity-100 text-black/50" />
            </button>
            <button className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-colors" aria-label="Minimize">
              <Minus className="w-2 h-2 mx-auto opacity-0 hover:opacity-100 text-black/50" />
            </button>
            <button className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors" aria-label="Maximize">
              <Maximize2 className="w-1.5 h-1.5 mx-auto opacity-0 hover:opacity-100 text-black/50" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>NeonChat</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-b from-white/90 to-white/60 text-black">PRO</span>
          </div>
          
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0a0a0f]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">AI Assistant</h2>
              <p className="text-white/50 text-xs">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-md"
                    : "bg-white/5 text-white/90 border border-white/5 rounded-bl-md"
                }`}
                style={{
                  boxShadow: message.sender === "user" 
                    ? "0 4px 20px rgba(0, 200, 255, 0.2)" 
                    : "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4">
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div className="flex flex-col p-3 gap-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full bg-transparent text-white placeholder-white/40 text-sm resize-none outline-none min-h-[24px] max-h-[120px]"
                rows={1}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Add attachment"
                  >
                    <Plus className="w-4 h-4 text-white/70" />
                  </button>
                  
                  <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    </div>
                    <span>Tools</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Voice input"
                  >
                    <Mic className="w-4 h-4 text-white/70" />
                  </button>
                  
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      boxShadow: inputValue.trim() ? "0 4px 20px rgba(0, 200, 255, 0.4)" : "none",
                    }}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
