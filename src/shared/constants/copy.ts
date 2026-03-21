export const COPY = {
  auth: {
    testAccountLabel: "테스트 계정: test@test.com / password",
  },
  notification: {
    title: "알림 설정",
    subtitle: "회비 마감/거래/공지 알림을 관리합니다.",
    saved: "알림 설정을 저장했습니다.",
  },
  account: {
    createTitle: "모임통장 개설",
    createSubtitle: "새로운 모임통장을 만들어보세요.",
    createSuccess: "새 모임통장을 만들었습니다.",
    createEmptyTitle: "아직 모임통장이 없어요",
    createEmptyDescription: "새 모임통장을 열고 회비 관리를 시작하세요.",
    createButtonLabel: "+ 새 모임통장 개설",
    copyAccountNumber: "계좌번호를 복사했습니다.",
    copyAccountNumberFail: "계좌번호를 복사하지 못했습니다.",
    deleteLabel: "이 모임통장 삭제",
    emptyTitle: "선택된 모임이 없습니다.",
    emptyDescription: "목록에서 모임통장을 다시 선택해주세요.",
  },
  dues: {
    reminderSent: (name: string) => `${name}님께 납부 안내를 보냈습니다.`,
    reminderSentTitle: "납부 안내 전송",
    transferRequestSent: (name: string) => `${name}님께 이체 요청을 보냈습니다.`,
    transferRequestSentTitle: "이체 요청 전송",
  },
} as const
