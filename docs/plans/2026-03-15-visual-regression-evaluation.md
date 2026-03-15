# Visual Regression Evaluation

## Scope

- 대상: `AccountList`, `AccountDetail`, `NotificationList`, `Login`
- 목적: v0.1 화면 밀도와 빈 상태 회귀를 빠르게 감지

## Decision

- v0.1에서는 별도 시각 회귀 도구를 즉시 도입하지 않는다.
- 현재 기준선은 `Playwright smoke + jest unit` 조합으로 유지한다.
- 도입 후보는 `Playwright screenshot snapshots`가 가장 현실적이다.

## Reasoning

- Expo web 단일 출력 구조와 현재 데모 데이터 고정값이 있어 Playwright screenshot 기준선을 만들기 쉽다.
- 다만 이번 릴리즈 범위에서는 작은 화면 폴리시와 기능 회귀가 우선이라, 스냅샷 기준선까지 같이 넣으면 유지 비용이 커진다.
- 실제 네이티브 런타임 캡처 파이프라인이 없는 상태라 웹 스냅샷만 먼저 도입하면 커버리지가 절반 수준에 머문다.

## Next Step

1. `test:e2e`에 viewport별 screenshot assertion을 추가한다.
2. 홈/상세/게시판/알림 4개 핵심 화면만 먼저 기준선을 만든다.
3. 네이티브 검증 파이프라인이 준비되면 모바일 캡처까지 확장한다.
