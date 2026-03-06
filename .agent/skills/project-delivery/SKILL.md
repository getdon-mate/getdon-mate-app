---
name: project-delivery
summary: getdon-mate-app 전용 작업 실행 스킬 (GitHub Flow + Linear 중심)
---

# Project Delivery Skill

## 목적
이 스킬은 `getdon-mate-app` 저장소에서 작업할 때 프로젝트 규칙을 일관되게 적용하기 위한 기본 절차를 정의한다.

## 반드시 먼저 확인할 파일
- `.agent/rules/project-rules.md`

## 실행 절차
1. 작업의 목표를 확인한다.
2. 해당 작업이 Linear 이슈로 등록되어 있는지 확인한다.
3. 등록되지 않았다면 먼저 Linear에 이슈를 생성한다.
4. GitHub Flow 규칙에 따라 기능 브랜치에서만 작업한다.
5. PR 리뷰 후 `main` 병합을 기준으로 완료 처리한다.

## 강제 규칙
- TODO/일정/작업 추적은 모두 Linear를 단일 소스로 사용한다.
- `main`에서 직접 기능 개발을 진행하지 않는다.
- README의 라이브러리/실행 가이드는 `package.json`이 준비된 이후에만 상세 작성한다.
- 커밋 메시지는 모듈 대괄호 없이 `<type>: <summary>` 형식을 사용한다.

## 산출물 기준
- 코드 변경은 기능 브랜치 + PR 단위로 남긴다.
- 작업 상태와 계획은 Linear에 반영한다.
