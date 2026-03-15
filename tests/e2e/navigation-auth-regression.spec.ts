import { expect, type Page, test } from "@playwright/test"

async function loginAsTestUser(page: Page) {
  await page.goto("/")
  await page.getByRole("button", { name: "로그인" }).click()
  await expect(page.getByText("모임통장")).toBeVisible()
}

async function openFirstAccountDetail(page: Page) {
  await page.getByText("개발자 스터디 모임").first().click()
  await expect(page.getByText("모임통장 상세")).toBeVisible()
}

test("1) 로그인 후 목록 진입", async ({ page }) => {
  await loginAsTestUser(page)
  await expect(page.getByText("내 모임통장 2개")).toBeVisible()
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

test("9) 목록에서 새 모임통장 개설 화면 진입", async ({ page }) => {
  await loginAsTestUser(page)
  await page.getByRole("button", { name: "+ 새 모임통장 개설" }).click()
  await expect(page.getByText("목록 화면과 분리된 입력 화면에서 정보를 입력합니다.")).toBeVisible()
})

test("10) 목록에서 로그아웃 후 로그인 화면 복귀", async ({ page }) => {
  await loginAsTestUser(page)
  await page.getByLabel("앱 설정 열기").click()
  await page.getByText("로그아웃", { exact: true }).click()
  await page.getByRole("button", { name: "로그아웃" }).last().click()
  await expect(page.getByText("계정이 없으신가요? 회원가입")).toBeVisible()
})
