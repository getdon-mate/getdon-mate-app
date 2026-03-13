# Toast Mobile Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 모바일 toast를 하단 중앙의 작은 카드형 피드백 컴포넌트로 개선한다.

**Architecture:** 공용 `Toast` primitive만 수정해서 모든 화면의 toast가 같은 스타일을 쓰도록 한다. 테스트는 tone별 렌더링과 카드형 레이아웃 핵심 스타일을 확인하는 수준으로 고정한다.

**Tech Stack:** Expo, React Native, TypeScript, Jest, React Native Testing Library

---

### Task 1: toast 스타일 계약 테스트 추가

**Files:**
- Create: `tests/unit/toast.test.tsx`
- Modify: `src/shared/ui/primitives/Toast.tsx`

**Step 1: 하단 중앙 카드형 toast 기준 테스트 작성**

tone별 제목 노출과 메시지 조건부 노출을 검증한다.

**Step 2: style contract를 검증한다**

전체 폭이 아닌 카드형 레이아웃에 필요한 `alignSelf`, `maxWidth`, `bottom` 등을 확인한다.

### Task 2: 공용 Toast 리디자인

**Files:**
- Modify: `src/shared/ui/primitives/Toast.tsx`

**Step 1: tone palette를 연한 카드형 색상으로 교체**

배경, border, 텍스트, 아이콘 배지를 tone별로 구분한다.

**Step 2: 레이아웃을 카드형 중앙 플로팅으로 수정**

`left/right` 고정 대신 `alignSelf: center`, `width/maxWidth` 조합으로 변경한다.

**Step 3: 텍스트와 아이콘 밀도 조정**

메시지가 없어도 레이아웃이 무너지지 않도록 spacing을 정리한다.

### Task 3: 검증

**Files:**
- Modify: 없음

**Step 1: toast 테스트 실행**

Run: `pnpm test tests/unit/toast.test.tsx --runInBand`

**Step 2: 타입체크 실행**

Run: `pnpm run typecheck`

**Step 3: 웹 export 실행**

Run: `pnpm run export:web`
