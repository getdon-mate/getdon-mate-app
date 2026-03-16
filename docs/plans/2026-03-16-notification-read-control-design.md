# Notification Read Control Design

## Goal

알림 카드의 `읽음 처리` pill 버튼을 더 가벼운 라디오형 확인 표시로 바꾸고, 이후 카드 메타 재배치 작업과 충돌하지 않는 첫 단계 구조를 만든다.

## Scope

- 카드의 개별 읽음 액션을 `Button`에서 `RadioButton` 기반 컨트롤로 교체
- 읽음 여부를 텍스트 버튼이 아니라 작은 확인 affordance로 표현
- 접근성 label을 유지해 기존 테스트와 사용성 기대를 보존

## Non-Goals

- 헤더 `모두 읽음 / 비우기` 메뉴 전환
- 시간 위치 이동, unread indicator 상단 배치, 카드 높이 최적화 전체
- 알림 state 모델 변경

## Approach

### Option A. 버튼만 라디오로 교체

- 구현량이 가장 작다.
- 첫 단계로 적합하지만, 카드 하단에 상태와 액션이 같이 남는다.

### Option B. 상단 메타까지 같이 재구성

- 최종 그림에는 더 가깝다.
- 하지만 이번 단계에서 작업 범위를 넓혀 두 번째 작업(`GET-253`)과 충돌한다.

### Option C. 카드 자체를 새 컴포넌트로 분리

- 이후 확장에는 유리할 수 있다.
- 지금은 파일 분리가 YAGNI이고, 검증 범위가 불필요하게 커진다.

## Decision

이번 단계는 Option A를 채택한다.

- `NotificationListScreen` 내부에서 unread 카드의 CTA만 `RadioButton`으로 교체
- 현재 footer 구조는 유지하되, 버튼 레이블 제거로 카드 액션 밀도를 먼저 낮춘다
- 다음 단계에서 메타 위치와 카드 높이 최적화를 따로 처리한다

## Testing

- unit test로 개별 읽음 컨트롤이 더 이상 `읽음 처리` 버튼 텍스트에 의존하지 않는지 검증
- 접근성 label로 동일 카드의 읽음 액션을 찾을 수 있는지 확인
