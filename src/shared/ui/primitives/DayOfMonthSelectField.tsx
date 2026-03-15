import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import { Icon } from "./Icon"
import { uiColors, uiRadius } from "../tokens"

const days = Array.from({ length: 28 }, (_, index) => String(index + 1))

export function DayOfMonthSelectField({
  value,
  onChangeValue,
  label,
  placeholder = "1~28일 선택",
  containerStyle,
  labelStyle,
  error,
}: {
  value: string
  onChangeValue: (value: string) => void
  label?: string
  placeholder?: string
  containerStyle?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const displayValue = useMemo(() => {
    const trimmed = value.trim()
    return trimmed ? `${Number(trimmed)}일` : placeholder
  }, [placeholder, value])

  return (
    <View style={[styles.block, containerStyle]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      <Pressable
        style={[styles.trigger, open && styles.triggerOpen]}
        onPress={() => setOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? "일자"} 선택`}
      >
        <Text style={[styles.triggerText, !value.trim() && styles.placeholderText]}>{displayValue}</Text>
        <Icon name={open ? "chevronUp" : "chevronDown"} size={16} color={uiColors.textSoft} />
      </Pressable>
      {open ? (
        <View style={styles.optionGrid}>
          {days.map((day) => {
            const selected = day === value
            return (
              <Pressable
                key={day}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => {
                  onChangeValue(day)
                  setOpen(false)
                }}
                accessibilityRole="button"
                accessibilityLabel={`${day}일`}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{day}일</Text>
              </Pressable>
            )
          })}
        </View>
      ) : null}
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
  trigger: {
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: uiColors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  triggerOpen: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  triggerText: {
    color: uiColors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  placeholderText: {
    color: uiColors.textSoft,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.lg,
    padding: 10,
    backgroundColor: uiColors.surface,
  },
  option: {
    minWidth: 58,
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.surface,
  },
  optionSelected: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  optionText: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: uiColors.primary,
  },
  error: {
    color: uiColors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
})
