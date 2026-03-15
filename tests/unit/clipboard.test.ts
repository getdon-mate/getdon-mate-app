import * as Clipboard from "expo-clipboard"
import { copyText } from "@shared/lib/clipboard"

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(async () => undefined),
}))

describe("clipboard helper", () => {
  const setStringAsync = jest.mocked(Clipboard.setStringAsync)

  beforeEach(() => {
    setStringAsync.mockClear()
    Object.defineProperty(globalThis, "navigator", {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  test("uses expo clipboard when available", async () => {
    await expect(copyText("1234")).resolves.toBe(true)

    expect(setStringAsync).toHaveBeenCalledWith("1234")
  })

  test("falls back to browser clipboard when expo clipboard fails", async () => {
    const writeText = jest.fn(async () => undefined)
    setStringAsync.mockRejectedValueOnce(new Error("expo clipboard unavailable"))
    Object.defineProperty(globalThis, "navigator", {
      value: {
        clipboard: {
          writeText,
        },
      },
      configurable: true,
      writable: true,
    })

    await expect(copyText("5678")).resolves.toBe(true)

    expect(writeText).toHaveBeenCalledWith("5678")
  })

  test("returns false when no clipboard path is available", async () => {
    setStringAsync.mockRejectedValueOnce(new Error("expo clipboard unavailable"))

    await expect(copyText("9999")).resolves.toBe(false)
  })
})
