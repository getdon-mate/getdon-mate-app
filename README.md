# getdon-mate-app

Getdon 모임통장 프론트엔드 앱(Expo + React Native) 저장소입니다.

## 1. Tech Baseline

- Runtime: Expo React Native (single app)
- Language: TypeScript
- Package manager: pnpm
- Lockfile: `pnpm-lock.yaml`
- Node version: `.nvmrc` 기준
- Backend: 별도 저장소(API 연동 전까지 mock 데이터 기반 동작)

## 2. Prerequisites

```bash
nvm use
corepack enable
pnpm install
```

`nvm`이 없다면 `.nvmrc`의 Node 버전을 직접 맞춘 뒤 `pnpm install`을 실행하세요.

환경변수 파일이 필요하면 `.env.example`을 참고해 `.env`를 생성하세요.

```bash
cp .env.example .env
```

## 3. Run Commands

```bash
# 개발 서버
pnpm run start

# 플랫폼별 실행
pnpm run ios
pnpm run android
pnpm run web

# 정적 웹 산출물 생성
pnpm run export:web

# 타입 검증
pnpm run typecheck

# CI용 웹 검증(typecheck + export)
pnpm run ci:web

# Vercel 수동 배포
pnpm run deploy:vercel:preview
pnpm run deploy:vercel:production
```

## 4. Demo Flow (Mock Data)

기본 로그인 계정:

- Email: `test@test.com`
- Password: `password`

주요 데모 플로우:

1. 로그인 또는 회원가입
2. 모임통장 목록 조회
3. 모임통장 상세(홈/회비/거래/멤버/설정) 확인
4. 모임통장 생성
5. 필요 시 `데모 데이터 초기화`로 초기 상태 복귀

## 5. Build & Verification

PR 전 최소 검증:

```bash
pnpm run ci:web
```

`export:web` 성공 시 `dist/` 디렉터리가 생성됩니다.

## 6. API Runtime Config

- `EXPO_PUBLIC_API_MODE`
  - `mock`: 네트워크 요청 없이 mock 어댑터만 사용
  - `real`: backend API를 강제 사용
  - `auto`: `EXPO_PUBLIC_API_BASE_URL`이 있으면 backend 우선, 실패 시 fallback 가능
- `EXPO_PUBLIC_API_BASE_URL`: backend base URL (`http://localhost:4000` 등)
- `EXPO_PUBLIC_API_TIMEOUT_MS`: 요청 타임아웃(ms, 기본 8000)

## 7. Vercel Deployment Pipeline (GET-16)

Expo 웹 정적 산출물(`dist/`)을 기준으로 Preview/Production 배포를 분리합니다.

- Workflow: `.github/workflows/vercel-deploy.yml`
- Preview deploy: `pull_request`(target=`main`, draft 제외)
- Production deploy: `push` to `main`
- 공통 사전 검증: `pnpm run ci:web`
- 배포 스크립트: `scripts/vercel-deploy.sh`

필수 GitHub Secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Vercel 프로젝트 기본값:

- Framework Preset: `Other`
- Build Command: `pnpm run export:web`
- Output Directory: `dist`

주의:

- Preview는 PR 리뷰/데모 공유 용도입니다.
- Production은 `main` 기준 웹 배포 경로입니다.
- 모바일 앱 배포는 Expo/EAS 경로로 분리합니다.

## 8. Project Structure

```text
src/
  core/                  # 앱 라우팅/전역 provider
  features/
    auth/                # 로그인/회원가입
    accounts/            # 계좌 목록/상세 도메인
  shared/                # 공통 유틸
docs/plans/              # 작업/스펙 문서
```

## 9. Current Related Linear Tasks

- `GET-11`: Figma 대비 UI 갭 분석/수정
- `GET-14`: Mock 기반 플로우 안정화
- `GET-16`: Vercel preview/production 배포 파이프라인
- `GET-17`: package.json 기반 README 재작성
- `GET-23`: 컴포넌트/상태관리 규칙
- `GET-24`: FE/BE 계약 동기화 및 착수 게이트
