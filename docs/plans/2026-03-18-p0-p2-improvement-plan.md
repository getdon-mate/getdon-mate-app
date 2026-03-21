# P0~P2 개선 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** P0(치명적 결함), P1(유지보수성), P2(구조/디자인) 우선순위 항목을 모두 수정하고 커밋/푸시한다.

**Architecture:** AppProvider 분리 없이 기존 3-context 구조를 유지하면서 각 레이어의 버그와 타입 안전성을 수정. API 에러 처리 통일 및 토큰 만료 대응 추가.

**Tech Stack:** Expo React Native, TypeScript, React Query, Context API

---

## Task 1 (P0): createAccount 크래시 수정 + any 타입 제거

**Files:**
- Modify: `src/features/accounts/api/swagger-api.ts` - SwaggerMeetingSummary export
- Modify: `src/core/providers/AppProvider.tsx` - any 타입 교체, createAccount fallback
- Modify: `src/features/accounts/screens/AccountCreateScreen.tsx` - try/catch 추가

**변경 내용:**
1. SwaggerMeetingSummary를 export로 변경
2. AppProvider의 4곳 `(meeting: any)` → `(meeting: SwaggerMeetingSummary)` 교체
3. createAccount에서 throw 제거, demo/로컬 계정 생성 fallback 추가
4. AccountCreateScreen에서 try/catch + 에러 toast 표시

## Task 2 (P0): 토큰 만료 / 401 처리

**Files:**
- Modify: `src/core/providers/AppProvider.tsx` - 401 감지 시 자동 로그아웃

**변경 내용:**
1. refreshAccounts catch 블록에서 401 감지 시 토큰 초기화
2. login 함수의 deps 배열 정리 (backendAdapter 미사용 참조 제거)

## Task 3 (P0/P1): runBusy 에러 핸들링 + 뮤테이션 에러 피드백

**Files:**
- Modify: `src/core/providers/AppProvider.tsx` - runBusy 에러 캐치, lastMutationError 상태 추가

**변경 내용:**
1. AppRuntimeContextType에 `lastMutationError`, `clearMutationError` 추가
2. runBusy에서 에러 캐치 후 lastMutationError 설정 + re-throw

## Task 4 (P1): AppProvider 커스텀 훅 분리

**Files:**
- Create: `src/core/providers/hooks/useAuthProvider.ts`
- Create: `src/core/providers/hooks/useAccountsProvider.ts`
- Create: `src/core/providers/hooks/useRuntimeProvider.ts`
- Modify: `src/core/providers/AppProvider.tsx` - 훅 조합으로 축소

## Task 5 (P2): API 에러 처리 일관성 개선

**Files:**
- Modify: `src/core/api/error-message-map.ts` - 누락된 에러 코드 추가
- Modify: `src/core/providers/AppProvider.tsx` - isApiError 활용, 에러 메시지 개선

## Task 6 (P2): 디자인 토큰 일관성

**Files:**
- Modify: `src/features/accounts/screens/AccountCreateScreen.tsx` - 하드코딩 색상 교체
- Modify: `src/shared/ui/recipes.ts` - typography 토큰 적용
- Grep 후 하드코딩 값 교체
