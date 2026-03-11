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
pnpm run typecheck
pnpm run export:web
```

`export:web` 성공 시 `dist/` 디렉터리가 생성됩니다.

## 6. Vercel Preview

백엔드/디자인 협업을 위한 웹 프리뷰 배포 경로입니다.

- Framework Preset: `Other`
- Build Command: `pnpm run export:web`
- Output Directory: `dist`

주의:

- Vercel은 웹 프리뷰 공유 용도입니다.
- 모바일 앱 배포는 Expo/EAS 경로로 분리합니다.

## 7. Project Structure

```text
src/
  core/                  # 앱 라우팅/전역 provider
  features/
    auth/                # 로그인/회원가입
    accounts/            # 계좌 목록/상세 도메인
  shared/                # 공통 유틸
docs/plans/              # 작업/스펙 문서
```

## 8. Current Related Linear Tasks

- `GET-11`: Figma 대비 UI 갭 분석/수정
- `GET-14`: Mock 기반 플로우 안정화
- `GET-17`: package.json 기반 README 재작성
- `GET-23`: 컴포넌트/상태관리 규칙
- `GET-24`: FE/BE 계약 동기화 및 착수 게이트
