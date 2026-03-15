# Transaction Action Density Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 거래 카드 액션을 메뉴 기반으로 단순화하고 기존 수정/삭제 흐름을 유지한다.

**Architecture:** `TransactionsTab`에서 거래 카드 액션 UI를 메뉴 패턴으로 바꾸고, 테스트를 먼저 갱신해 회귀를 잠근다. 거래 데이터 처리와 토스트/확인 모달은 기존 핸들러를 재사용한다.

**Tech Stack:** React Native, Testing Library, Playwright

---

### Task 1: Lock the new interaction in tests

**Files:**
- Modify: `tests/unit/account-management-tabs.test.tsx`
- Modify: `tests/e2e/navigation-auth-regression.spec.ts`

**Step 1: Write the failing test**

- 거래 카드에서 바로 보이는 `수정`, `삭제` 대신 `거래 메뉴 열기`를 요구한다.
- e2e도 메뉴를 통해 수정/삭제하도록 바꾼다.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`

**Step 3: Write minimal implementation**

- 거래 카드에 메뉴 버튼과 메뉴 패널을 추가한다.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`

**Step 5: Commit**

- 구현 완료 후 관련 파일을 함께 커밋한다.

### Task 2: Keep the UI consistent

**Files:**
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`
- Optionally modify: `src/features/accounts/components/TransactionRow.tsx`

**Step 1: Write the failing test**

- 메뉴 액션이 `수정`, `삭제`를 노출하고 삭제는 빨간 톤으로 구분되는지 검증한다.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`

**Step 3: Write minimal implementation**

- 멤버 카드와 유사한 원형 `...` 버튼, 패널, 메뉴 항목 스타일을 추가한다.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`

**Step 5: Commit**

- 동일 커밋에 포함한다.

### Task 3: Full verification and integration

**Files:**
- Modify: `docs/plans/2026-03-16-transaction-action-density-design.md`
- Modify: `docs/plans/2026-03-16-transaction-action-density.md`

**Step 1: Run focused tests**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`

**Step 2: Run full verification**

Run: `pnpm test --runInBand`
Run: `pnpm run ci:web`
Run: `pnpm test:e2e`

**Step 3: Clean artifacts**

Run: `find test-results -type f -delete 2>/dev/null; find test-results -depth -type d -empty -delete 2>/dev/null`

**Step 4: Commit**

```bash
git add docs/plans/2026-03-16-transaction-action-density-design.md docs/plans/2026-03-16-transaction-action-density.md tests/unit/account-management-tabs.test.tsx tests/e2e/navigation-auth-regression.spec.ts src/features/accounts/components/detail-tabs/TransactionsTab.tsx
git commit -m "feat: streamline transaction item actions"
```
