# Project Rules

## Scope
- Repository: `getdon-mate-app`
- Product: 모임통장 앱 (React Native)
- API ownership: 별도 레포 / 별도 담당자

## Branch & Release Policy
- Git workflow: GitHub Flow
- `main` 브랜치는 항상 배포 가능 상태 유지
- 모든 작업은 `main`에서 분기한 기능 브랜치에서 진행
- PR 리뷰 후 `main`으로 병합
- 병합 후 작업 브랜치 삭제

## Branch Naming
- `feature/<short-topic>`
- `fix/<short-topic>`
- `chore/<short-topic>`

## Planning & Task Tracking (Linear)
- 일정 관리는 Linear를 단일 시스템으로 사용
- TODO 관련 항목은 모두 Linear 이슈로 등록
- 로컬 TODO 문서/메모를 진실 소스로 사용하지 않음
- 작업 시작 전 Linear 이슈를 먼저 확정하고, 이후 브랜치 작업 시작

## API Collaboration
- API 스펙 변경/확정은 담당자와 동기화 후 반영
- 클라이언트 구현은 API 계약(요청/응답/에러) 기준으로 진행

## README Policy
- 소스코드/`package.json`이 갖춰지기 전에는 README에 라이브러리 상세를 고정하지 않음
- 라이브러리 소개 및 앱 실행 가이드는 `package.json` 기준으로 추후 작성

## Commit Message Policy
- 이 레포는 프론트 전용이므로 모듈 대괄호 접두어(`[module]`)를 사용하지 않음
- 기본 형식: `<type>: <summary>`
- 권장 type: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
- Linear 이슈 키를 붙일 경우 형식: `<type>: <summary> (GET-123)`
