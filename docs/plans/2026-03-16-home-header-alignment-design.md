# Home Header Alignment Design

**Date:** 2026-03-16

## Goal

홈 목록 상단의 필터 칩과 새로고침 아이콘을 같은 수평 기준선에 맞춘다. 화면 폭이 좁아질 때만 자연스럽게 줄바꿈되게 하고, 기본 배치는 한 줄에서 읽히도록 정리한다.

## Direction

- `전체`, `미납 2명+`, `새로고침`은 같은 action row 안에 둔다.
- 새로고침 버튼은 오른쪽 끝으로 밀어 같은 줄의 보조 액션으로 보이게 한다.
- 작은 화면에서는 row 전체가 wrap 되더라도 아이콘과 칩이 같은 정렬 규칙을 공유하게 만든다.
- 기존 버튼 크기와 접근성 라벨은 유지한다.

## Testing

- unit test에서 action row test id와 수평 정렬 스타일을 확인한다.
- 전체 회귀는 `pnpm test --runInBand`, `pnpm run ci:web`로 확인한다.
