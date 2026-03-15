import { expect, type Page, test } from "@playwright/test"

async function loginAsTestUser(page: Page) {
  await page.goto("/")
  await page.getByRole("button", { name: "로그인" }).click()
  await expect(page.getByRole("button", { name: "개발자 스터디 모임 상세 열기" })).toBeVisible()
}

test("0) 둘러보기로도 목록 진입", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "둘러보기" }).click()
  await expect(page.getByRole("button", { name: "개발자 스터디 모임 상세 열기" })).toBeVisible()
})

async function openFirstAccountDetail(page: Page) {
  await page.getByText("개발자 스터디 모임").first().click()
  await expect(page.getByText("모임통장 상세")).toBeVisible()
}

test("1) 로그인 후 목록 진입", async ({ page }) => {
  await loginAsTestUser(page)
  await expect(page.getByText("주말 산악회")).toBeVisible()
})

test("1-1) 목록 검색과 필터로 모임통장을 좁혀볼 수 있다", async ({ page }) => {
  await loginAsTestUser(page)

  await page.getByRole("button", { name: "미납 2명+" }).click()
  await expect(page.getByText("개발자 스터디 모임")).toBeVisible()
  await expect(page.getByText("주말 산악회")).toHaveCount(0)

  await page.getByLabel("모임통장 검색").fill("산악")
  await expect(page.getByText("조건에 맞는 모임통장이 없습니다.")).toBeVisible()
  await page.getByRole("button", { name: "필터 초기화" }).click()
  await expect(page.getByText("주말 산악회")).toBeVisible()
})

test("2) 목록에서 상세 진입", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
})

test("3) 상세 탭 전환(회비/거래/멤버/통계/일정/게시판/관리)", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)

  await page.getByText("회비", { exact: true }).last().click()
  await expect(page.getByText("멤버별 납부 현황")).toBeVisible()

  await page.getByText("거래", { exact: true }).last().click()
  await expect(page.getByText("새 거래 등록")).toBeVisible()

  await page.getByText("멤버", { exact: true }).last().click()
  await expect(page.getByText("멤버 검색/정렬")).toBeVisible()

  await page.getByText("통계", { exact: true }).last().click()
  await expect(page.getByText("월별 추이")).toBeVisible()

  await page.getByText("일정", { exact: true }).last().click()
  await expect(page.getByText("월간 일정")).toBeVisible()

  await page.getByText("게시판", { exact: true }).last().click()
  await expect(page.getByText("공지 작성")).toBeVisible()

  await page.getByText("관리", { exact: true }).last().click()
  await expect(page.getByText("계좌 요약")).toBeVisible()
})

test("3-1) 회비 탭에서 미납 멤버 전체 안내를 보낼 수 있다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("회비", { exact: true }).last().click()

  await page.getByRole("button", { name: "미납 전체 안내" }).click()
  await expect(page.getByText("미납 멤버 2명에게 납부 안내를 보냈습니다.")).toBeVisible()
})

test("4) 설정에서 알림 설정 화면 진입", async ({ page }) => {
  await loginAsTestUser(page)
  await page.getByLabel("앱 설정 열기").click()
  await page.getByText("알림 설정", { exact: true }).click()
  await expect(page.getByText("회비 마감 알림", { exact: true })).toBeVisible()
  await expect(page.getByText("입출금 알림", { exact: true })).toBeVisible()
  await expect(page.getByText("공지 알림", { exact: true })).toBeVisible()
})

test("5) 설정에서 프로필 관리 화면 진입", async ({ page }) => {
  await loginAsTestUser(page)
  await page.getByLabel("마이페이지 열기").click()
  await expect(page.getByText("마이페이지")).toBeVisible()
})

test("6) Hero CTA(채우기/보내기)로 거래 탭 진입", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)

  await page.getByText("채우기").click()
  await expect(page.getByText("새 거래 등록")).toBeVisible()

  await page.getByText("홈", { exact: true }).last().click()
  await page.getByText("보내기").click()
  await expect(page.getByText("새 거래 등록")).toBeVisible()
})

test("7) 거래 필터는 눌렀을 때만 펼쳐진다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("거래", { exact: true }).last().click()

  await expect(page.getByLabel("거래 검색")).toHaveCount(0)
  await page.getByLabel("거래 필터 열기").click()
  await expect(page.getByLabel("거래 검색")).toBeVisible()
})

test("8) 게시판 글과 댓글 작성이 동작한다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("게시판", { exact: true }).last().click()

  await page.getByPlaceholder("예: 이번 주 모임 장소 안내").fill("e2e 공지")
  await page.getByPlaceholder("공지나 운영 메모를 남겨보세요.").fill("이번 주 장소는 온라인으로 변경됩니다.")
  await page.getByRole("button", { name: "게시하기" }).click()
  await expect(page.getByText("e2e 공지")).toBeVisible()

  await page.getByPlaceholder("댓글을 남겨보세요.").first().fill("e2e 댓글 확인")
  await page.getByRole("button", { name: "댓글 등록" }).first().click()
  await expect(page.getByText("e2e 댓글 확인")).toBeVisible()
})

