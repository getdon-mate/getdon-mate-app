# GET-11 Figma Hybrid Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Figma sample design 톤을 현재 RN 구조에 하이브리드 방식으로 반영해 핵심 화면 정합도를 높인다.

**Architecture:** 화면 구조는 유지하고 스타일/레이아웃 계층만 조정한다. Login, AccountList, AccountDetail(헤더·거래영역), Members/Settings 탭에 공통 카드/간격/타이포 톤을 일관 적용한다.

**Tech Stack:** Expo React Native, TypeScript, StyleSheet

---

### Task 1: 공통 카드/표면 톤 정합화

**Files:**
- Modify: `src/features/accounts/components/SectionCard.tsx`

**Step 1: 기준 스타일 확인**
Run: `sed -n '1,200p' src/features/accounts/components/SectionCard.tsx`

**Step 2: 카드 표면 스타일 반영**
- border/배경/그림자 값을 Figma 톤에 맞게 조정

**Step 3: 타입 검증**
Run: `pnpm run typecheck`

### Task 2: Login 화면 정합화

**Files:**
- Modify: `src/features/auth/components/AuthHero.tsx`
- Modify: `src/features/auth/components/AuthFormCard.tsx`
- Modify: `src/features/auth/screens/LoginScreen.tsx`

**Step 1: 히어로·폼 레이아웃 조정**
- 아이콘/타이틀/보조 문구 배치 및 폼 영역 간격 정리

**Step 2: 인터랙션 상태 유지**
- 기존 submitting/입력 검증 동작은 유지

**Step 3: 타입 검증**
Run: `pnpm run typecheck`

### Task 3: 목록/상세 핵심 영역 정합화

**Files:**
- Modify: `src/features/accounts/components/UserHeaderCard.tsx`
- Modify: `src/features/accounts/components/AccountSummaryCard.tsx`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`

**Step 1: 목록 헤더/카드 톤 반영**
- 카드 밀도, 메타텍스트, 액션 버튼 시각 톤 정리

**Step 2: 상세 상단 영역 반영**
- 계좌 정보 Hero 영역 및 거래영역 경계 시각화

**Step 3: 타입 검증**
Run: `pnpm run typecheck`

### Task 4: 멤버/설정 탭 정합화

**Files:**
- Modify: `src/features/accounts/components/detail-tabs/MembersTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`

**Step 1: 카드/섹션 구분 및 타이포 톤 정리**

**Step 2: 기존 기능 동작 유지 확인**

**Step 3: 검증**
Run:
- `pnpm run typecheck`
- `pnpm run export:web`

### Task 5: 문서/Linear/커밋

**Files:**
- Modify: `docs/plans/2026-03-11-get-11-figma-gap-analysis-prep.md`

**Step 1: 반영 범위와 남은 blocker 업데이트**

**Step 2: 커밋**
Run:
```bash
git add <changed-files>
git commit -m "feat: figma 하이브리드 정합화 반영 (GET-11)"
```
