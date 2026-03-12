import { StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function InputField({
  label,
  error,
  containerStyle,
  ...props
}: TextInputProps & {
  label?: string
  error?: string
  containerStyle?: ViewStyle | ViewStyle[]
}) {
  return (
    <View style={[styles.block, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        style={[styles.input, props.style]}
        placeholderTextColor={uiColors.textSoft}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: uiColors.textMuted,
    paddingHorizontal: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: uiColors.text,
    backgroundColor: uiColors.surface,
  },
  error: {
    color: uiColors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
})
