import * as Clipboard from "expo-clipboard"

export async function copyText(value: string) {
  try {
    await Clipboard.setStringAsync(value)
    return true
  } catch {
    const browserClipboard = globalThis.navigator?.clipboard
    if (!browserClipboard?.writeText) {
      return false
    }

    try {
      await browserClipboard.writeText(value)
      return true
    } catch {
      return false
    }
  }
}
