import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native"
import { onlyDigits } from "@shared/lib/validation"
import { InputField } from "./InputField"

function formatDigits(value: string) {
  const digits = onlyDigits(value)
  if (!digits) return ""
  return new Intl.NumberFormat("ko-KR").format(Number(digits))
}

export function NumericInputField({
  onChangeText,
  label,
  error,
  containerStyle,
  ...props
}: Omit<TextInputProps, "onChangeText"> & {
  onChangeText?: (value: string) => void
  label?: string
  error?: string
  containerStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
}) {
  return (
    <InputField
      {...props}
      value={formatDigits(props.value ?? "")}
      label={label}
      error={error}
      containerStyle={containerStyle}
      keyboardType="number-pad"
      onChangeText={(value) => onChangeText?.(onlyDigits(value))}
    />
  )
}
