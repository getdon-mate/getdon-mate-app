import { useEffect, useRef } from "react"
import { Animated, Text, type StyleProp, type TextStyle, View } from "react-native"
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
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    opacity.setValue(0.4)
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start()
  }, [masked, opacity, value])

  if (masked) {
    const width = Math.max(72, Math.min(220, value.length * 13))
    return (
      <Animated.View testID={testID} style={{ opacity }}>
        <SkeletonBlock width={width} height={skeletonHeight} />
      </Animated.View>
    )
  }

  return <Animated.Text style={[textStyle, { opacity }]}>{value}</Animated.Text>
}
