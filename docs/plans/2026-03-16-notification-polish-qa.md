# Notification Polish QA

## Scope

- `GET-252` 알림센터 읽음 컨트롤 라디오형 전환
- `GET-253` 카드 메타 위치 및 높이 재구성
- `GET-254` 헤더 관리 액션 오버플로 메뉴 전환

## QA Result

### 1. 읽음 컨트롤

- 결과: PASS
- 확인 내용:
  - unread 카드는 `RadioButton` 기반 읽음 토글을 제공한다.
  - read 카드는 같은 위치에 checked 상태 radio를 유지해 상태 슬롯 폭이 고정된다.
  - 접근성 label은 카드 제목과 읽음 상태를 함께 제공한다.

### 2. 카드 메타 구조

- 결과: PASS
- 확인 내용:
  - 상태 슬롯이 카드 우측 상단으로 이동했다.
  - 시간 메타는 카드 하단으로 내려가 본문과 분리됐다.
  - 기존 `읽음 완료` 텍스트와 하단 dot/button 조합이 사라져 카드 세로 리듬이 더 단순해졌다.

### 3. 헤더 액션 메뉴

- 결과: PASS
- 확인 내용:
  - 헤더 우측 직접 노출 버튼 대신 `ellipsis` 메뉴 트리거가 노출된다.
  - 메뉴 안에서 `모두 읽음`, `비우기`를 실행할 수 있다.
  - 웹 환경에서 메뉴 패널이 상단 레이어를 침범하지 않도록 z-index를 보강했다.

## Verification

- unit: `pnpm test tests/unit/notification-list-screen.test.tsx tests/unit/notification-settings-screen.test.tsx --runInBand`
- e2e: `pnpm exec playwright test tests/e2e/navigation-auth-regression.spec.ts -g "9-1\\)|9-2\\)"`

## Notes

- 이번 작업은 읽음 컨트롤, 카드 메타, 헤더 메뉴까지의 FE/QA 마감을 목표로 했다.
- 추가 디자인 검토 포인트는 Linear `GET-256`에 남긴 체크리스트 기준으로 후속 시각 검수에 재사용할 수 있다.
