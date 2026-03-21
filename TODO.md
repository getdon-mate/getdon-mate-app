# getdon-mate-app TODO

> 출시를 앞둔 단계 기준으로 작성된 전체 개선 목록.
> 우선순위: **P0** = 출시 차단 | **P1** = 출시 전 필수 | **P2** = UX/UI 개선 | **P3** = 코드 품질 | **P4** = 장기 과제

---

## 목차

1. [P0 — 출시 차단 이슈](#p0--출시-차단-이슈)
2. [P1 — 출시 전 필수 개선](#p1--출시-전-필수-개선)
3. [P2 — UI / UX 개선](#p2--ui--ux-개선)
4. [P3 — 코드 품질 / 리팩토링](#p3--코드-품질--리팩토링)
5. [P4 — 장기 과제](#p4--장기-과제)
6. [기술 부채 현황 요약](#기술-부채-현황-요약)

---

## P0 — 출시 차단 이슈

### 🔴 [P0-1] 검색창 UI 누락 — AccountListScreen

**현상**: `AccountListScreen.tsx`에 `searchQuery` state, 필터링 로직, `searchStack` 레이아웃 div가 구현되어 있지만
실제 `InputField` 컴포넌트가 렌더링되지 않아 검색 기능이 완전히 사용 불가.

```tsx
// AccountListScreen.tsx:94-95 — 빈 텍스트 (의미 없는 섹션 헤더)
<Text style={styles.sectionTitle}></Text>
<Text style={styles.sectionSubtitle}></Text>

// AccountListScreen.tsx:98-113 — searchStack 내부에 InputField 없음
<View style={styles.searchStack}>
  <View testID="account-list-filter-actions" style={styles.filterActionsRow}>
    ...필터 칩만 있고 검색 입력창 없음
  </View>
</View>
```

**해야 할 것**:
- `searchStack` 안에 `InputField` 추가 (placeholder: "모임명, 은행명, 계좌번호 검색")
- 빈 `sectionTitle` / `sectionSubtitle` 제거하거나 의미 있는 텍스트 추가
- 검색 상태일 때 "X" 지우기 버튼 표시

**영향 파일**: `src/features/accounts/screens/AccountListScreen.tsx`

---

### 🔴 [P0-2] 실제 계좌 상세 데이터 미연동 — swagger-api.ts

**현상**: 로그인 후 계좌 목록을 `fetchMyMeetings`로 불러오는데, `toGroupAccountSummary` 변환 시
대부분의 필드가 빈값/기본값으로 채워짐. 실제 서비스에서 계좌 상세를 열면 빈 화면.

```typescript
// swagger-api.ts:55-90
export function toGroupAccountSummary(meeting: SwaggerMeetingSummary, currentUser: AppUser | null): GroupAccount {
  return {
    accountNumber: "",           // ← 빈 문자열
    monthlyDuesAmount: 0,        // ← 고정 0
    dueDay: 25,                  // ← 고정 25일
    members: currentUser ? [{ role: "총무", color: "#3b82f6" }] : [],  // ← 현재 사용자만
    duesRecords: [],             // ← 빈 배열
    transactions: [],            // ← 빈 배열
    oneTimeDues: [],             // ← 빈 배열
    reminders: [],
    boardPosts: [],
  }
}
```

**해야 할 것**:
- 계좌 상세 화면 진입 시 `/api/v1/accounts/:id` (또는 해당 백엔드 엔드포인트)로 상세 데이터 fetch
- `SwaggerMeetingSummary`에 없는 필드(accountNumber, dueDay 등) 백엔드 DTO에서 받아오도록 확장
- `toGroupAccountSummary`의 하드코딩 `color: "#3b82f6"` → 팔레트 색상 사용

**영향 파일**: `src/features/accounts/api/swagger-api.ts`, `src/features/accounts/api/dto.ts`

---

### 🔴 [P0-3] API 엔드포인트 이중 체계 — 통합 필요

**현상**: 두 개의 API 클라이언트가 서로 다른 경로 체계를 사용.

| 파일 | 경로 패턴 | 사용처 |
|------|---------|------|
| `backend-v1-adapter.ts` | `/api/v1/auth/login`, `/api/v1/accounts`, `/api/v1/users/:id` | bootstrap, 계좌 CRUD |
| `swagger-api.ts` | `/api/member/login`, `/api/member/join`, `/api/meeting/my-list` | 실제 로그인/회원가입 |

- `login`은 `swagger-api.ts`의 `/api/member/login` 사용 ✓
- `backendAdapter.login()`(`/api/v1/auth/login`)은 호출되지 않는 데드코드
- `/api/v1/accounts` 엔드포인트 실제 존재 여부 불명확

**해야 할 것**:
- 백엔드 실제 API 명세서와 대조하여 사용되는 엔드포인트 정리
- 데드코드인 `backendAdapter.login()`, `backendAdapter.signup()` 제거 또는 활용
- `swagger-api.ts`의 `createMeetingWithSwaggerApi` 파라미터 `bankAccount: number` → `string`인지 확인 (계좌번호는 보통 string)

**영향 파일**: `src/features/accounts/api/backend-v1-adapter.ts`, `src/features/accounts/api/swagger-api.ts`

---

### 🔴 [P0-4] `withdraw()` 에러 무시 — fire-and-forget

**현상**: 회원 탈퇴 시 백엔드 API 호출 결과를 무시하고 로컬 상태만 정리.

```typescript
// useAuthProvider.ts:185
void backendAdapter.deleteUser(userId)  // ← 에러가 나도 사용자에게 알리지 않음
```

백엔드 삭제 실패 시 서버에는 계정이 남아있지만 앱은 로그아웃된 것처럼 보임.

**해야 할 것**:
- `await backendAdapter.deleteUser(userId)` 로 변경
- 실패 시 사용자에게 에러 안내 또는 재시도 안내
- 로컬 상태 정리는 성공 확인 후 수행 (또는 낙관적 업데이트 + rollback)

**영향 파일**: `src/core/providers/hooks/useAuthProvider.ts:178-186`

---

### 🔴 [P0-5] `availableMonths` 하드코딩 — 시간 경과 시 오작동

**현상**: `fixtures.ts`에 고정 배열로 선언된 `availableMonths`를 DuesTab이 사용.
시간이 지나면 현재 달이 목록에 없거나 모든 달이 과거 달이 되는 문제 발생.

```typescript
// fixtures.ts (추정 구조)
export const availableMonths = ["2025-01", "2025-02", ..., "2025-12"]
// 2026년이 되면 2026-01 선택 불가
```

**해야 할 것**:
- `availableMonths`를 현재 달 기준 동적 생성 함수로 교체
- 예: 현재 달 포함 이전 12개월 + 다음 1개월 범위로 계산
- `DuesTab`의 초기 `selectedMonth`도 항상 현재 달로 초기화

**영향 파일**: `src/features/accounts/model/fixtures.ts`, `src/features/accounts/screens/AccountDetailScreen.tsx:39`

---

### 🔴 [P0-6] `real` 모드에서도 `uiDemoDelayMs` 딜레이 적용

**현상**: `runBusy`가 모든 뮤테이션에 `delay(appEnv.uiDemoDelayMs)` 적용.
`appEnv.uiDemoDelayMs`가 0이 아니면 실서버 API 호출도 인위적으로 느려짐.

```typescript
// useRuntimeProvider.ts:187
const runBusy = useCallback(async <T,>(task: () => Promise<T>) => {
  setBusyCount((prev) => prev + 1)
  try {
    await delay(appEnv.uiDemoDelayMs)  // ← real 모드에서도 실행
    return await task()
  }
```

**해야 할 것**:
- `prefersRealApi`가 true일 때 딜레이 스킵: `if (!prefersRealApi) await delay(...)`
- 또는 `appEnv.uiDemoDelayMs`가 0인지 확인하고 `.env`에서 0으로 설정

**영향 파일**: `src/core/providers/hooks/useRuntimeProvider.ts:184-195`

---

### 🔴 [P0-7] 로그인 폼 인위적 300ms 지연

**현상**: `useAuthForm`의 로그인 핸들러에 `setTimeout(300ms)` 하드코딩.

```typescript
// useAuthForm.ts:49
await new Promise((resolve) => setTimeout(resolve, 300))
const ok = await login(email.trim(), password)
```

이미 `runBusy`에서 스피너를 처리하므로 이 딜레이는 불필요하고 UX를 저해.

**해야 할 것**: 해당 줄 제거

**영향 파일**: `src/features/auth/hooks/useAuthForm.ts:49`

---

### 🔴 [P0-8] `AppUser` 타입에 `password` 필드 존재

**현상**: 도메인 타입에 비밀번호 필드가 포함되어 있고, 로컬 사용자는 실제 비밀번호가 저장됨.
세션 저장 시 `password: ""` 처리는 되지만, 메모리의 `users` 배열에는 평문 비밀번호가 남아있음.

```typescript
// model/types.ts:106-112
export interface AppUser {
  id: string
  name: string
  email: string
  password: string  // ← 도메인 타입에 비밀번호 포함
}

// useAuthProvider.ts:87-88 (로컬 모드)
const localUser = users.find((u) => u.email === email && u.password === password)
// users 배열에 평문 비밀번호 저장
```

**해야 할 것**:
- 로컬 모드(데모) 전용으로만 사용되는 임시 구조임을 명확히 분리
- `AppUser`에서 `password` 제거, 별도 `LocalDemoUser extends AppUser { password: string }` 타입으로 분리
- 실서버 모드에서는 `password`를 절대 메모리에 두지 않도록 보장

**영향 파일**: `src/features/accounts/model/types.ts`, `src/features/accounts/model/fixtures.ts`

---

### 🔴 [P0-9] SettingsTab 영어 텍스트 "Manage" 하드코딩

```tsx
// SettingsTab.tsx:255
<Text style={styles.infoBadgeText}>Manage</Text>
```

**해야 할 것**: "관리" 또는 제거 (이 배지가 무슨 의미인지 불명확)

**영향 파일**: `src/features/accounts/components/detail-tabs/SettingsTab.tsx:255`

---

## P1 — 출시 전 필수 개선

### 🟠 [P1-1] 인증 토큰 만료 처리 — Refresh Token 미구현

**현상**: 401 발생 시 강제 로그아웃만 하고 토큰 갱신 시도 없음.
`refreshToken`이 저장은 되지만 실제로 사용되는 코드가 없음.

```typescript
// useRuntimeProvider.ts:167-175
useEffect(() => {
  if (!remoteMeetingsQuery.error) return
  if (isApiError(remoteMeetingsQuery.error) && remoteMeetingsQuery.error.status === 401) {
    setAuthTokens(null)   // ← 토큰 갱신 시도 없이 바로 로그아웃
    setCurrentUser(null)
  }
}, [remoteMeetingsQuery.error, ...])
```

**해야 할 것**:
- 백엔드에 refresh token 엔드포인트가 있다면 `http-client.ts` 또는 `useRuntimeProvider`에서 자동 갱신 로직 구현
- `authTokens.refreshToken` 실제 활용
- 갱신 실패 시에만 로그아웃

**영향 파일**: `src/core/providers/hooks/useRuntimeProvider.ts`, `src/core/api/http-client.ts`

---

### 🟠 [P1-2] `lastBackendFailure` 전역 모듈 변수 — Race Condition

**현상**: `backend-v1-adapter.ts`에 `let lastBackendFailure` 모듈 레벨 전역 변수.
동시 API 호출 시 마지막 실패 정보가 덮어씌워짐.

```typescript
// backend-v1-adapter.ts:70
let lastBackendFailure: BackendFailureInfo | null = null
```

**해야 할 것**:
- `tryBackend`가 실패 정보를 직접 반환하도록 리팩토링: `{ data: T | null, failure: BackendFailureInfo | null }`
- `getLastBackendFailure()` 함수 제거
- `useRuntimeProvider`에서 각 호출 결과의 failure를 직접 처리

**영향 파일**: `src/features/accounts/api/backend-v1-adapter.ts`

---

### 🟠 [P1-3] `apiConfig.ts` TODO 주석 정리 — Vercel Failsafe 로직

```typescript
// config.ts:40-46
// TODO: [Cleanup] Vercel 빌드 시 환경 변수 주입이 완벽하게 확인되면 아래 Failsafe 로직은 제거해도 됩니다.
if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
  if (!env.EXPO_PUBLIC_API_MODE) {
    mode = "real"
  }
}
```

**해야 할 것**:
- Vercel 환경변수 주입이 안정적인지 확인 후 제거 여부 결정
- 제거한다면 `EXPO_PUBLIC_API_MODE=real`이 Vercel 대시보드에 설정되어 있는지 확인

**영향 파일**: `src/core/api/config.ts:40-46`

---

### 🟠 [P1-4] `withdraw()` 후 accounts 데이터 정리 미완성

**현상**: 탈퇴 시 `setUsers`, `setCurrentUser`, `setSelectedAccountId`는 정리하지만
`setAccounts`를 초기화하지 않아 탈퇴 후에도 계좌 데이터가 메모리에 남을 수 있음.

```typescript
// useAuthProvider.ts:178-186
const withdraw = useCallback(() => {
  if (!currentUser) return
  setUsers((prev) => prev.filter((u) => u.id !== userId))
  setCurrentUser(null)
  setSelectedAccountId(null)
  setAuthTokens(null)
  // ← setAccounts(cloneAccounts(defaultAccounts)) 없음
```

**해야 할 것**: `setAccounts` 초기화 추가, `setDataSource("demo")` 추가

**영향 파일**: `src/core/providers/hooks/useAuthProvider.ts:178`

---

### 🟠 [P1-5] 계좌 생성 시 API 응답 정합성 문제

**현상**: `createMeetingWithSwaggerApi`의 응답이 `null`이지만, 실제로는 생성된 계좌 정보를 받아야 함.

```typescript
// swagger-api.ts:104-106
export async function createMeetingWithSwaggerApi(accessToken: string, payload: SwaggerCreateMeetingRequest) {
  return apiClient.post<null>("/api/meeting/create", payload, ...)
  // ← null 타입: 응답 없이 성공만 판단
}
```

계좌 생성 후 목록을 다시 fetch해야 신규 계좌가 보임.

**해야 할 것**:
- 백엔드 응답에 생성된 meetingId가 포함되는지 확인
- 응답 타입 수정 후 생성 후 즉시 계좌 목록 갱신 (현재는 별도 refresh 필요)

**영향 파일**: `src/features/accounts/api/swagger-api.ts:104`, `src/core/providers/hooks/useAccountsOperations.ts`

---

### 🟠 [P1-6] `useAuthForm` 회원가입 실패 시 에러 메시지 고정 문자열

**현상**: 실서버 회원가입 실패 시 `feedbackPresets.signupFailed.message` (고정 문자열)을 표시하지만,
실제 서버 에러 메시지(예: "이미 가입된 이메일")는 `setLastSyncError`를 통해서만 전달되고 있음.

```typescript
// useAuthForm.ts:33-36
const ok = await signup(name, email, password)
if (!ok) {
  setError(feedbackPresets.signupFailed.message)  // ← 항상 같은 메시지
  showError(feedbackPresets.signupFailed.message, ...)
}
```

`signup()`이 `false`를 반환하면서 에러 메시지를 `lastSyncError`에만 넣고 `useAuthForm`에는 전달하지 않음.

**해야 할 것**:
- `login()`, `signup()`이 `false` 대신 `{ ok: boolean, error?: string }` 반환하도록 변경
- 또는 `useAuthForm`이 `lastSyncError`를 구독하여 표시

**영향 파일**: `src/features/auth/hooks/useAuthForm.ts`, `src/core/providers/hooks/useAuthProvider.ts`

---

### 🟠 [P1-7] `AppSettings` / `MyPage` 화면 기능 미완성

**현상**: `AppSettingsScreen`, `MyPageScreen`에 UI는 있지만 실서버 데이터 연동 여부 확인 필요.
특히 프로필 수정(`updateProfile`)이 로컬 state만 바꾸고 API 호출이 없음.

```typescript
// useAuthProvider.ts:146-160
const updateProfile = useCallback(async (data: UpdateProfileInput) => {
  await runBusy(async () => {
    setUsers(...)
    setCurrentUser(...)
    // ← backendAdapter.updateProfile() 또는 API 호출 없음
  })
}, ...)
```

**해야 할 것**:
- 프로필 수정 API 엔드포인트 연동 (있을 경우)
- 없다면 UI에서 "저장" 버튼 제거 또는 로컬 전용임을 명시

**영향 파일**: `src/core/providers/hooks/useAuthProvider.ts:146`

---

### 🟠 [P1-8] `detailTabMemory` 모듈 레벨 Map — 메모리 누수 가능성

```typescript
// AccountDetailScreen.tsx:27
const detailTabMemory = new Map<string, DetailTab>()
```

앱 사용 중 계좌가 추가/삭제되어도 Map 항목이 지워지지 않음.
계좌 수가 많아질수록 메모리 점유.

**해야 할 것**:
- 계좌 삭제 시 해당 id 항목 제거
- 또는 최근 N개만 유지하는 LRU 방식으로 변경
- 또는 Context/useState로 이동하여 생명주기 관리

**영향 파일**: `src/features/accounts/screens/AccountDetailScreen.tsx:27`

---

### 🟠 [P1-9] 뮤테이션 에러 표시 — `lastMutationError` 미표시 화면 다수

**현상**: `runBusy`에서 에러 발생 시 `lastMutationError`에 저장하지만,
대부분의 화면이 이를 표시하지 않아 사용자가 에러를 모름.

```typescript
// useRuntimeProvider.ts:190
setLastMutationError(getErrorMessage(err, "작업 처리 중 오류가 발생했습니다."))
```

`AppRouter.tsx`에서 `SpinnerOverlay` 외에 에러 표시 UI가 없음.

**해야 할 것**:
- `lastMutationError` 발생 시 자동으로 Toast 표시 (FeedbackProvider 활용)
- 또는 각 화면에서 `lastMutationError`를 `StatusBanner`로 표시
- `clearMutationError`가 Toast 닫힘과 연동되도록 구성

**영향 파일**: `src/core/AppRouter.tsx`, `src/core/providers/AppProvider.tsx`

---

### 🟠 [P1-10] `continueAsGuest()` — 게스트 사용자 구분 없음

**현상**: 게스트 로그인 시 일반 사용자와 동일하게 동작.
게스트임에도 "탈퇴", "프로필 수정" 등 UI가 표시됨.

```typescript
// useAuthProvider.ts:168-176
const continueAsGuest = useCallback(() => {
  setCurrentUser({
    id: "guest",
    name: "게스트",
    email: "guest@example.com",
    password: "",
  })
}, ...)
```

**해야 할 것**:
- `AppUser`에 `isGuest?: boolean` 필드 추가 또는 id 기반 구분
- 게스트 사용자에게는 비활성화 또는 미표시되어야 할 UI 항목 처리 (탈퇴, 프로필 수정 등)

**영향 파일**: `src/core/providers/hooks/useAuthProvider.ts:168`, `src/features/auth/screens/MyPageScreen.tsx`

---

## P2 — UI / UX 개선

### 🟡 [P2-1] DashboardTab 자체 잔액 숨김 vs 전역 maskAmounts 중복

**현상**: `AccountDetailHero`는 전역 `maskAmounts`로 잔액 마스킹.
`DashboardTab`은 자체 `showBalance` 로컬 state로 별도의 잔액 숨김 토글을 가짐.
두 곳에서 독립적으로 작동해 일관성이 없음.

```tsx
// DashboardTab.tsx:25
const [showBalance, setShowBalance] = useState(true)  // ← 독립 state
// AccountDetailHero — maskAmounts prop 사용 (전역)
```

**해야 할 것**:
- `DashboardTab`의 `showBalance`를 제거하고 전역 `maskAmounts` / `toggleMaskAmounts` 사용
- 또는 `DashboardTab`만의 잔액 숨김이 의도된 것이라면 Hero와 Dashboard가 동기화되도록 처리

**영향 파일**: `src/features/accounts/components/detail-tabs/DashboardTab.tsx:25`

---

### 🟡 [P2-2] DashboardTab 하드코딩 색상 대거 존재

```typescript
// DashboardTab.tsx
subtleText:   { color: "#6b7280" }         // → uiColors.textMuted
balanceLabel: { color: "#6b7280" }         // → uiColors.textMuted
balanceText:  { color: "#111827" }         // → uiColors.textStrong, fontSize 30 → uiTypography 추가 필요
metricText:   { color: "#111827" }         // → uiColors.textStrong
summaryPillLabel: { color: "#6b7280" }     // → uiColors.textMuted
summaryPillValue: { color: "#111827" }     // → uiColors.textStrong
progressTrack: { backgroundColor: "#e5e7eb" }  // → uiColors.border
progressFill:  { backgroundColor: "#3b82f6" }  // → uiColors.primary
unpaidBadge:   { backgroundColor: "#fff1f2", borderColor: "#fecdd3" }  // → uiColors.dangerSoft, uiColors.dangerBorder
unpaidText:    { color: "#dc2626" }        // → uiColors.danger
memberName:    { color: "#111827" }        // → uiColors.textStrong
```

**해야 할 것**: 모든 하드코딩 색상을 `uiColors.*` 토큰으로 교체

**영향 파일**: `src/features/accounts/components/detail-tabs/DashboardTab.tsx`

---

### 🟡 [P2-3] 중복 스타일 패턴 — recipes로 통합 필요

여러 탭 컴포넌트에 동일한 스타일이 반복 정의됨:

| 패턴 | 중복 위치 |
|------|----------|
| `rowBetween` (flex row + space-between) | DashboardTab, DuesTab, SettingsTab, MembersTab 등 |
| `summaryPill` + `summaryPillRow` | DashboardTab, DuesTab |
| `progressTrack` + `progressFill` | DashboardTab, DuesTab |
| `stackCompact` (gap: 10) | DashboardTab, DuesTab, TransactionsTab 등 |
| `arrowButton` (원형 버튼) | DuesTab, 여러 곳 |
| `statusPill` / `statusChip` | DuesTab, SettingsTab |
| `avatar` (이니셜 원형) | DuesTab, MembersTab |

**해야 할 것**:
- `shared/ui/recipes.ts`에 공통 패턴 추가
- 각 컴포넌트에서 recipes 참조로 교체
- `summaryPill`, `progressTrack`, `avatar` 등을 별도 컴포넌트로 추출 고려

**영향 파일**: `src/shared/ui/recipes.ts`, 각 detail-tabs 컴포넌트

---

### 🟡 [P2-4] 회비 탭 달 선택 UI 중복 — 화살표 + 칩 이중 구조

**현상**: 이전/다음 화살표 버튼과 달 선택 ActionChip 목록이 동시에 표시되어 UI 과부하.
모바일 화면에서는 특히 지저분해 보일 수 있음.

**해야 할 것**:
- 달 칩 목록(월 표시) 또는 화살표 네비게이션 중 하나만 사용
- 권장: 화살표 + 현재 달 텍스트만 유지, 칩 목록은 드롭다운으로 변경

**영향 파일**: `src/features/accounts/components/detail-tabs/DuesTab.tsx:64-103`

---

### 🟡 [P2-5] `isMutating` SpinnerOverlay — 모든 작업에 전체 화면 스피너

**현상**: 회비 납부 토글, 알림 읽음 처리 등 단순 작업에도 전체 화면을 덮는 스피너가 표시됨.
UX 저해 — 사용자가 다른 항목을 볼 수 없음.

```tsx
// AppRouter.tsx:113
<SpinnerOverlay visible={isMutating} />
```

**해야 할 것**:
- 경량 작업(토글, 읽음 처리): 인라인 로딩 표시 또는 낙관적 업데이트 사용
- 중요 작업(계좌 삭제, 회원 탈퇴): 스피너 유지
- `runBusy`에 `{ spinner?: boolean }` 옵션 추가하여 선택적 스피너 표시

**영향 파일**: `src/core/AppRouter.tsx`, `src/core/providers/hooks/useRuntimeProvider.ts`

---

### 🟡 [P2-6] AccountDetail 빈 계좌 상태 화면 빈약

```tsx
// AccountDetailScreen.tsx:138-145
if (!account) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>선택된 모임이 없습니다.</Text>
      <Text style={styles.emptyDescription}>목록에서 모임통장을 다시 선택해주세요.</Text>
    </View>
  )
}
```

뒤로가기 버튼, 목록으로 이동 버튼이 없어 사용자가 갇힘.

**해야 할 것**: `EmptyStateCard`에 "목록으로 돌아가기" 버튼 추가

**영향 파일**: `src/features/accounts/screens/AccountDetailScreen.tsx:138`

---

### 🟡 [P2-7] 로그인 화면 `backgroundColor: "#ffffff"` 하드코딩

```typescript
// LoginScreen.tsx:112
screen: {
  backgroundColor: "#ffffff",  // → uiColors.background
}
```

**영향 파일**: `src/features/auth/screens/LoginScreen.tsx:112`

---

### 🟡 [P2-8] 소셜 로그인 버튼 — 준비 중 Alert만 표시

```typescript
// LoginScreen.tsx:35-41
const handleSocialLogin = (provider: "google" | "kakao") => {
  Alert.alert("준비 중", `... 기능은 현재 준비 중입니다.`, ...)
}
```

버튼은 표시되는데 실제 동작 없음. 사용자 혼선 유발.

**해야 할 것**: 구현 계획이 없다면 버튼 완전 제거 또는 비활성화 + 출시 후 추가 계획 수립

**영향 파일**: `src/features/auth/components/AuthFormCard.tsx`, `src/features/auth/screens/LoginScreen.tsx`

---

### 🟡 [P2-9] `COPY` 상수 파일 거의 비어있음 — 인라인 문자열 난립

```typescript
// copy.ts
export const COPY = {
  auth: {
    testAccountLabel: "",  // ← 빈 문자열
  },
  notification: {
    title: "알림 설정",
    ...
  },
}
```

실제 UI에 쓰이는 한국어 문자열 대부분이 컴포넌트에 직접 인라인으로 존재.
"이 달의 회비 기록이 없습니다", "납부 안내 전송", "계좌번호를 복사했어요." 등.

**해야 할 것**:
- 빈번히 재사용되는 성공/실패 메시지를 `copy.ts` 또는 `feedback-presets.ts`로 이동
- 이후 i18n 도입을 고려하여 구조 설계

**영향 파일**: `src/shared/constants/copy.ts`

---

### 🟡 [P2-10] 계좌 목록 새로고침 — 성공/실패 구분 토스트 통일

**현상**: `AccountListScreen`과 `AccountDetailScreen` 모두 새로고침 후 토스트를 표시하지만
메시지가 약간 다름. 일관성 필요.

**해야 할 것**: 새로고침 결과 토스트 메시지 표준화 및 `feedback-presets.ts`로 이동

---

### 🟡 [P2-11] 키보드 회피 — Android 미처리

```tsx
// LoginScreen.tsx:44-47
<KeyboardAvoidingView
  behavior={Platform.select({ ios: "padding", android: undefined })}
>
```

Android에서 키보드가 입력창을 가릴 수 있음.

**해야 할 것**: `android: "height"` 또는 `"padding"` 적용 후 Android 실기기 테스트

---

### 🟡 [P2-12] 계좌 번호 빈칸 시 복사 버튼 표시 문제

`toGroupAccountSummary`에서 `accountNumber: ""`이므로 실서버 계좌는 계좌번호가 없음.
대시보드에서 계좌번호 복사 버튼을 누르면 빈 문자열 복사.

**해야 할 것**: `accountNumber`가 빈 문자열이면 복사 버튼 숨기기

**영향 파일**: `src/features/accounts/components/detail-tabs/DashboardTab.tsx:34-43`

---

## P3 — 코드 품질 / 리팩토링

### 🔵 [P3-1] `SettingsTab` 670줄 — 분리 필요

단일 컴포넌트에 너무 많은 책임이 집중되어 있음:
- 계좌 기본정보 편집
- 자동이체 설정
- 1회성 회비 CRUD
- 위험 영역(삭제)

**해야 할 것**:
```
SettingsTab.tsx
├── AccountInfoPanel.tsx
├── AutoTransferPanel.tsx
├── OneTimeDuesPanel.tsx (내부에 OneTimeDuesForm, OneTimeDuesList)
└── DangerZonePanel.tsx
```

**영향 파일**: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`

---

### 🔵 [P3-2] `useApp()` 스프레드 병합 — 키 충돌 가능성

```typescript
// AppProvider.tsx:157-162
export function useApp(): AppContextType {
  const runtime = useAppRuntime()
  const auth = useAppAuth()
  const accounts = useAppAccounts()
  return useMemo(() => ({ ...runtime, ...auth, ...accounts }), [...])
}
```

세 컨텍스트에 동일 이름 프로퍼티가 있으면 조용히 덮어씌워짐. 현재는 없지만 확장 시 위험.

**해야 할 것**:
- `useApp()` 사용처를 각각 `useAppRuntime()`, `useAppAuth()`, `useAppAccounts()`로 분리
- `useApp()` 함수 자체를 deprecated 또는 제거

---

### 🔵 [P3-3] `DuesTab`이 `useApp()` 사용 — 불필요한 컨텍스트 구독

```typescript
// DuesTab.tsx:23
const { toggleDues, sendPaymentReminder, sendTransferRequest } = useApp()
```

`useApp()`은 3개 컨텍스트를 모두 합침 → 불필요한 리렌더 유발 가능.

**해야 할 것**: `useAppAccounts()` 로 교체

---

### 🔵 [P3-4] `swagger-api.ts`와 `backend-v1-adapter.ts` 책임 분리 불명확

- `swagger-api.ts`: 직접 `apiClient` 호출, 도메인 변환 함수(`toGroupAccountSummary`) 포함
- `backend-v1-adapter.ts`: 어댑터 패턴, `tryBackend` 래퍼 포함

두 파일의 역할이 혼재됨.

**해야 할 것**:
- `swagger-api.ts`를 순수 API 함수(fetch only)로 유지
- 도메인 변환 함수(`toGroupAccountSummary`, `createRemoteUser`)를 `mappers.ts`로 이동

---

### 🔵 [P3-5] `useAccountsOperations` 참조 없음 — 확인 필요

`useAccountsProvider.ts:8`에서 `useAccountsOperations` import하지만, 이 파일의 실제 구현 내용이 별도 파일에 있음. 해당 파일도 검토하여 코드 일관성 확인 필요.

---

### 🔵 [P3-6] 날짜 포맷 일관성 부재

```typescript
// SettingsTab.tsx:22 — 자체 날짜 계산 함수 inline 정의
function getNextTransferDate(day: number) {
  const now = new Date()
  // ...직접 날짜 조작
}
```

`shared/lib/date.ts`, `shared/lib/format.ts`에 이미 날짜 유틸이 있음에도 각 컴포넌트에서 직접 날짜 처리.

**해야 할 것**: `getNextTransferDate`를 `shared/lib/date.ts`로 이동

---

### 🔵 [P3-7] `validationError ??` 연산자 체인 — 가독성 개선 가능

```typescript
// SettingsTab.tsx:128-134
const validationError =
  requireText(groupName, "모임명을 입력해주세요.") ??
  requireText(bankName, "은행명을 입력해주세요.") ??
  requireText(accountNumber, "계좌번호를 입력해주세요.") ??
  validatePositiveNumber(monthlyDues, "월 회비를 올바르게 입력해주세요.") ??
  validateDayOfMonth(accountDueDay)
```

패턴 자체는 나쁘지 않지만 동일 패턴이 여러 곳에 반복됨.

**해야 할 것**: `validateAll(...rules)` 헬퍼 함수 `shared/lib/validation.ts`에 추가

---

### 🔵 [P3-8] `TypeScript strict` 미활용 옵션 확인

`tsconfig.json`에서 `strict: true`가 설정되어 있는지 확인.
현재 `(payload as { accountId?: string })` 같은 강제 캐스팅이 다수 존재.

**해야 할 것**:
- Route params 타입을 `useRoute<RouteProp<...>>()`로 안전하게 처리
- `as` 캐스팅 최소화

---

### 🔵 [P3-9] `console.log` 디버깅 출력 — 배포 환경 노출

```typescript
// config.ts:58-62
if (typeof window !== "undefined") {
  console.log("[api.config] Current API Mode:", apiConfig.mode)
  console.log("[api.config] Current API BaseURL:", apiConfig.baseUrl ?? "RELATIVE")
  console.log("[api.config] EXPO_PUBLIC_API_MODE:", process.env.EXPO_PUBLIC_API_MODE)
}
```

배포 환경에서도 콘솔에 API 설정 정보 노출.

**해야 할 것**: `logger.debug()` 또는 개발 환경에서만 출력하도록 조건 추가

---

### 🔵 [P3-10] 미사용 코드 — `backend-v1-adapter.ts`의 데드코드

다음 함수들은 현재 실제로 호출되지 않는 것으로 보임:
- `backendAdapter.login()` (실제 로그인은 `loginWithSwaggerApi` 사용)
- `backendAdapter.signup()` (실제 회원가입은 `signupWithSwaggerApi` 사용)
- `backendAdapter.loadBootstrap()` (`prefersRealApi: true`면 스킵됨)

**해야 할 것**: 실제 사용 여부 확인 후 데드코드 제거 또는 활용

---

## P4 — 장기 과제

### ⚪ [P4-1] 오프라인 지원 / 캐싱

- React Query staleTime/cacheTime 설정으로 기본 캐싱 활성화
- 오프라인 상태 감지 및 안내 배너 표시
- 쓰기 작업 큐(offline mutation queue) 구현

---

### ⚪ [P4-2] 푸시 알림 실구현

현재 알림은 앱 내 로컬 알림 목록(`NotificationItem[]`)만 존재.
실제 모바일 푸시 알림 없음.

**해야 할 것**:
- `expo-notifications` 설치 및 설정
- 백엔드와 FCM/APNs 연동
- 회비 마감 알림, 납부 안내, 거래 알림 구현

---

### ⚪ [P4-3] 에러 트래킹 / 모니터링

- Sentry 또는 유사 서비스 연동
- `AppErrorBoundary`에서 에러 리포팅
- API 에러 통계 수집

---

### ⚪ [P4-4] 접근성 (Accessibility) 개선

- 아바타 이미지에 `accessibilityLabel` 추가
- 색상 대비 WCAG AA 기준 충족 확인 (lilac, soft 계열 색상 주의)
- 키보드 네비게이션 (웹 버전) 지원
- 스크린 리더 대응 (`accessibilityRole`, `accessibilityState` 완전 적용)

---

### ⚪ [P4-5] 국제화 (i18n) 준비

현재 모든 문자열이 한국어 하드코딩. 향후 다국어 지원을 위한 기반 작업:
- `react-i18next` 또는 유사 라이브러리 도입
- 모든 UI 문자열을 번역 파일로 이동
- `copy.ts` → i18n 키 레지스트리로 전환

---

### ⚪ [P4-6] 테스트 커버리지 확대

현재 단위 테스트 20+개 존재하지만 커버리지 불명확.

**해야 할 것**:
- `useAuthProvider` 로그인/회원가입 플로우 통합 테스트
- `useRuntimeProvider` 세션 복원 테스트
- `AccountDetailScreen` 탭 전환 테스트
- E2E: 계좌 생성 → 멤버 추가 → 회비 납부 완전 플로우 테스트
- CI에서 커버리지 임계값(예: 70%) 강제

---

### ⚪ [P4-7] `localStorage` 마이그레이션 전략

현재 `session-storage.ts`, `auth-token-storage.ts`, `preferences-storage.ts`가
직접 `localStorage`를 사용. 스키마 변경 시 마이그레이션 로직 없음.

**해야 할 것**:
- 각 스토리지에 버전 키(`_v`) 추가
- 버전 불일치 시 자동 초기화 또는 마이그레이션 함수 실행
- 테스트용 in-memory 스토리지 어댑터 구현

---

### ⚪ [P4-8] 성능 최적화

- `AccountSummaryCard`, `MemberRow`, `TransactionRow` — `React.memo` 적용 검토
- `getHomeAccounts()`, `getPaymentSummary()` — 대규모 데이터에서 `useMemo` 필요
- 긴 거래 목록의 가상화(virtualized list) 검토 (`FlatList` 또는 `FlashList`)

---

### ⚪ [P4-9] 웹 vs 모바일 플랫폼 분기 통일

현재 `Platform.select({ ios: "padding", android: undefined })` 같은 분기가 산재.
웹(Expo for web)에서의 렌더링 검증 필요.

---

### ⚪ [P4-10] 초대 링크 실제 동작 구현

```typescript
// invite.ts
export function buildAccountInviteLink(account: GroupAccount): string {
  // 현재 구현 확인 필요 — deep link로 계좌 합류가 동작하는지?
}
```

딥링크로 계좌 합류 플로우가 실제로 동작하는지 확인 및 구현 완성.

---

## 기술 부채 현황 요약

| 우선순위 | 항목 수 | 예상 영향 |
|---------|--------|---------|
| P0 (출시 차단) | 9개 | 출시 불가 / 사용자 기능 오류 |
| P1 (출시 전 필수) | 10개 | 데이터 손실 / 보안 / 신뢰성 |
| P2 (UX/UI) | 12개 | 사용자 혼란 / 품질 저하 |
| P3 (코드 품질) | 10개 | 유지보수성 / 버그 위험 |
| P4 (장기) | 10개 | 성장성 / 확장성 |

### 즉시 착수 권장 순서

```
1. [P0-1] 검색창 UI 추가                          — 30분
2. [P0-7] 로그인 300ms 딜레이 제거                  — 5분
3. [P0-6] real 모드 데모 딜레이 스킵                 — 10분
4. [P0-9] "Manage" → 한국어 수정                    — 5분
5. [P0-5] availableMonths 동적 계산                 — 1시간
6. [P1-9] lastMutationError → Toast 자동 연동        — 1시간
7. [P2-1] DashboardTab showBalance → maskAmounts    — 30분
8. [P2-2] 하드코딩 색상 → uiColors 토큰 교체          — 2시간
9. [P0-3] API 엔드포인트 체계 통합                    — 반나절 (백엔드 확인 필요)
10. [P0-2] 실서버 계좌 상세 데이터 연동               — 하루 이상 (백엔드 API 확인 필요)
```

---

*마지막 업데이트: 2026-03-19*
*기준 브랜치: main (commit 81be5f7)*