test("8-1) 게시판 템플릿으로 공지 초안을 빠르게 채울 수 있다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("게시판", { exact: true }).last().click()

  await page.getByRole("button", { name: "회비 안내" }).click()
  await expect(page.getByPlaceholder("예: 이번 주 모임 장소 안내")).toHaveValue("이번 달 회비 안내")
})

test("9) 리마인드 전송 후 알림센터에서 확인할 수 있다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("멤버", { exact: true }).last().click()
  await page.getByRole("button", { name: "납부 안내" }).first().click()
  await expect(page.getByText("납부 안내 전송")).toBeVisible()

  await page.getByLabel("목록으로 이동").click()
  await page.getByLabel("알림 목록 열기").click()
  await page.getByLabel("알림 필터 안내").click()
  await expect(page.getByText("납부 안내를 보냈어요")).toBeVisible()
})

test("9-1) 알림을 비운 뒤 샘플 알림을 다시 복원할 수 있다", async ({ page }) => {
  await loginAsTestUser(page)
  await page.getByLabel("알림 목록 열기").click()
  await page.getByRole("button", { name: "비우기" }).click()
  await expect(page.getByText("표시할 알림이 없습니다.")).toBeVisible()
  await page.getByRole("button", { name: "샘플 알림 복원" }).click()
  await expect(page.getByText("회비 마감이 다가오고 있어요")).toBeVisible()
})

test("10) 캘린더에서 날짜를 선택하면 해당 일정 중심으로 볼 수 있다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("일정", { exact: true }).last().click()
  await page.getByLabel("2026-03-04 일정 보기").click()
  await expect(page.getByText("선택한 날짜 일정")).toBeVisible()
  await page.getByLabel("이전 달 보기").click()
  await expect(page.getByText("2026년 2월")).toBeVisible()
})

test("10-1) 캘린더 바로가기에서 공지 일정 작성 화면으로 이동할 수 있다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("일정", { exact: true }).last().click()
  await page.getByRole("button", { name: "공지 일정" }).click()
  await expect(page.getByText("공지 작성")).toBeVisible()
})

test("10-2) 거래 수정 후 삭제까지 이어서 진행할 수 있다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("거래", { exact: true }).last().click()

  await page.getByRole("button", { name: "수정" }).first().click()
  await page.getByPlaceholder("예: 회비 입금, 모임 식비").fill("e2e 거래 수정")
  await page.getByRole("button", { name: "거래 수정" }).click()
  await expect(page.getByText("e2e 거래 수정 거래를 수정했습니다.")).toBeVisible()
  await expect(page.getByText("e2e 거래 수정").first()).toBeVisible()

  await page.getByRole("button", { name: "삭제" }).first().click()
  await page.getByRole("button", { name: "삭제" }).last().click()
  await expect(page.getByText("e2e 거래 수정 거래를 제거했습니다.")).toBeVisible()
})

test("10-3) 최근 거래값으로 거래 입력을 빠르게 채울 수 있다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("거래", { exact: true }).last().click()

  await page.getByText("출금", { exact: true }).click()
  await page.getByRole("button", { name: "간식 구매 · 12,500원" }).click()

  await expect(page.getByPlaceholder("금액")).toHaveValue("12,500")
  await expect(page.getByPlaceholder("예: 회비 입금, 모임 식비")).toHaveValue("간식 구매")
  await expect(page.getByPlaceholder("예: 회비, 식비")).toHaveValue("간식")
})

test("10-4) 멤버 검색과 역할 필터가 함께 동작한다", async ({ page }) => {
  await loginAsTestUser(page)
  await openFirstAccountDetail(page)
  await page.getByText("멤버", { exact: true }).last().click()

  await page.getByRole("button", { name: "총무", exact: true }).click()
  await expect(page.getByText("멤버 목록 (1)")).toBeVisible()
  await expect(page.getByText("이승우")).toHaveCount(0)

  await page.getByRole("button", { name: "전체" }).click()
  await page.getByRole("button", { name: "이름순" }).click()
  await page.getByLabel("멤버 검색").fill("010-2345")

  await expect(page.getByText("이승우")).toBeVisible()
  await expect(page.getByText("박소연")).toHaveCount(0)
})

test("11) 목록에서 새 모임통장 개설 화면 진입", async ({ page }) => {
  await loginAsTestUser(page)
  await page.getByRole("button", { name: "+ 새 모임통장 개설" }).click()
  await expect(page.getByText("목록 화면과 분리된 입력 화면에서 정보를 입력합니다.")).toBeVisible()
})

test("12) 목록에서 로그아웃 후 로그인 화면 복귀", async ({ page }) => {
  await loginAsTestUser(page)
  await page.getByLabel("앱 설정 열기").click()
  await page.getByText("로그아웃", { exact: true }).click()
  await page.getByRole("button", { name: "로그아웃" }).last().click()
  await expect(page.getByText("처음이라면 회원가입")).toBeVisible()
})
