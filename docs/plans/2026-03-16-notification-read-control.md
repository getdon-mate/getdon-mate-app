# Notification Read Control Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 알림 카드의 개별 읽음 액션을 pill 버튼에서 라디오형 확인 표시로 교체한다.

**Architecture:** 기존 `NotificationListScreen` 레이아웃과 앱 상태는 유지하고, unread 카드 footer의 액션 컴포넌트만 `RadioButton` 기반으로 교체한다. 테스트는 기존 버튼 텍스트 의존을 제거하고 접근성 label 기반으로 읽음 상호작용을 검증한다.

**Tech Stack:** Expo 54, React Native, TypeScript, Jest, Testing Library

---

### Task 1: Update notification list tests first

**Files:**
- Modify: `tests/unit/notification-list-screen.test.tsx`

**Step 1: Write the failing test**

- 기존 `읽음 처리` 버튼 텍스트 의존 assertion을 라디오형 읽음 컨트롤을 찾는 expectation으로 바꾼다.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx --runInBand`
Expected: FAIL because the screen still renders the old button structure.

### Task 2: Replace the unread CTA with a radio control

**Files:**
- Modify: `src/features/auth/screens/NotificationListScreen.tsx`

**Step 1: Write minimal implementation**

- `Button` import 의존을 줄이고 `RadioButton`을 사용한다.
- unread 카드 footer에서 radio control press가 `markNotificationRead(item.id)`를 호출하도록 연결한다.
- 접근성 label은 기존처럼 `${item.title} 읽음 처리`를 유지한다.

**Step 2: Run test to verify it passes**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx --runInBand`
Expected: PASS

### Task 3: Verify the focused slice only

**Files:**
- Verify only

**Step 1: Re-run the notification unit test**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx --runInBand`
Expected: PASS with no regressions in the updated notification tests.
