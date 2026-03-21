# 아키텍처 문서

## 개요

getdon mate는 Expo (React Native) 기반 모임통장 관리 앱입니다.
피처 기반 폴더 구조와 React Context + React Query를 조합한 상태 관리를 사용합니다.

---

## 1. 폴더 구조

```
src/
├── core/                    # 앱 전체 공통 기반 레이어
│   ├── api/                 # HTTP 클라이언트, 에러 처리, 설정, 쿼리 키
│   │   ├── config.ts        # API 모드(real/demo), baseUrl, timeout 설정
│   │   ├── http-client.ts   # fetch 기반 HTTP 클라이언트
│   │   ├── errors.ts        # ApiError 클래스
│   │   ├── error-message-map.ts  # HTTP 상태코드 → 사용자 메시지 매핑
│   │   ├── query-keys.ts    # React Query 쿼리 키 팩토리
│   │   └── index.ts
│   ├── providers/           # 전역 상태 관리 (3-Context 구조)
│   │   ├── AppProvider.tsx  # AppRuntimeContext, AppAuthContext, AppAccountsContext
│   │   ├── FeedbackProvider.tsx  # Toast, Alert, Confirm 시스템
│   │   └── hooks/
│   │       ├── useRuntimeProvider.ts    # 부트스트랩, 동기화, 알림, 설정
│   │       ├── useAuthProvider.ts       # 인증 (로그인/회원가입/로그아웃)
│   │       ├── useAccountsProvider.ts   # 모임 선택, 데이터 소스
│   │       └── useAccountsOperations.ts # 모임 CRUD (회비, 거래, 게시판)
│   ├── query/
│   │   └── client.ts        # QueryClient 설정 (staleTime, retry 등)
│   └── navigation/
│       ├── routes.ts        # 라우트 상수
│       └── types.ts         # 네비게이션 파라미터 타입
├── features/
│   ├── accounts/            # 모임통장 관리 피처
│   │   ├── api/
│   │   │   ├── meetings-api.ts        # 모임 API 함수 (fetchMyMeetings, createMeeting 등)
│   │   │   ├── use-meetings-query.ts  # React Query 훅 (useMeetingsQuery)
│   │   │   ├── swagger-api.ts         # API 진입점 (re-export 포함)
│   │   │   ├── backend-v1-adapter.ts  # V1 API 추상화 (데모 fallback 지원)
│   │   │   └── mappers.ts             # DTO → 도메인 타입 변환
│   │   ├── model/
│   │   │   ├── types.ts     # GroupAccount, Member, Transaction 등 도메인 타입
│   │   │   ├── fixtures.ts  # 데모 초기 데이터
│   │   │   ├── selectors.ts # 데이터 셀렉터 함수
│   │   │   └── formatters.ts
│   │   ├── screens/
│   │   │   ├── AccountListScreen.tsx
│   │   │   ├── AccountDetailScreen.tsx
│   │   │   └── AccountCreateScreen.tsx
│   │   └── components/
│   │       ├── detail-tabs/   # Dashboard, Dues, Members, Transactions, Board 등
│   │       ├── detail-panels/ # AccountInfo, AutoTransfer, DangerZone 등
│   │       └── detail/        # DetailTabBar, AccountDetailHeader, AccountDetailHero
│   └── auth/
│       ├── api/
│       │   ├── auth-api.ts          # 인증 API 함수 (loginWithApi, signupWithApi, refreshTokenWithApi)
│       │   └── use-auth-mutations.ts # React Query 뮤테이션 훅
│       ├── screens/
│       │   ├── LoginScreen.tsx
│       │   └── MyPageScreen.tsx
│       ├── hooks/
│       │   └── useAuthForm.ts
│       └── components/
│           ├── AuthHero.tsx
│           └── AuthFormCard.tsx
└── shared/
    ├── ui/
    │   ├── primitives/   # Button, Card, Input, Icon, ActionSheet 등 기본 컴포넌트
    │   ├── tokens.ts     # uiColors, uiSpacing, uiRadius, uiTypography
    │   ├── palette.ts    # 색상 팔레트
    │   ├── recipes.ts    # 공통 스타일 패턴
    │   └── index.ts
    ├── lib/
    │   ├── auth-token-storage.ts  # JWT 토큰 영속화
    │   ├── session-storage.ts     # 선택 계정 세션 저장
    │   ├── preferences-storage.ts # 알림/마스킹 설정 저장
    │   ├── validation.ts
    │   ├── date.ts
    │   ├── format.ts
    │   └── clipboard.ts
    └── constants/
        └── copy.ts  # UI 텍스트 상수 (COPY)
```

---

## 2. 상태 관리 (3-Context 구조)

### 구조

```
AppProvider
├── AppRuntimeContext    ← useRuntimeProvider()
├── AppAuthContext       ← useAuthProvider()
└── AppAccountsContext   ← useAccountsProvider() + useAccountsOperations()
```

