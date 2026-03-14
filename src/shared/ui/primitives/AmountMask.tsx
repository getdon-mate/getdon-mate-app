import { Text, type StyleProp, type TextStyle, View } from "react-native"
import { SkeletonBlock } from "./SkeletonBlock"

export function AmountMask({
  value,
  masked,
  textStyle,
  skeletonHeight = 18,
  testID = "masked-amount",
}: {
  value: string
  masked: boolean
  textStyle?: StyleProp<TextStyle>
  skeletonHeight?: number
  testID?: string
}) {
  if (masked) {
    const width = Math.max(72, Math.min(220, value.length * 13))
    return (
      <View testID={testID}>
        <SkeletonBlock width={width} height={skeletonHeight} />
      </View>
    )
  }

  return <Text style={textStyle}>{value}</Text>
}
