# getdon mate

모임 운영 흐름을 빠르게 확인하고 바로 정리하는 모임통장 관리 앱.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Expo (React Native) |
| 언어 | TypeScript (strict mode) |
| 상태 관리 | React Context API + @tanstack/react-query |
| HTTP 클라이언트 | fetch 기반 커스텀 클라이언트 |
| 내비게이션 | @react-navigation/native-stack |

## 시작하기

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev          # Expo 개발 서버
npm run dev:proxy    # 로컬 프록시 포함
```

### 웹 빌드

```bash
npm run build:web    # Vercel 배포용 웹 빌드
```

## 프로젝트 구조

```
src/
├── core/                    # 앱 공통 기반
│   ├── api/                 # HTTP 클라이언트, 에러, 설정, 쿼리 키
│   ├── providers/           # 전역 상태 (AppProvider, 3-Context)
│   │   └── hooks/           # useRuntimeProvider, useAuthProvider, useAccountsOperations
│   ├── query/               # React Query 클라이언트 설정
│   └── navigation/          # 라우트 정의
├── features/                # 도메인 피처
│   ├── accounts/            # 모임통장 관리
│   │   ├── api/             # API 함수 + React Query 훅
│   │   │   ├── meetings-api.ts        # 모임 CRUD API
│   │   │   ├── use-meetings-query.ts  # 모임 쿼리 훅
│   │   │   ├── swagger-api.ts         # API 진입점
│   │   │   └── mappers.ts             # DTO → 도메인 변환
│   │   ├── model/           # 타입, 픽스처, 셀렉터
│   │   ├── screens/         # 목록, 상세, 생성 화면
│   │   └── components/      # UI 컴포넌트 (탭, 패널, 카드)
│   └── auth/                # 인증
│       ├── api/             # 인증 API + React Query 뮤테이션 훅
│       │   ├── auth-api.ts            # 로그인/회원가입/토큰 갱신
│       │   └── use-auth-mutations.ts  # 뮤테이션 훅
│       ├── screens/         # 로그인, 마이페이지
│       ├── hooks/           # useAuthForm
│       └── components/      # AuthHero, AuthFormCard
└── shared/                  # 공통 유틸
    ├── ui/                  # 디자인 시스템 (토큰, 컴포넌트)
    ├── lib/                 # 유틸리티 (날짜, 포맷, 스토리지)
    └── constants/           # UI 텍스트 (COPY)
```

## API 구성

백엔드 주소: `https://getdon-api.duckdns.org`

| 피처 | 함수 | 메서드 | 경로 |
|------|------|--------|------|
| 인증 | `loginWithApi` | POST | `/api/member/login` |
| 인증 | `signupWithApi` | POST | `/api/member/join` |
| 인증 | `refreshTokenWithApi` | POST | `/api/token/refresh` |
| 모임 | `fetchMyMeetings` | GET | `/api/meeting/my-list` |
| 모임 | `fetchMeetingDetail` | GET | `/api/meeting/:id` |
| 모임 | `createMeeting` | POST | `/api/meeting/create` |

### React Query 쿼리 키

```typescript
import { meetingKeys, authKeys } from "@core/api/query-keys"

meetingKeys.lists()                  // ["meetings", "list"]
meetingKeys.list(accessToken)        // ["meetings", "list", { accessToken }]
meetingKeys.detail(meetingId)        // ["meetings", "detail", meetingId]
```

## 상태 관리

앱 전역 상태는 3개의 Context로 분리됩니다.

```typescript
// AppRuntimeContext - 부트스트랩, 동기화, 알림, UI 설정
const { isBootstrapping, prefersRealApi, refreshAccounts } = useAppRuntime()

// AppAuthContext - 인증 상태
const { login, signup, currentUser, logout } = useAppAuth()

// AppAccountsContext - 모임 데이터 및 CRUD
const { accounts, createAccount, createTransaction } = useAppAccounts()
```

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `EXPO_PUBLIC_API_MODE` | `real` | API 모드 (`real` \| `demo`) |
| `EXPO_PUBLIC_API_BASE_URL` | — | 백엔드 API 주소 |

## 데이터 소스

- **real 모드**: 백엔드 Swagger API (JWT 인증, 토큰 자동 갱신)
- **demo 모드**: 로컬 fixtures 데이터 (오프라인, 게스트 포함)
- 로그인 없이 "게스트로 둘러보기" 선택 시 demo 데이터로 앱 탐색 가능
