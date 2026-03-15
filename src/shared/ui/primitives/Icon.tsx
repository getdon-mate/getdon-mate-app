import Ionicons from "@expo/vector-icons/Ionicons"
import type { ComponentProps } from "react"
import type { StyleProp, TextStyle } from "react-native"
import { uiColors } from "../tokens"

const iconNameMap = {
  check: "checkmark",
  close: "close",
  info: "information-circle-outline",
  warning: "warning-outline",
  plus: "add",
  minus: "remove",
  chevronLeft: "chevron-back",
  chevronRight: "chevron-forward",
  chevronUp: "chevron-up",
  chevronDown: "chevron-down",
  settings: "settings-outline",
  user: "person-circle-outline",
  bell: "notifications-outline",
  refresh: "refresh",
  logout: "log-out-outline",
  trash: "trash-outline",
  edit: "create-outline",
  search: "search-outline",
  sort: "swap-vertical-outline",
  closeCircle: "close-circle-outline",
  copy: "copy-outline",
  eye: "eye-outline",
  eyeOff: "eye-off-outline",
  share: "share-social-outline",
  send: "arrow-redo-outline",
  heart: "heart",
  heartOutline: "heart-outline",
  ellipsis: "ellipsis-horizontal",
  megaphone: "megaphone-outline",
  transfer: "swap-horizontal-outline",
  google: "logo-google",
  kakao: "chatbubble-ellipses-outline",
  filter: "options-outline",
  calendar: "calendar-outline",
  pieChart: "pie-chart-outline",
  chat: "chatbox-ellipses-outline",
} as const satisfies Record<string, ComponentProps<typeof Ionicons>["name"]>

export type IconName = keyof typeof iconNameMap

export function Icon({
  name,
  size = 16,
  color = uiColors.text,
  style,
}: {
  name: IconName
  size?: number
  color?: string
  style?: StyleProp<TextStyle>
}) {
  return (
    <Ionicons
      name={iconNameMap[name]}
      size={size}
      color={color}
      style={style}
      accessibilityLabel={`icon-${name}`}
    />
  )
}
