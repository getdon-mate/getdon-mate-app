import { uiColors } from "@shared/ui"

describe("theme palette", () => {
  test("uses the redesigned cobalt and white semantic palette", () => {
    expect(uiColors.background).toBe("#ffffff")
    expect(uiColors.surface).toBe("#ffffff")
    expect(uiColors.primary).toBe("#4f5fff")
    expect(uiColors.primarySoft).toBe("#eef0ff")
    expect(uiColors.accent).toBe("#cbb8ff")
    expect(uiColors.warning).toBe("#b9781f")
  })
})
