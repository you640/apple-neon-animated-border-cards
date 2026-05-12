import { ChatWindow } from "@/components/chat-window"

export default function Home() {
  return (
    <main className="h-dvh w-full flex items-stretch justify-center bg-gradient-to-br from-slate-950 via-[#0a0a0d] to-black relative overflow-hidden">
      {/* Premium ambient glow elements */}
      <div className="absolute -top-20 left-1/4 w-[60vw] max-w-[420px] aspect-square bg-cyan-500/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-[70vw] max-w-[480px] aspect-square bg-emerald-500/[0.08] rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 -left-10 w-[50vw] max-w-[360px] aspect-square bg-cyan-500/[0.05] rounded-full blur-3xl opacity-20 pointer-events-none" />

      <ChatWindow />
    </main>
  )
}
