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
    message: "현재 변경 내용을 지우고 처음 상태로 되돌립니다.",
    confirmLabel: "초기화",
    successTitle: "초기화 완료",
    successMessage: "데모 데이터를 초기 상태로 되돌렸습니다.",
  },
  deleteAccount: {
    title: "모임통장 삭제",
    message: "이 모임통장과 관련 정보가 목록에서 사라집니다.",
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
  networkError: {
    title: "네트워크 오류",
    message: "네트워크 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
  },
  refreshSuccess: {
    tone: "success" as const,
    title: "동기화 완료",
    message: "모임통장 데이터를 최신 상태로 불러왔습니다.",
  },
  refreshFallback: (errorMessage?: string | null) => ({
    tone: "warning" as const,
    title: "동기화 실패",
    message: errorMessage ?? "실서버 연결에 실패했습니다. 데모 데이터를 유지합니다.",
  }),
  refreshDemo: {
    tone: "warning" as const,
    title: "데모 모드",
    message: "현재는 데모 데이터로 동작 중입니다.",
  },
  // 복사 공통
  copySuccess: {
    tone: "success" as const,
    title: "복사 완료",
  },
  copyFail: {
    tone: "danger" as const,
    title: "복사 실패",
    message: "권한이나 기기 설정 때문에 자동 복사를 완료하지 못했습니다.",
  },
  // AccountInfoPanel
  accountInfoSaved: {
    tone: "success" as const,
    title: "저장 완료",
    message: "모임통장 기본정보를 수정했습니다.",
  },
  // AutoTransferPanel
  autoTransferSaved: {
    tone: "success" as const,
    title: "저장 완료",
    message: "자동이체 설정을 저장했습니다.",
  },
  // OneTimeDuesPanel
  oneTimeDuesCreated: {
    tone: "success" as const,
    title: "생성 완료",
    message: "1회성 회비를 생성했습니다.",
  },
  oneTimeDuesUpdated: {
    tone: "success" as const,
    title: "수정 완료",
    message: "1회성 회비를 수정했습니다.",
  },
  oneTimeDuesClosed: (closed: boolean) => ({
    tone: "success" as const,
    title: closed ? "마감 완료" : "마감 해제",
    message: closed
      ? "1회성 회비를 종료 상태로 전환했습니다."
      : "1회성 회비를 다시 진행 상태로 전환했습니다.",
  }),
  oneTimeDuesDelete: {
    title: "1회성 회비 삭제",
    message: "회비 항목과 납부 상태가 함께 삭제됩니다.",
    confirmLabel: "삭제",
  },
  oneTimeDuesDeleted: {
    tone: "success" as const,
    title: "삭제 완료",
    message: "1회성 회비를 삭제했습니다.",
  },
  // MyPageScreen
  profileSaved: {
    tone: "success" as const,
    title: "저장 완료",
    message: "마이페이지 정보를 수정했습니다.",
  },
  // AccountDetailScreen — 초대
  inviteLinkCopied: {
    tone: "success" as const,
    title: "링크 복사 완료",
    message: "초대 링크를 복사했습니다.",
  },
  inviteLinkCopyFail: {
    tone: "danger" as const,
    title: "복사 실패",
    message: "초대 링크를 복사하지 못했습니다.",
  },
  inviteShareFail: {
    tone: "danger" as const,
    title: "공유 실패",
    message: "공유 시트를 열지 못했습니다.",
  },
  // BoardTab
  postDeleteWarning: {
    message: "게시글과 댓글이 함께 삭제됩니다.",
  },
  commentDeleteWarning: {
    message: "삭제한 댓글은 되돌릴 수 없습니다.",
  },
  postLinkCopied: {
    tone: "success" as const,
    title: "링크 복사",
    message: "게시글 링크를 복사했어요.",
  },
  postLinkCopyFail: {
    tone: "danger" as const,
    title: "복사 실패",
    message: "링크를 복사하지 못했습니다.",
  },
  postShared: {
    tone: "success" as const,
    title: "공유 준비",
    message: "공유할 내용을 열었습니다.",
  },
} as const
