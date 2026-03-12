import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native"
import { onlyDigits } from "@shared/lib/validation"
import { InputField } from "./InputField"

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
      label={label}
      error={error}
      containerStyle={containerStyle}
      keyboardType="numeric"
      onChangeText={(value) => onChangeText?.(onlyDigits(value))}
    />
  )
}
