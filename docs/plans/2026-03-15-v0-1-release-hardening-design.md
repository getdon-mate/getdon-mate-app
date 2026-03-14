# Getdon Mate v0.1 Release Hardening Design

## Goal

첫 릴리즈(v0.1) 기준으로 mock/demo 상태에서도 완성도 있게 보이는 프론트 제품 경험을 만든다. 백엔드 계약이 비어 있어도 주요 흐름이 끊기지 않도록 로딩, 빈 상태, 복구, 공유, 인증 진입, 마스킹 UX를 보강하고 설명성 텍스트는 줄인다.

## Scope

- 앱 시작 스플래시와 부트스트랩 대기 화면 추가
- API/mock 전환 및 patch/loading 상황에 대한 skeleton/spinner UX 보강
- 금액 가리기 경험을 눈 아이콘과 스켈레톤 마스킹으로 재설계
- 로그인 화면에 Google/Kakao OAuth CTA 추가
- 모임통장 초대하기 흐름에 링크 복사와 네이티브 공유 추가
- 설정/마이페이지/빈 상태 카피와 정보 구조 정리
- AI 티가 나는 장황한 텍스트 정리
- 릴리즈 회귀를 막기 위한 테스트 추가

## Product Direction

시각 방향은 과장된 브랜딩보다 금융 도구에 가까운 차분함을 유지한다. 배경과 카드 대비, 타이포 계층, 간격 체계를 정교하게 조정해 더 세련되게 보이게 하고, 그라데이션이나 과한 장식은 피한다. 중요한 상태 변화는 색보다 구조와 모션 없는 시각 단서로 전달한다.

## UX Decisions

### 1. Startup and Loading

- 부트스트랩 중 전체 화면 스플래시를 노출한다.
- 로고 자산 대신 `getdon mate` 워드마크를 타이포그래피 중심으로 표시한다.
- 데이터 로딩, 새로고침, 패치 중 상태는 가능한 한 스피너보다 스켈레톤 우선으로 보여준다.
- 화면 전체 blocking이 필요한 경우에만 대기 오버레이를 사용한다.

### 2. Copy and Tone

- 설명은 기능 안내보다 행동 유도 중심으로 짧게 쓴다.
- 내부 구현을 드러내는 문장, 데모 전제 장황한 문장, AI 생성 문체를 제거한다.
- 데모 모드 여부는 디버그용으로만 최소 표시하고, 사용자 카피는 제품 문장으로 유지한다.

### 3. Account Privacy

- 금액 노출 토글은 eye / eye-off 아이콘으로 통일한다.
- 숨김 상태는 `***` 텍스트 대신 숫자 폭을 흉내낸 스켈레톤 바로 대체한다.
- 목록, 상세 hero, 요약 지표에서 일관되게 동작하도록 전역 preference로 관리한다.

### 4. Invite Flow

- 초대하기는 계좌 단위 share link를 생성해 복사/공유 모두 지원한다.
- 웹은 clipboard 기반 복사 우선, 앱은 OS 공유 시트를 우선 사용한다.
- 실제 서버 링크가 없으므로 demo 초대 URL 규칙을 명시적으로 만든다.

### 5. Auth Entry

- 로그인 기본 폼은 유지한다.
- 상단에 Google/Kakao OAuth CTA를 추가한다.
- 실제 인증 연결 대신 v0.1에서는 demo login bridge로 처리하되, 버튼 경험은 production-ready 구조로 만든다.

## Architecture

- 전역 런타임 상태에 `startup`, `busy`, `privacy`, `share` 관련 보조 상태를 추가한다.
- 공통 UI primitive에 skeleton row, spinner overlay, splash screen, amount masking 표시 컴포넌트를 도입한다.
- 계좌 화면의 초대/프라이버시 액션은 detail header/hero와 list summary에서 공통 helper를 사용한다.
- OAuth CTA는 auth feature 내부에서 provider metadata 기반으로 렌더링한다.

## Error Handling

- Error boundary는 `retry`와 `reload` 의미를 플랫폼별로 분리한다.
- clipboard/share 미지원 환경은 조용히 실패시키지 않고 명확한 toast/alert를 띄운다.
- mock API 지연은 lazy delay를 넣되, 개발 확인을 위해 환경 변수로 조절 가능하게 둔다.

## Testing

- startup/loading/privacy/invite/auth CTA 중심의 단위 테스트를 추가한다.
- 기존 AppSettings/MyPage/Notification 테스트 공백을 메운다.
- 최종 검증은 `pnpm run test`, `pnpm run ci:web`, 필요 시 e2e smoke 순으로 돌린다.

## Release Constraints

- 백엔드 미연동 상태를 전제로 mock fallback을 유지한다.
- `main` 최신 기준에서 충돌 가능성이 큰 구조 개편은 피하고, UI/UX와 공통 상태 중심으로 정리한다.
- 디자인은 bold하되 과장되지 않게 유지한다.
