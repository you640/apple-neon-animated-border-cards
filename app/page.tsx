import { ChatWindow } from "@/components/chat-window"

export default function Home() {
  return (
    <main
      className="h-[100dvh] w-full flex items-stretch justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(34, 211, 238, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(168, 85, 247, 0.06) 0%, transparent 50%), #050507",
      }}
    >
      {/* Subtle grid pattern for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <ChatWindow />
    </main>
  )
}
