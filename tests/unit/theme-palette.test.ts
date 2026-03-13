import { uiColors } from "@shared/ui"

describe("theme palette", () => {
  test("uses the redesigned cobalt and off-white semantic palette", () => {
    expect(uiColors.background).toBe("#f6f4ef")
    expect(uiColors.surface).toBe("#fffdfa")
    expect(uiColors.primary).toBe("#4f5fff")
    expect(uiColors.primarySoft).toBe("#eef0ff")
    expect(uiColors.accent).toBe("#cbb8ff")
    expect(uiColors.warning).toBe("#b9781f")
  })
})
