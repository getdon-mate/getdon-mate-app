# FE Design System Guide

## 목적
- 화면별 스타일 하드코딩을 줄이고 `shared/ui` 기준으로 일관된 UI를 유지한다.
- 신규 화면 개발 시 공통 컴포넌트를 우선 사용하도록 기준을 제공한다.

## 토큰 사용 규칙
- 색상: `uiColors`만 사용한다. 임의 hex 컬러는 신규 코드에서 금지한다.
- 반경: `uiRadius`를 우선 사용한다.
- 간격: `uiSpacing`으로 레이아웃 간격을 맞춘다.
- 반복되는 블록은 `uiRecipes`에 추가 후 재사용한다.

## 공통 Primitive 사용
- 버튼: `Button`
  - 액션 강도별 `primary/secondary/ghost/danger`를 사용한다.
  - `containerStyle`, `textStyle`로 스타일을 확장한다.
- 입력: `InputField`, `NumericInputField`
  - 검증 메시지는 컴포넌트 `error` 또는 피드백 레이어로 전달한다.
- 선택: `RadioButton`, `ToggleSwitch`, `ActionChip`
- 피드백: `AlertModal`, `ConfirmDialog`, `Toast`
  - 화면에서 직접 모달 상태를 들고 있지 않고 `FeedbackProvider`를 우선 사용한다.

## 피드백 컴포넌트 스펙
- Alert
  - 필수: `title`
  - 선택: `message`, `tone`, `confirmLabel`
- Confirm
  - 필수: `title`, `onCancel`, `onConfirm`
  - 선택: `message`, `confirmTone`, `confirmLabel`, `cancelLabel`
- Toast
  - 필수: `title`
  - 선택: `message`, `tone`, `autoHideMs`

## Do / Don't
- Do
  - 섹션 헤더는 `SectionHeader`로 통일한다.
  - 필터/정렬 칩은 `ActionChip`으로 통일한다.
  - 라우팅 이름은 `ROUTES` 상수만 사용한다.
- Don't
  - `Pressable + Text` 조합을 새로 직접 만들지 않는다.
  - 스크린 파일에서 데이터 포맷 함수를 직접 정의하지 않는다.
  - fixture 파일(`fixtures.ts`)을 화면에서 직접 import하지 않는다.

## 신규 컴포넌트 추가 프로세스
1. 기존 primitive/recipe로 대체 가능한지 먼저 확인한다.
2. 재사용성이 확인되면 `shared/ui/primitives`에 추가한다.
3. 스타일 prop 명명은 `containerStyle`, `textStyle`, `inputStyle` 계열을 따른다.
4. 접근성 속성(`accessibilityRole`, `accessibilityLabel`)을 기본 포함한다.
5. `typecheck`, `export:web`를 통과시킨다.

## 개발 체크리스트
- [ ] 토큰 외 하드코딩 색상 미사용
- [ ] 공통 컴포넌트 재사용 여부 확인
- [ ] a11y label/role 적용
- [ ] route string 대신 `ROUTES` 사용
- [ ] `pnpm run typecheck`
- [ ] `pnpm run export:web`