### AppRuntimeContext

부트스트랩, 데이터 동기화, 알림, UI 설정을 담당합니다.

```typescript
const {
  isBootstrapping,            // 초기화 중 여부
  isRefreshingAccounts,       // 데이터 재동기화 중
  isMutating,                 // runBusy 작업 중 (로딩 표시용)
  prefersRealApi,             // 실서버 API 사용 여부
  dataSource,                 // "remote" | "demo"
  lastSyncError,              // 마지막 동기화 오류 메시지
  lastMutationError,          // 마지막 작업 오류 메시지
  authRecoveryNotice,         // 인증 복구 알림 메시지
  maskAmounts,                // 금액 숨기기 토글
  notifications,              // 알림 목록
  unreadNotificationCount,    // 읽지 않은 알림 수
  refreshAccounts,            // 수동 새로고침
  toggleMaskAmounts,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  restoreNotifications,
  notificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
} = useAppRuntime()
```

### AppAuthContext

JWT 인증, 사용자 세션을 담당합니다.

```typescript
const {
  currentUser,     // 현재 로그인 사용자 (null = 비로그인/게스트)
  login,           // 이메일/비밀번호 로그인
  signup,          // 회원가입
  logout,          // 로그아웃 + 토큰 초기화
  continueAsGuest, // 게스트 모드
  updateProfile,   // 프로필 수정
  withdraw,        // 회원 탈퇴
} = useAppAuth()
```

### AppAccountsContext

모임통장 데이터와 모든 CRUD 오퍼레이션을 담당합니다.

```typescript
const {
  accounts,           // 모임통장 목록
  selectedAccountId,  // 현재 선택된 모임
  selectAccount,      // 모임 선택
  clearSelectedAccount,
  createAccount,      // 모임 생성
  deleteAccount,      // 모임 삭제
  createTransaction,  // 거래 추가
  updateTransaction,  // 거래 수정
  deleteTransaction,  // 거래 삭제
  toggleDues,         // 회비 납부 토글
  createBoardPost,    // 게시글 작성
  addBoardComment,    // 댓글 추가
  // ... 기타 CRUD
} = useAppAccounts()
```

---

## 3. API 레이어

### HTTP 클라이언트

`src/core/api/http-client.ts` — fetch 기반 커스텀 클라이언트 (`ApiClient` 클래스).

```typescript
// GET 요청
apiClient.get<T>(path, options?)
// POST 요청
apiClient.post<T>(path, body?, options?)
// PUT 요청
apiClient.put<T>(path, body?, options?)
// PATCH 요청
apiClient.patch<T>(path, body?, options?)
// DELETE 요청
apiClient.delete<T>(path, options?)
```

공통 처리:
- `Authorization: Bearer <token>` 헤더 — 호출 측에서 `withAuthHeaders(accessToken)` 옵션으로 주입
- JSON 자동 직렬화/역직렬화
- `{ data: T }` 엔벨로프 자동 언래핑 (`hasEnvelope` 검사)
- 비정상 응답 → `ApiError` 변환 (status, code, details 포함)
- AbortController 기반 타임아웃 처리
- HTTPS 환경에서 HTTP baseUrl 감지 시 Vercel 프록시(same-origin 상대 경로) 자동 전환

### 인증 API (`features/auth/api/auth-api.ts`)

| 함수 | 메서드 | 경로 | 설명 |
|------|--------|------|------|
| `loginWithApi` | POST | `/api/member/login` | 이메일/비밀번호 로그인 → `AuthTokens` 반환 |
| `signupWithApi` | POST | `/api/member/join` | 회원가입 |
| `refreshTokenWithApi` | POST | `/api/token/refresh` | 액세스 토큰 갱신 → `AuthTokens` 반환 |

### 모임 API (`features/accounts/api/meetings-api.ts`)

| 함수 | 메서드 | 경로 | 설명 |
|------|--------|------|------|
| `fetchMyMeetings` | GET | `/api/meeting/my-list` | 내 모임 목록 → `SwaggerMeetingSummary[]` |
| `fetchMeetingDetail` | GET | `/api/meeting/:meetingId` | 모임 상세 → `SwaggerMeetingDetail` |
| `createMeeting` | POST | `/api/meeting/create` | 모임 생성 |

모든 모임 API 함수는 `accessToken`을 첫 번째 인자로 받아 `Authorization: Bearer` 헤더를 설정합니다.

---

## 4. React Query 사용

### 쿼리 키 팩토리 (`src/core/api/query-keys.ts`)

TkDodo 권장 패턴 사용. 쿼리 키를 중앙화하여 캐시 무효화 일관성 보장.

