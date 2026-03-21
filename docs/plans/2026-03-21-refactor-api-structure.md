# API 구조 리팩토링 & 문서화 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** swagger-api.ts를 피처별로 분리하고, React Query 공식 패턴(쿼리 키 팩토리, 커스텀 훅)을 도입하며, README/아키텍처 문서를 작성한다.

**Architecture:**
- `swagger-api.ts` → `auth/api/auth-api.ts` + `accounts/api/meetings-api.ts` 로 분리
- 쿼리 키 팩토리: `src/core/api/query-keys.ts`
- React Query 커스텀 훅: 피처별 `api/queries.ts`, `api/mutations.ts`
- Provider 훅들이 new hooks를 통해 쿼리를 사용하도록 업데이트
- TypeScript 오류 없이 진행

**Tech Stack:** Expo React Native, TypeScript, @tanstack/react-query v5

---

## Task A: README.md 작성/업데이트

**Files:**
- Create/Modify: `README.md`

현재 README 확인 후, 아래 내용으로 작성:

```markdown
# getdon mate

모임 운영 흐름을 빠르게 확인하고 바로 정리하는 모임통장 관리 앱.

## 기술 스택

- **프레임워크**: Expo (React Native)
- **언어**: TypeScript (strict mode)
- **상태 관리**: React Context API + @tanstack/react-query
- **HTTP 클라이언트**: fetch 기반 커스텀 클라이언트
- **내비게이션**: @react-navigation/native-stack

## 시작하기

### 환경 설정

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev           # Expo 개발 서버 (API: real 모드)
npm run dev:proxy     # 개발 프록시 포함
```

### 빌드

```bash
npm run build:web     # 웹 빌드 (Vercel 배포용)
```

## 프로젝트 구조

```
src/
├── core/                   # 앱 전체 공통 레이어
│   ├── api/                # HTTP 클라이언트, 에러, 설정
│   ├── providers/          # 전역 상태 (AppProvider, 3-Context)
│   ├── query/              # React Query 클라이언트 설정
│   └── navigation/         # 라우트 정의
├── features/               # 피처별 모듈
│   ├── accounts/           # 모임통장 관리
│   │   ├── api/            # API 함수 + React Query 훅
│   │   ├── model/          # 타입, 픽스처, 셀렉터
│   │   ├── screens/        # 화면 컴포넌트
│   │   └── components/     # UI 컴포넌트
│   └── auth/               # 인증
│       ├── api/            # 인증 API 함수 + 훅
│       ├── screens/        # 로그인, 마이페이지
│       └── hooks/          # useAuthForm
└── shared/                 # 공통 유틸리티
    ├── ui/                 # 디자인 시스템 (토큰, 컴포넌트)
    ├── lib/                # 유틸리티 함수
    └── constants/          # 상수 (COPY 텍스트)
```

## API 구성

백엔드: `https://getdon-api.duckdns.org`

| 피처 | 함수 | 메서드 | 경로 |
|------|------|--------|------|
| 인증 | `loginWithApi` | POST | `/api/member/login` |
| 인증 | `signupWithApi` | POST | `/api/member/join` |
| 인증 | `refreshTokenWithApi` | POST | `/api/token/refresh` |
| 모임 | `fetchMyMeetings` | GET | `/api/meeting/my-list` |
| 모임 | `fetchMeetingDetail` | GET | `/api/meeting/:id` |
| 모임 | `createMeeting` | POST | `/api/meeting/create` |

## 상태 관리 구조

앱의 전역 상태는 3개의 Context로 분리됩니다:

- **AppRuntimeContext**: 부트스트랩, 동기화, 알림, 설정
- **AppAuthContext**: 인증(로그인/회원가입/로그아웃)
- **AppAccountsContext**: 모임통장 CRUD, 회비, 거래, 게시판

