import "@testing-library/jest-dom/vitest"
import { afterEach, beforeEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// Always clean up between tests
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

// JSDOM/happy-dom polyfills
beforeEach(() => {
  // smooth scrollIntoView used in ChatWindow
  if (!("scrollIntoView" in Element.prototype)) {
    // happy-dom may not implement scrollIntoView in all versions
    ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView =
      function () {}
  }
})

// Stable, non-crypto IDs for messages
let _idCounter = 0
if (typeof globalThis.crypto === "undefined") {
  // happy-dom usually provides this, but guard anyway
  // @ts-expect-error - assign minimal polyfill
  globalThis.crypto = {}
}
if (!("randomUUID" in globalThis.crypto)) {
  // @ts-expect-error - polyfill
  globalThis.crypto.randomUUID = () =>
    `test-id-${++_idCounter}-${Math.random().toString(36).slice(2, 9)}`
}
