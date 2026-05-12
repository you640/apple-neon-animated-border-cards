import { ChatWindow } from "@/components/chat-window"

export default function Home() {
  return (
    <main className="h-[100dvh] w-full flex items-stretch justify-center bg-gradient-to-br from-slate-950 via-[#0a0a0d] to-black relative overflow-hidden">
      {/* Premium ambient glow elements */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-green-500/8 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl opacity-15 pointer-events-none" />

      <ChatWindow />
    </main>
  )
}
