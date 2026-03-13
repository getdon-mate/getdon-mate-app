import { StyleSheet, Text, type TextStyle } from "react-native"
import { uiColors } from "../tokens"

const iconGlyph = {
  check: "✓",
  close: "✕",
  info: "i",
  warning: "!",
  plus: "+",
  minus: "−",
  chevronLeft: "‹",
  chevronRight: "›",
  settings: "⚙",
  user: "◉",
  bell: "🔔",
  refresh: "↻",
  logout: "↩",
  trash: "🗑",
  search: "⌕",
  sort: "⇅",
  closeCircle: "⊗",
} as const

export type IconName = keyof typeof iconGlyph

export function Icon({
  name,
  size = 16,
  color = uiColors.text,
  style,
}: {
  name: IconName
  size?: number
  color?: string
  style?: TextStyle | TextStyle[]
}) {
  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: size,
          color,
          lineHeight: size + 1,
        },
        style,
      ]}
      accessibilityLabel={`icon-${name}`}
    >
      {iconGlyph[name]}
    </Text>
  )
}

const styles = StyleSheet.create({
  base: {
    fontWeight: "700",
    textAlign: "center",
  },
})
