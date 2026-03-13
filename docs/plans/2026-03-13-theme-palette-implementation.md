# Theme Palette Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 전역 컬러 팔레트와 semantic token을 다시 정의하고 주요 화면의 하드코딩 색상을 제거한다.

**Architecture:** raw palette를 별도 파일에 두고 `uiColors`는 semantic token으로 매핑한다. 공용 primitive와 주요 진입 화면은 token 기반으로 바꾸고, 멤버/배지 같은 반복 accent 색도 공용 상수에서 공급한다.

**Tech Stack:** Expo, React Native, TypeScript, Jest

---

### Task 1: raw palette와 semantic token 정의

**Files:**
- Create: `src/shared/ui/palette.ts`
- Modify: `src/shared/ui/tokens.ts`
- Test: `tests/unit/theme-palette.test.ts`

**Step 1: failing test 추가**
- 핵심 semantic token이 새 palette 값을 가리키는지 검증

**Step 2: raw palette 정의**
- off-white, cobalt, lilac, success, warning, danger tone 추가

**Step 3: token 재매핑**
- `uiColors`를 semantic 역할 기준으로 정리

### Task 2: 공용 UI와 핵심 카드 색상 치환

**Files:**
- Modify: `src/shared/ui/primitives/Card.tsx`
- Modify: `src/shared/ui/primitives/Badge.tsx`
- Modify: `src/shared/ui/primitives/StatusBanner.tsx`
- Modify: `src/shared/ui/primitives/Toast.tsx`
- Modify: `src/features/auth/components/AuthHero.tsx`
- Modify: `src/features/auth/components/AuthFormCard.tsx`
- Modify: `src/features/accounts/components/UserHeaderCard.tsx`
- Modify: `src/features/accounts/components/AccountSummaryCard.tsx`
- Modify: `src/features/accounts/components/MemberRow.tsx`
- Modify: `src/features/accounts/components/detail/AccountDetailHero.tsx`
- Modify: `src/core/providers/AppProvider.tsx`
- Modify: `src/features/accounts/model/fixtures.ts`

**Step 1: shared primitive 색상 치환**
- border, surface, shadow, status tone를 새 token에 맞춘다.

**Step 2: 주요 hero/card/header 색상 치환**
- 홈, auth, detail 주요 카드들이 같은 palette 축을 쓰게 만든다.

**Step 3: 멤버 accent 색 통일**
- fixture/member palette를 공용 상수로 정리한다.

### Task 3: 검증

**Step 1:** `pnpm test tests/unit/theme-palette.test.ts --runInBand`
**Step 2:** `pnpm run typecheck`
**Step 3:** `pnpm run export:web`
