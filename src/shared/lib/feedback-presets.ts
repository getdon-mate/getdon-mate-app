export const feedbackPresets = {
  validationError: {
    title: "입력 오류",
  },
  comingSoon: (label: string) => ({
    title: label,
    message: "준비 중인 기능입니다.",
  }),
  logout: {
    title: "로그아웃",
    message: "현재 세션을 종료하고 로그인 화면으로 이동합니다.",
    confirmLabel: "로그아웃",
    successTitle: "로그아웃 완료",
    successMessage: "로그인 화면으로 이동합니다.",
  },
  withdraw: {
    title: "회원 탈퇴",
    message: "계정과 데모 데이터가 제거됩니다. 계속하시겠습니까?",
    confirmLabel: "탈퇴",
    successTitle: "탈퇴 완료",
    successMessage: "계정이 정리되었습니다.",
  },
  resetDemoData: {
    title: "데모 데이터 초기화",
    message: "현재 변경 내용을 지우고 초기 mock 데이터로 되돌립니다.",
    confirmLabel: "초기화",
    successTitle: "초기화 완료",
    successMessage: "데모 데이터를 초기 상태로 되돌렸습니다.",
  },
  deleteAccount: {
    title: "모임통장 삭제",
    message: "이 모임통장과 관련된 데모 데이터가 제거됩니다.",
    confirmLabel: "삭제",
    successTitle: "삭제 완료",
    successMessage: "모임통장을 목록에서 제거했습니다.",
  },
  signupFailed: {
    title: "회원가입 실패",
    message: "이미 사용 중인 이메일입니다.",
  },
  loginFailed: {
    title: "로그인 실패",
    message: "이메일 또는 비밀번호가 올바르지 않습니다.",
  },
} as const
