# API Runtime Policy (mock | real | auto)

## 목적
- 백엔드 가용성에 따라 앱 동작이 예측 가능하도록 모드별 정책을 고정한다.
- 사용자에게는 현재 모드와 fallback 여부를 명확히 노출한다.

## 모드 정의
- `mock`
  - 네트워크 호출 없이 로컬 데모 데이터만 사용한다.
- `real`
  - 실 API 호출을 우선 시도한다.
  - 호출 실패 시 로그를 남기고 데모 흐름으로 fallback 가능(현재 정책).
- `auto`
  - `EXPO_PUBLIC_API_BASE_URL` 존재 시 `real`처럼 동작하고, 없으면 `mock`으로 동작한다.

## 실패 정책
- 공통
  - API 실패는 `logger`를 통해 기록한다.
  - 민감정보(password/token/secret/authorization/email/phone)는 마스킹한다.
- 인증(login/signup)
  - `real/auto`에서 실패하면 데모 인증으로 fallback한다.
  - UI 상단 배너로 fallback 상태를 알린다.
- 데이터 조회/변경
  - 어댑터에서 실패 시 `null` 반환 후 앱은 로컬 상태를 유지한다.

## DTO/도메인 경계
- API 응답 타입은 `features/accounts/api/dto.ts`에서 정의한다.
- 화면에서 사용하는 도메인 타입은 `features/accounts/model/types.ts`를 사용한다.
- 변환은 `features/accounts/api/mappers.ts`에서 수행한다.
- 어댑터는 transport + mapper 역할에 집중한다.

## 운영 점검 체크리스트
- [ ] `EXPO_PUBLIC_API_MODE` 값 확인
- [ ] `EXPO_PUBLIC_API_BASE_URL` 설정 확인
- [ ] fallback 시 배너 문구 확인
- [ ] console 로그에 민감정보가 없는지 확인