```typescript
// 사용 예시
const { isBootstrapping, prefersRealApi } = useAppRuntime()
const { login, currentUser } = useAppAuth()
const { accounts, createAccount } = useAppAccounts()
```

## 환경 변수

| 변수 | 값 | 설명 |
|------|-----|------|
| `EXPO_PUBLIC_API_MODE` | `real` \| `demo` | API 모드 (기본: real) |
| `EXPO_PUBLIC_API_BASE_URL` | URL | 백엔드 API 주소 |

## 데이터 소스

- **real 모드**: 백엔드 Swagger API 사용 (JWT 인증)
- **demo 모드**: 로컬 fixtures 데이터 사용 (오프라인)
- 자동 fallback: 로그인 없이 앱 사용 시 demo 데이터로 표시
```

### 커밋
```bash
git add README.md
git commit -m "docs: README.md 프로젝트 정보 전면 업데이트"
```

---

## Task B: 쿼리 키 팩토리 생성

**Files:**
- Create: `src/core/api/query-keys.ts`

React Query 공식 권장 패턴인 **쿼리 키 팩토리**를 도입합니다.

```typescript
// src/core/api/query-keys.ts
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
} as const

export const meetingKeys = {
  all: ["meetings"] as const,
  lists: () => [...meetingKeys.all, "list"] as const,
  list: (accessToken: string) => [...meetingKeys.lists(), { accessToken }] as const,
  details: () => [...meetingKeys.all, "detail"] as const,
  detail: (meetingId: string) => [...meetingKeys.details(), meetingId] as const,
} as const
```

### 커밋
```bash
git add src/core/api/query-keys.ts
git commit -m "feat(query): 쿼리 키 팩토리 추가 (query-keys.ts)"
```

---

## Task C: auth API 피처별 분리

**Files:**
- Create: `src/features/auth/api/auth-api.ts`
- Create: `src/features/auth/api/use-auth-mutations.ts`
- Modify: `src/features/accounts/api/swagger-api.ts` (auth 관련 함수 제거 또는 re-export)
- Modify: `src/core/providers/hooks/useAuthProvider.ts` (새 경로 import로 교체)

### Step 1: auth-api.ts 생성

`src/features/auth/api/auth-api.ts` 에 인증 관련 API 함수 이동:

```typescript
// src/features/auth/api/auth-api.ts
import { apiClient } from "@core/api"

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  userName: string
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export async function loginWithApi(req: LoginRequest): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>("/api/member/login", req)
}

export async function signupWithApi(req: SignupRequest): Promise<void> {
  return apiClient.post<void>("/api/member/join", req)
}

export async function refreshTokenWithApi(refreshToken: string): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>("/api/token/refresh", { refreshToken })
}
```

### Step 2: use-auth-mutations.ts 생성

```typescript
// src/features/auth/api/use-auth-mutations.ts
import { useMutation } from "@tanstack/react-query"
import { loginWithApi, signupWithApi, type LoginRequest, type SignupRequest } from "./auth-api"

export function useLoginMutation() {
  return useMutation({
    mutationFn: (req: LoginRequest) => loginWithApi(req),
  })
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (req: SignupRequest) => signupWithApi(req),
  })
}
```

### Step 3: swagger-api.ts에서 auth 함수를 re-export로 변경

`swagger-api.ts`에서 기존 인증 관련 함수들을 새 파일에서 re-export 하거나, import 경로를 업데이트.

**주의**: `useAuthProvider.ts`가 `swagger-api.ts`에서 `loginWithSwaggerApi`, `signupWithSwaggerApi`, `refreshAccessToken`을 import하고 있음. import 경로만 변경.

`swagger-api.ts`에서:
```typescript
// 인증 함수를 auth-api.ts로 이동 후 여기서 re-export (하위 호환)
export { loginWithApi as loginWithSwaggerApi } from "@features/auth/api/auth-api"
export { signupWithApi as signupWithSwaggerApi } from "@features/auth/api/auth-api"
export { refreshTokenWithApi as refreshAccessToken } from "@features/auth/api/auth-api"
```

또는 `useAuthProvider.ts`, `useRuntimeProvider.ts`에서 import 경로를 직접 변경.

### Step 4: useAuthProvider.ts import 경로 업데이트

기존:
```typescript
import { loginWithSwaggerApi, signupWithSwaggerApi } from "@features/accounts/api/swagger-api"
```

변경:
```typescript
import { loginWithApi, signupWithApi } from "@features/auth/api/auth-api"
```

### 커밋
```bash
git add src/features/auth/api/auth-api.ts \
  src/features/auth/api/use-auth-mutations.ts \
  src/features/accounts/api/swagger-api.ts \
  src/core/providers/hooks/useAuthProvider.ts
