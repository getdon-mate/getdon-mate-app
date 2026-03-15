function trimValue(value: string) {
  return value.trim()
}

export function requireText(value: string, message: string) {
  return trimValue(value) ? null : message
}

export function validatePassword(value: string) {
  if (!trimValue(value)) return "비밀번호를 입력해주세요."
  if (value.length < 4) return "비밀번호는 4자 이상이어야 합니다."
  return null
}

export function validateEmail(value: string) {
  if (!trimValue(value)) return "이메일을 입력해주세요."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimValue(value))) {
    return "올바른 이메일 형식이 아닙니다."
  }
  return null
}

export function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, "")
}

export function validatePositiveNumber(value: string, message: string) {
  const parsed = Number(onlyDigits(value))
  if (!Number.isFinite(parsed) || parsed <= 0) return message
  return null
}

export function validateDayOfMonth(value: string) {
  const parsed = Number(onlyDigits(value))
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 28) {
    return "납부일은 1~28 범위로 입력해주세요."
  }
  return null
}

export function validateIsoDate(value: string) {
  if (!trimValue(value)) return "날짜를 입력해주세요."
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimValue(value))) {
    return "날짜는 YYYY-MM-DD 형식으로 입력해주세요."
  }
  return null
}

export function validatePhoneNumber(value: string) {
  const digits = onlyDigits(value)
  if (!digits) return "연락처를 입력해주세요."
  if (digits.length < 10 || digits.length > 11) {
    return "연락처 형식을 확인해주세요."
  }
  return null
}
