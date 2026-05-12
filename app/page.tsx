"use client"

import { ChatWindow } from "@/components/chat-window"

export default function Home() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background with subtle radial gradients */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(0, 255, 255, 0.03) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(128, 0, 255, 0.03) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(0, 128, 255, 0.02) 0%, transparent 60%), #050507",
        }}
      />
      
      {/* Ambient glow spots */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)" }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(128, 0, 255, 0.3) 0%, transparent 70%)" }}
      />

      <ChatWindow />
    </main>
  )
}