git commit -m "refactor(auth): 인증 API를 auth 피처로 분리"
```

---

## Task D: meetings API 구조화 + React Query 훅

**Files:**
- Create: `src/features/accounts/api/meetings-api.ts`
- Create: `src/features/accounts/api/use-meetings-query.ts`
- Modify: `src/features/accounts/api/swagger-api.ts` (모임 관련 함수 이동/re-export)
- Modify: `src/core/providers/hooks/useRuntimeProvider.ts` (쿼리 키 팩토리 사용)

### Step 1: meetings-api.ts 생성

```typescript
// src/features/accounts/api/meetings-api.ts
import { apiClient } from "@core/api"

export interface SwaggerMeetingSummary {
  meetingId: number
  title: string
  bankName: string
  bankAccount?: string
  dueDay?: number
  monthlyDues?: number
  memberCount?: number
}

export interface SwaggerMeetingDetail extends SwaggerMeetingSummary {
  // 상세 필드
}

export interface CreateMeetingRequest {
  title: string
  bankName: string
  bankAccount: string
}

export async function fetchMyMeetings(accessToken: string): Promise<SwaggerMeetingSummary[]> {
  return apiClient.get<SwaggerMeetingSummary[]>("/api/meeting/my-list", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function fetchMeetingDetail(accessToken: string, meetingId: number): Promise<SwaggerMeetingDetail> {
  return apiClient.get<SwaggerMeetingDetail>(`/api/meeting/${meetingId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function createMeeting(accessToken: string, req: CreateMeetingRequest): Promise<void> {
  return apiClient.post<void>("/api/meeting/create", req, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
```

### Step 2: use-meetings-query.ts 생성

```typescript
// src/features/accounts/api/use-meetings-query.ts
import { useMutation, useQuery } from "@tanstack/react-query"
import { meetingKeys } from "@core/api/query-keys"
import { fetchMyMeetings, createMeeting, type CreateMeetingRequest } from "./meetings-api"

export function useMeetingsQuery(accessToken: string | undefined) {
  return useQuery({
    queryKey: meetingKeys.list(accessToken ?? ""),
    queryFn: () => fetchMyMeetings(accessToken!),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  })
}

export function useCreateMeetingMutation(accessToken: string | undefined) {
  return useMutation({
    mutationFn: (req: CreateMeetingRequest) =>
      createMeeting(accessToken!, req),
  })
}
```

### Step 3: useRuntimeProvider.ts 쿼리 키 업데이트

기존 inline 쿼리 키:
```typescript
queryKey: ["swaggerMeetings", authTokens?.accessToken]
```

변경:
```typescript
import { meetingKeys } from "@core/api/query-keys"
// ...
queryKey: meetingKeys.list(authTokens?.accessToken ?? ""),
```

같은 쿼리 키를 사용하는 `queryClient.fetchQuery` 호출도 동일하게 업데이트.

### Step 4: swagger-api.ts 정리

swagger-api.ts를 슬림하게 유지:
- 이동된 함수들은 새 파일에서 re-export
- 또는 `swagger-api.ts`를 `index.ts` 역할로 변경

### 커밋
```bash
git add src/features/accounts/api/meetings-api.ts \
  src/features/accounts/api/use-meetings-query.ts \
  src/features/accounts/api/swagger-api.ts \
  src/core/api/query-keys.ts \
  src/core/providers/hooks/useRuntimeProvider.ts
git commit -m "refactor(accounts): meetings API 분리 + React Query 키 팩토리 적용"
```

---

## Task E: 아키텍처 문서 작성

**Files:**
- Create: `docs/architecture.md`

```markdown
# 아키텍처 문서

## 전체 구조

getdon mate는 Expo (React Native) 기반 모바일 앱으로, 피처 기반 폴더 구조를 사용합니다.

## 레이어 구조

### 1. Core 레이어 (`src/core/`)
앱 전체에서 공유하는 기반 코드.

- **api/**: HTTP 클라이언트, 에러 클래스, API 설정, 쿼리 키 팩토리
- **providers/**: React Context 기반 전역 상태 관리
- **query/**: React Query 클라이언트 설정
- **navigation/**: 라우트 타입 및 상수

### 2. Features 레이어 (`src/features/`)
도메인 기능별 독립 모듈.

#### `features/auth/`
- **api/**: 인증 API 함수 (`auth-api.ts`), React Query 뮤테이션 훅
- **screens/**: 로그인, 마이페이지, 설정, 알림
- **hooks/**: 폼 상태 관리 (`useAuthForm`)
- **components/**: AuthHero, AuthFormCard

#### `features/accounts/`
- **api/**: 모임 API 함수 (`meetings-api.ts`), React Query 쿼리/뮤테이션 훅
  - `swagger-api.ts` → API 진입점 (re-export 포함)
  - `meetings-api.ts` → 모임 CRUD 함수
  - `backend-v1-adapter.ts` → V1 API 추상화 (데모 fallback 지원)
  - `mappers.ts` → DTO → 도메인 변환
- **model/**: 타입 정의, 픽스처, 셀렉터, 포맷터
- **screens/**: 목록, 상세, 생성 화면
- **components/**: 탭, 패널, 카드 컴포넌트

### 3. Shared 레이어 (`src/shared/`)
피처 간 공유 코드.

- **ui/**: 디자인 시스템 (토큰, 프리미티브, 레시피)
- **lib/**: 유틸리티 함수 (날짜, 포맷, 저장소, 클립보드)
- **constants/**: UI 텍스트 (COPY)
- **config/**: 환경 변수 파싱

## 상태 관리

### Context 계층
```
AppProvider
├── AppRuntimeContext    (부트스트랩, 동기화, 알림, UI 설정)
├── AppAuthContext       (인증 상태, 로그인/회원가입/로그아웃)
└── AppAccountsContext   (모임 데이터, CRUD 오퍼레이션)
```

각 Context는 전용 커스텀 훅으로 구현:
- `useRuntimeProvider` → AppRuntimeContext 값 제공
- `useAuthProvider` → AppAuthContext 값 제공
- `useAccountsProvider` + `useAccountsOperations` → AppAccountsContext 값 제공

### React Query 사용
원격 데이터 조회에 React Query를 사용합니다:

```
src/core/api/query-keys.ts          # 쿼리 키 팩토리
features/auth/api/
  use-auth-mutations.ts             # 로그인/회원가입 뮤테이션
features/accounts/api/
  use-meetings-query.ts             # 모임 목록 쿼리
```

쿼리 키 구조:
```typescript
meetingKeys.list(accessToken)       // ["meetings", "list", { accessToken }]
meetingKeys.detail(meetingId)       // ["meetings", "detail", meetingId]
```

## 데이터 흐름

### 인증 흐름
```
LoginScreen
  → useAuthForm (폼 유효성)
  → AppAuthContext.login()
    → useAuthProvider.login()
      → loginWithApi() (auth-api.ts)
      → authTokens 저장 (auth-token-storage)
      → fetchMyMeetings 실행
      → accounts 동기화
```

### 모임 목록 조회 흐름
```
AppProvider 마운트
  → useRuntimeProvider
    → useMeetingsQuery(accessToken) // React Query
      → fetchMyMeetings()
      → toGroupAccountSummary() 매핑 (mappers.ts)
      → setAccounts() 업데이트
```

### 로컬(데모) 모드 흐름
```
prefersRealApi === false
  → backendAdapter.loadBootstrap()
  → bootstrap null 반환 시 defaultAccounts (fixtures)
  → dataSource = "demo"
```

## API 레이어

### HTTP 클라이언트 (`src/core/api/http-client.ts`)
- `apiClient.get/post/put/delete` 메서드
- 자동 JSON 파싱
- `ApiError` 클래스로 오류 변환

### 에러 처리
- `ApiError`: status, code, message
- `mapApiFailureToUserMessage()`: 상태 코드 → 사용자 메시지
- `isApiError()`: 타입 가드

### 인증 토큰 관리
- `auth-token-storage.ts`: AsyncStorage 기반 토큰 영속화
- 401 응답 시 `refreshTokenWithApi()` 자동 갱신 시도
- 갱신 실패 시 강제 로그아웃

## 개발 가이드

### 새 API 추가
1. `features/[feature]/api/[feature]-api.ts`에 함수 추가
2. `src/core/api/query-keys.ts`에 쿼리 키 추가
3. `features/[feature]/api/use-[feature]-query.ts`에 React Query 훅 추가

### 새 화면 추가
1. `features/[feature]/screens/` 에 컴포넌트 생성
2. `src/core/navigation/routes.ts`에 라우트 추가
3. `src/core/navigation/types.ts`에 파라미터 타입 추가
4. `src/core/AppRouter.tsx`에 Stack.Screen 등록

### 디자인 시스템 사용
```typescript
import { uiColors, uiSpacing, uiRadius, uiTypography } from "@shared/ui"
import { uiRecipes } from "@shared/ui"
import { Button, Card, InputField, Icon } from "@shared/ui"
```
```

### 커밋
```bash
git add docs/architecture.md
git commit -m "docs: 아키텍처 문서 작성 (architecture.md)"
```

---

## Task F: P3 UI 잔여 작업 완료 (디자인 토큰 + 스켈레톤)

**Files:**
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/BoardTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/MembersTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`

### 디자인 토큰 교체 핵심 패턴
```typescript
// before
fontSize: 12, fontWeight: "600"  →  ...uiTypography.caption
fontSize: 18, fontWeight: "800"  →  ...uiTypography.metric
gap: 8                            →  gap: uiSpacing.sm
gap: 12                           →  gap: uiSpacing.md
borderRadius: 14                  →  borderRadius: uiRadius.md
borderRadius: 18                  →  borderRadius: uiRadius.lg
```

### 스켈레톤 커버리지
AccountDetailScreen에서 `isBootstrapping` 시 모든 탭에 LoadingStateCard 표시:
```tsx
{tab === "dues" ? (
  isBootstrapping ? <LoadingStateCard lines={5} /> : <DuesTab ... />
) : null}
// members, statistics, calendar, board, settings 동일
```

### 커밋
```bash
git add src/features/accounts/screens/AccountDetailScreen.tsx \
  src/features/accounts/components/detail-tabs/BoardTab.tsx \
  src/features/accounts/components/detail-tabs/MembersTab.tsx \
  src/features/accounts/components/detail-tabs/TransactionsTab.tsx
git commit -m "refactor(ux): 디자인 토큰 교체 + 탭 스켈레톤 커버리지 개선 (P3)"
```

---

## Task G: Push 및 TypeScript 검증

```bash
# TypeScript 타입 검사
npx tsc --noEmit

# 오류 없으면 push
git push origin main
```
