# 앱 컬러 팔레트 리디자인

**목표:** AI 기본 테마처럼 보이는 기존 파란색/회색 조합을 더 절제된 코발트 블루, 오프화이트, 라일락 포인트 기반의 palette로 재정의한다.

## 기준
- 참고 이미지처럼 차가운 화이트가 아니라 약간 따뜻한 오프화이트 배경
- 카드는 거의 흰색이지만 회색 대신 베이지가 섞인 얇은 보더
- 포인트는 채도 높은 기본 블루 대신 깊은 코발트 블루
- 보조 톤은 라일락/퍼플 tint
- success/warning/danger도 형광색이 아니라 부드러운 pastel 계열

## 설계
- `shared/ui/palette.ts`에 raw palette를 정의한다.
- `shared/ui/tokens.ts`는 semantic token만 노출한다.
- 화면/컴포넌트에서 하드코딩 hex 사용을 줄이고 token 참조로 치환한다.
- 멤버 배지/도메인 색상도 palette 기반 상수로 통일한다.

## 완료 기준
- `uiColors`만 봐도 앱 전역 색상 체계가 이해된다.
- 주요 공용 컴포넌트와 첫 화면들에서 hardcoded color가 크게 줄어든다.
- AppSettings / MyPage polish 전에 전역 톤이 먼저 정리된다.
