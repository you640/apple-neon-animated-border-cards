import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

/**
 * We mock `@ai-sdk/mistral` and `ai` so the route can be tested
 * without any network calls or real model SDK behaviour.
 *
 * The route under test (app/api/chat/route.ts) calls:
 *   - createMistral({ apiKey })
 *   - convertToModelMessages(messages)
 *   - streamText({ model, system, messages, temperature })
 *   - result.toUIMessageStreamResponse({ onError })
 *
 * We capture those calls and return a controllable fake Response.
 */

const captured = {
  createMistralArgs: undefined as undefined | { apiKey: string },
  modelFactoryArg: undefined as undefined | string,
  streamTextArgs: undefined as undefined | Record<string, unknown>,
  convertToModelMessagesCalled: false,
  toUIMessageStreamResponseArgs: undefined as undefined | Record<string, unknown>,
  shouldStreamTextThrow: false,
}

vi.mock("@ai-sdk/mistral", () => {
  return {
    createMistral: vi.fn((opts: { apiKey: string }) => {
      captured.createMistralArgs = opts
      return (modelId: string) => {
        captured.modelFactoryArg = modelId
        return { __kind: "mock-mistral-model", modelId }
      }
    }),
  }
})

vi.mock("ai", () => {
  return {
    convertToModelMessages: vi.fn(async (messages: unknown[]) => {
      captured.convertToModelMessagesCalled = true
      return messages.map((m: any) => ({
        role: m.role,
        content:
          Array.isArray(m.parts) && m.parts.length
            ? m.parts.map((p: any) => p.text).join("")
            : m.content ?? "",
      }))
    }),
    streamText: vi.fn((args: Record<string, unknown>) => {
      captured.streamTextArgs = args
      return {
        toUIMessageStreamResponse: (opts?: Record<string, unknown>) => {
          captured.toUIMessageStreamResponseArgs = opts
          if (captured.shouldStreamTextThrow) {
            // Simulate an error path by letting `onError` produce a string
            const onError = opts?.onError as
              | ((err: unknown) => string)
              | undefined
            const message = onError
              ? onError(new Error("Unauthorized — invalid api key (401)"))
              : "stream error"
            return new Response(JSON.stringify({ error: message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            })
          }
          // Happy-path: return a streaming-style Response
          const body = new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: {"type":"text-delta","delta":"Hello"}\n\n`,
                ),
              )
              controller.close()
            },
          })
          return new Response(body, {
            status: 200,
            headers: { "Content-Type": "text/event-stream" },
          })
        },
      }
    }),
  }
})

// Import AFTER mocks so the route picks up the mocked modules.
import { POST } from "@/app/api/chat/route"

function makeRequest(opts: {
  body?: unknown
  apiKey?: string | null
  rawBody?: string
}) {
  const headers = new Headers()
  if (opts.apiKey !== null && opts.apiKey !== undefined) {
    headers.set("x-mistral-api-key", opts.apiKey)
  }
  headers.set("Content-Type", "application/json")
  const body =
    opts.rawBody !== undefined ? opts.rawBody : JSON.stringify(opts.body ?? {})
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers,
    body,
  })
}

function userMessage(text: string) {
  return {
    id: "u1",
    role: "user",
    parts: [{ type: "text", text }],
  }
}

describe("/api/chat — integrity & integration", () => {
  beforeEach(() => {
    captured.createMistralArgs = undefined
    captured.modelFactoryArg = undefined
    captured.streamTextArgs = undefined
    captured.convertToModelMessagesCalled = false
    captured.toUIMessageStreamResponseArgs = undefined
    captured.shouldStreamTextThrow = false
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("authentication", () => {
    it("returns 401 when x-mistral-api-key header is missing", async () => {
      const res = await POST(
        makeRequest({ apiKey: null, body: { messages: [userMessage("hi")] } }),
      )
      expect(res.status).toBe(401)
      const json = await res.json()
      expect(json.error).toMatch(/Mistral API kľúč/i)
      expect(captured.createMistralArgs).toBeUndefined()
    })

    it("returns 401 when x-mistral-api-key header is empty/whitespace", async () => {
      const res = await POST(
        makeRequest({ apiKey: "   ", body: { messages: [userMessage("hi")] } }),
      )
      expect(res.status).toBe(401)
    })

    it("trims the API key before forwarding to createMistral", async () => {
      const res = await POST(
        makeRequest({
          apiKey: "   sk-good-key-1234567890   ",
          body: { messages: [userMessage("ahoj")] },
        }),
      )
      expect(res.status).toBe(200)
      expect(captured.createMistralArgs?.apiKey).toBe("sk-good-key-1234567890")
    })
  })

  describe("request validation", () => {
    it("returns 400 when messages array is missing", async () => {
      const res = await POST(
        makeRequest({ apiKey: "sk-test-key-xyz", body: {} }),
      )
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toMatch(/správy/i)
    })

    it("returns 400 when messages is an empty array", async () => {
      const res = await POST(
        makeRequest({ apiKey: "sk-test-key-xyz", body: { messages: [] } }),
      )
      expect(res.status).toBe(400)
    })

    it("returns 400 when messages is not an array", async () => {
      const res = await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz",
          body: { messages: "not-an-array" },
        }),
      )
      expect(res.status).toBe(400)
    })

    it("returns 500 on malformed JSON body", async () => {
      const res = await POST(
        makeRequest({ apiKey: "sk-test-key-xyz", rawBody: "{not-json" }),
      )
      expect(res.status).toBe(500)
    })
  })

  describe("happy path", () => {
    it("streams a 200 response with the default model", async () => {
      const res = await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("Povedz ahoj.")] },
        }),
      )
      expect(res.status).toBe(200)
      expect(captured.modelFactoryArg).toBe("mistral-large-latest")
      expect(captured.convertToModelMessagesCalled).toBe(true)
      expect(captured.streamTextArgs?.system).toBeTruthy()
      expect((captured.streamTextArgs?.system as string).length).toBeGreaterThan(
        10,
      )
    })

    it("uses the model from the request body when provided", async () => {
      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: {
            messages: [userMessage("kód")],
            model: "codestral-latest",
          },
        }),
      )
      expect(captured.modelFactoryArg).toBe("codestral-latest")
    })

    it("uses provided systemPrompt instead of default", async () => {
      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: {
            messages: [userMessage("hi")],
            systemPrompt: "Si pirát. Odpovedaj ako pirát.",
          },
        }),
      )
      expect(captured.streamTextArgs?.system).toBe(
        "Si pirát. Odpovedaj ako pirát.",
      )
    })

    it("falls back to default systemPrompt when empty/whitespace", async () => {
      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("hi")], systemPrompt: "   " },
        }),
      )
      expect((captured.streamTextArgs?.system as string)).toMatch(
        /ChatCipiky/i,
      )
    })

    it("clamps temperature to [0, 1.5]", async () => {
      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("hi")], temperature: 99 },
        }),
      )
      expect(captured.streamTextArgs?.temperature).toBe(1.5)

      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("hi")], temperature: -5 },
        }),
      )
      expect(captured.streamTextArgs?.temperature).toBe(0)

      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("hi")], temperature: 0.5 },
        }),
      )
      expect(captured.streamTextArgs?.temperature).toBe(0.5)
    })

    it("returns an SSE-style streaming response", async () => {
      const res = await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("ahoj")] },
        }),
      )
      expect(res.headers.get("Content-Type")).toMatch(/event-stream/)
      expect(res.body).toBeTruthy()
    })

    it("converts UIMessages via convertToModelMessages (with await support)", async () => {
      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("merge"), userMessage("test")] },
        }),
      )
      expect(captured.convertToModelMessagesCalled).toBe(true)
      // The route awaits convertToModelMessages — the result should be plain ModelMessages
      const passed = captured.streamTextArgs?.messages as Array<{
        role: string
        content: string
      }>
      expect(Array.isArray(passed)).toBe(true)
      expect(passed[0]).toMatchObject({ role: "user", content: "merge" })
      expect(passed[1]).toMatchObject({ role: "user", content: "test" })
    })
  })

  describe("error handling", () => {
    it("provides an onError handler that translates 401 errors", async () => {
      captured.shouldStreamTextThrow = true
      const res = await POST(
        makeRequest({
          apiKey: "sk-bad-key-1234",
          body: { messages: [userMessage("hi")] },
        }),
      )
      // Our mock turns the error into a JSON response with the translated message
      expect(res.status).toBe(500)
      const text = await res.text()
      expect(text).toMatch(/Neplatný Mistral API kľúč/i)
    })

    it("registers an onError callback on toUIMessageStreamResponse", async () => {
      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("hi")] },
        }),
      )
      expect(
        typeof captured.toUIMessageStreamResponseArgs?.onError,
      ).toBe("function")
    })

    it("onError translates rate-limit messages to Slovak", async () => {
      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("hi")] },
        }),
      )
      const onError = captured.toUIMessageStreamResponseArgs?.onError as (
        e: unknown,
      ) => string
      expect(onError(new Error("rate limit exceeded"))).toMatch(/limit/i)
      expect(onError(new Error("rate limit exceeded"))).toMatch(/skúste/i)
    })

    it("onError falls back to a generic Slovak message for unknown errors", async () => {
      await POST(
        makeRequest({
          apiKey: "sk-test-key-xyz-aaaaaaaa",
          body: { messages: [userMessage("hi")] },
        }),
      )
      const onError = captured.toUIMessageStreamResponseArgs?.onError as (
        e: unknown,
      ) => string
      expect(onError("not an error object")).toMatch(/neočakávaná|chyba/i)
    })
  })

  describe("module integrity", () => {
    it("exports a maxDuration value", async () => {
      const mod = await import("@/app/api/chat/route")
      expect(typeof mod.maxDuration).toBe("number")
      expect(mod.maxDuration).toBeGreaterThan(0)
    })

    it("exports a POST handler function", async () => {
      const mod = await import("@/app/api/chat/route")
      expect(typeof mod.POST).toBe("function")
    })
  })
})
