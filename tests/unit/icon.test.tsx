import { render } from "@testing-library/react-native"
import { Icon, type IconName } from "@shared/ui"

jest.mock("@expo/vector-icons/Ionicons", () => {
  const { Text } = require("react-native")
  return function MockIonicons({ accessibilityLabel, name }: { accessibilityLabel?: string; name: string }) {
    return <Text accessibilityLabel={accessibilityLabel}>{name}</Text>
  }
})

const supportedNames: IconName[] = [
  "check",
  "close",
  "info",
  "warning",
  "plus",
  "minus",
  "chevronLeft",
  "chevronRight",
  "settings",
  "user",
  "bell",
  "refresh",
  "logout",
  "trash",
  "search",
  "sort",
  "closeCircle",
]

describe("Icon", () => {
  test.each(supportedNames)("renders mapped expo icon for %s", (name) => {
    const { getByLabelText } = render(<Icon name={name} />)
    expect(getByLabelText(`icon-${name}`)).toBeTruthy()
  })
})
