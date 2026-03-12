import { expect, test } from "@playwright/test"

test("로그인 후 목록과 상세 이동이 동작한다", async ({ page }) => {
  await page.goto("/")

  await page.getByRole("button", { name: "로그인" }).click()
  await expect(page.getByText("모임통장")).toBeVisible()

  await page.getByText("개발자 스터디 모임").first().click()
  await expect(page.getByText("모임통장 상세")).toBeVisible()
})