```typescript
import { meetingKeys, authKeys } from "@core/api/query-keys"

// authKeys
authKeys.all                         // ["auth"]
authKeys.me()                        // ["auth", "me"]

// meetingKeys
meetingKeys.all                      // ["meetings"]
meetingKeys.lists()                  // ["meetings", "list"]
meetingKeys.list("token123")         // ["meetings", "list", { accessToken: "token123" }]
meetingKeys.details()                // ["meetings", "detail"]
meetingKeys.detail("42")             // ["meetings", "detail", "42"]
```

### 훅 목록

| 훅 | 위치 | 설명 |
|-----|------|------|
| `useMeetingsQuery(accessToken)` | `features/accounts/api/use-meetings-query.ts` | 모임 목록 조회 |
| `useCreateMeetingMutation(accessToken)` | `features/accounts/api/use-meetings-query.ts` | 모임 생성 |
| `useLoginMutation()` | `features/auth/api/use-auth-mutations.ts` | 로그인 |
| `useSignupMutation()` | `features/auth/api/use-auth-mutations.ts` | 회원가입 |

### QueryClient 설정 (`src/core/query/client.ts`)

```typescript
// 기본 설정
staleTime: 30_000       // 30초
retry: 1                // 쿼리 실패 시 1회 재시도
refetchOnWindowFocus: false
```

---

## 5. 데이터 소스

앱은 두 가지 데이터 소스를 지원합니다. `AppProvider` 초기화 시 `shouldUseRealApi(apiConfig)` 결과로 결정됩니다.

### remote 모드 (`dataSource === "remote"`)
- 백엔드 Swagger API 사용 (https://getdon-api.duckdns.org)
- JWT Bearer 인증
- 401 응답 시 `refreshTokenWithApi`로 자동 갱신
- 갱신 실패 시 `authTokens` 초기화 + 강제 로그아웃

### demo 모드 (`dataSource === "demo"`)
- `src/features/accounts/model/fixtures.ts`의 로컬 데이터 사용
- 백엔드 없이 앱의 전체 기능 탐색 가능
- "게스트로 둘러보기" 선택 시 자동 활성화

### 전환 조건
```
EXPO_PUBLIC_API_MODE=real → prefersRealApi=true  (기본값)
EXPO_PUBLIC_API_MODE=demo → prefersRealApi=false
게스트 모드 진입          → demo 데이터 사용
```

---

## 6. 에러 처리

### ApiError
```typescript
class ApiError extends Error {
  status: number    // HTTP 상태 코드 (없으면 0)
  code?: string     // 서버 에러 코드 또는 "API_TIMEOUT" / "API_NETWORK_ERROR"
  details?: unknown // 원본 응답 페이로드
}
```

### 401 자동 처리 (토큰 갱신)
```
API 요청 → 401 응답
  → refreshTokenWithApi(refreshToken) 시도
  → 성공: 새 토큰 저장 + 쿼리 자동 재실행
  → 실패: authTokens 초기화 + 로그인 화면 이동
```

### 사용자 메시지 변환
```typescript
import { mapApiFailureToUserMessage, isApiError } from "@core/api"

if (isApiError(err)) {
  const message = mapApiFailureToUserMessage(err)
  // 표시용 한국어 메시지
}
```

---

## 7. 디자인 시스템

### 토큰 (`src/shared/ui/tokens.ts`)
```typescript
uiColors.primary         // 주색상 (cobalt)
uiColors.textStrong      // 강조 텍스트
uiSpacing.md             // 12px
uiSpacing.lg             // 16px
uiRadius.md              // 14px
uiTypography.caption     // fontSize: 12, fontWeight: "600"
uiTypography.body        // fontSize: 14, fontWeight: "500"
uiTypography.section     // fontSize: 16, fontWeight: "700"
```

### 공통 컴포넌트
```typescript
import {
  Button,           // 버튼 (primary/secondary/ghost)
  Card,             // 카드 컨테이너
  InputField,       // 텍스트 입력
  Icon,             // 아이콘
  ActionSheet,      // 하단 액션 시트 (Modal 기반)
  Badge,            // 배지
  ActionChip,       // 토글 칩
  SkeletonBlock,    // 로딩 스켈레톤
} from "@shared/ui"
```

---

## 8. 개발 가이드

### 새 API 추가
1. `features/[feature]/api/[feature]-api.ts` 에 함수 추가
2. `src/core/api/query-keys.ts` 에 쿼리 키 추가
3. `features/[feature]/api/use-[feature]-query.ts` 에 React Query 훅 추가
4. Provider 훅에서 필요시 훅 연결

### 새 화면 추가
1. `features/[feature]/screens/` 에 컴포넌트 생성
2. `src/core/navigation/routes.ts` 에 라우트 상수 추가
3. `src/core/navigation/types.ts` 에 파라미터 타입 추가
4. `src/core/AppRouter.tsx` 에 `<Stack.Screen>` 등록

### 텍스트 상수 추가
```typescript
// src/shared/constants/copy.ts
export const COPY = {
  account: {
    createTitle: "새 모임통장",
    // ...
  },
}
```
