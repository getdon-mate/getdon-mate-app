# 홈 전역 관리 분리 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 홈 목록 화면에서 앱 전체 관리 진입을 제공하고 모임통장 상세 설정을 내부 관리 전용으로 분리한다.

**Architecture:** `AccountListScreen`은 전역 진입점과 목록 탐색만 담당하고, 새 `AppSettingsScreen`이 앱 전체 설정을 맡는다. 기존 `SettingsTab`에서 전역 설정 관련 액션을 제거해 모임 내부 관리 책임만 남긴다.

**Tech Stack:** Expo, React Native, React Navigation Native Stack, TypeScript

---

### Task 1: 라우트와 문서 추가

**Files:**
- Create: `src/features/auth/screens/AppSettingsScreen.tsx`
- Modify: `src/core/navigation/routes.ts`
- Modify: `src/core/navigation/types.ts`
- Modify: `src/core/AppRouter.tsx`
- Modify: `docs/plans/2026-03-13-home-global-management-design.md`

**Step 1: 화면 책임에 맞는 라우트를 추가한다**

`AppSettings` 라우트를 정의하고 stack에 등록한다.

**Step 2: 앱 전체 설정 화면을 최소 구현한다**

`마이페이지`, `알림 설정`, `로그아웃`, `회원 탈퇴`를 제공하는 화면을 만든다.

**Step 3: 라우팅이 타입과 함께 연결됐는지 확인한다**

`RootStackParamList`와 linking config에 새 화면을 연결한다.

### Task 2: 홈 목록 상단 액션 재구성

**Files:**
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/components/UserHeaderCard.tsx`

**Step 1: 데모 초기화 액션을 제거한다**

목록 화면의 `resetDemoData` 흐름과 버튼을 삭제한다.

**Step 2: 홈 상단 우측 전역 액션을 추가한다**

`알림`, `마이페이지`, `앱 설정` 아이콘을 배치하고 각 화면으로 이동시킨다.

**Step 3: 목록 화면 책임을 목록 탐색 중심으로 정리한다**

불필요한 피드백 preset import와 데모 제어 분기를 제거한다.

### Task 3: 모임통장 상세 설정의 책임 축소

**Files:**
- Modify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`

**Step 1: 전역 설정 관련 메뉴를 제거한다**

프로필 관리, 알림 설정, 로그아웃, 회원 탈퇴를 `SettingsTab`에서 삭제한다.

**Step 2: 모임 내부 관리 섹션만 남긴다**

기본정보 수정, 자동이체, 1회성 회비, 모임통장 삭제 흐름을 유지한다.

**Step 3: 텍스트와 헤더를 내부 관리 기준으로 조정한다**

탭 제목과 설명이 전역 설정이 아니라 모임통장 관리임을 분명히 한다.

### Task 4: 검증

**Files:**
- Modify: 없음

**Step 1: 타입체크 실행**

Run: `pnpm run typecheck`

**Step 2: 웹 export 실행**

Run: `pnpm run export:web`

**Step 3: 결과 확인**

홈 목록에서 전역 액션 진입과 상세 설정 탭 분리 기준이 코드상 충족됐는지 확인한다.
