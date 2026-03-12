export const TEST_ACCOUNT = {
  email: "test@test.com",
  password: "password",
} as const

export const COPY = {
  auth: {
    testAccountLabel: `테스트 계정: ${TEST_ACCOUNT.email} / ${TEST_ACCOUNT.password}`,
  },
  notification: {
    title: "알림 설정",
    subtitle: "회비 마감/거래/공지 알림을 관리합니다.",
    saved: "알림 설정을 저장했습니다.",
  },
} as const
