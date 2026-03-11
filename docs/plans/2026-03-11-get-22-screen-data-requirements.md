# GET-22 화면별 데이터 요구사항 정의

## 공통 원칙

- 현재 문서는 mock 데이터 기반 화면을 기준으로 FE 요구 필드를 정리한다.
- API 연동 시에도 화면 계약은 이 문서의 필드/상태/액션을 우선 기준으로 삼는다.
- 로딩/에러/빈 상태는 현재 코드에 일부만 구현되어 있으므로, 필요한 상태를 명시적으로 포함한다.

## 1. 로그인 / 회원가입 화면

### 필요 데이터

- 로그인
  - `email`
  - `password`
- 회원가입
  - `name`
  - `email`
  - `password`

### 화면 상태

- 기본 상태
- 입력 오류 상태
- 인증 실패 상태
- 회원가입 중복 이메일 상태

### 사용자 액션

- 로그인 제출
- 회원가입 제출
- 로그인/회원가입 모드 전환

## 2. 모임통장 목록 화면

### 필요 데이터

- 현재 사용자
  - `id`
  - `name`
  - `email`
- 계좌 목록 각 항목
  - `id`
  - `groupName`
  - `bankName`
  - `balance`
  - `members.length`
  - 현재 월 완납 인원 수
- 계좌 생성 입력
  - `groupName`
  - `bankName`
  - `accountNumber`
  - `monthlyDuesAmount`
  - `dueDay`

### 화면 상태

- 기본 목록 상태
- 계좌 생성 패널 열림/닫힘
- 생성 폼 검증 오류
- 목록 비어 있음 상태

### 사용자 액션

- 계좌 선택
- 계좌 생성
- 로그아웃
- 회원 탈퇴

## 3. 모임통장 상세 공통

### 필요 데이터

- 선택된 계좌
  - `id`
  - `groupName`
  - `bankName`
  - `accountNumber`
  - `balance`
  - `monthlyDuesAmount`
  - `dueDay`
  - `members`
  - `duesRecords`
  - `transactions`
  - `autoTransfer`
  - `oneTimeDues`

### 화면 상태

- 계좌 선택 정상 상태
- 선택된 계좌 없음 상태
- 현재 선택 탭 상태

### 사용자 액션

- 목록으로 돌아가기
- 상세 탭 전환

## 4. 대시보드 탭

### 필요 데이터

- 계좌 기본 정보
  - `bankName`
  - `accountNumber`
  - `balance`
- 현재 월 회비 요약
  - `paid`
  - `payableMembers`
  - `progress`
  - `unpaidMembers[]`
    - `memberId`
    - `amount`
- 최근 거래
  - `transactions[]`
    - `id`
    - `type`
    - `amount`
    - `description`
    - `date`
    - `category`
    - `memberId`

### 화면 상태

- 잔액 표시/숨김 상태
- 미납 멤버 없음 상태
- 최근 거래 없음 상태

### 사용자 액션

- 잔액 숨김 토글
- 회비 탭 이동
- 거래 탭 이동

## 5. 회비 탭

### 필요 데이터

- 조회 월
- 월별 회비 레코드
  - `memberId`
  - `month`
  - `status`
  - `paidDate`
  - `amount`
- 멤버 정보
  - `id`
  - `name`
  - `initials`
  - `color`
- 월별 요약
  - `paid`
  - `unpaid`
  - `exempt`
  - `progress`

### 화면 상태

- 월 이동 가능/불가 상태
- 회비 레코드 없음 상태

### 사용자 액션

- 이전/다음 월 이동
- 멤버 납부 상태 토글

## 6. 거래 탭

### 필요 데이터

- 거래 목록
  - `id`
  - `type`
  - `amount`
  - `description`
  - `date`
  - `category`
  - `memberId`
- 요약 값
  - `income`
  - `expense`
- 날짜 그룹 정보

### 화면 상태

- 전체/입금/출금 필터 상태
- 거래 없음 상태

### 사용자 액션

- 필터 전환

## 7. 멤버 탭

### 필요 데이터

- 멤버 목록
  - `id`
  - `name`
  - `role`
  - `initials`
  - `phone`
  - `joinDate`
  - `color`
- 납부 이력 기반 파생 값
  - `paymentRate`

### 화면 상태

- 멤버 없음 상태

### 사용자 액션

- 현재 구현 기준 읽기 전용

## 8. 설정 탭

### 필요 데이터

- 자동이체 설정
  - `enabled`
  - `dayOfMonth`
  - `amount`
  - `fromAccount`
- 1회성 회비 목록
  - `id`
  - `title`
  - `amount`
  - `dueDate`
  - `records[]`
    - `memberId`
    - `status`
    - `paidDate`
- 멤버 정보
  - `id`
  - `name`

### 화면 상태

- 자동이체 on/off 상태
- 입력 검증 오류
- 1회성 회비 없음 상태
- 삭제 확인 모달 상태

### 사용자 액션

- 자동이체 설정 저장
- 1회성 회비 생성
- 1회성 회비 납부 상태 토글
- 모임통장 삭제

## API 협의 시 필요한 추가 결정

- 계좌 목록 API에서 완납 인원 수를 파생값으로 줄지, 레코드 원본만 줄지
- 대시보드 요약을 단일 summary API로 줄지
- 회비 탭에서 월별 레코드를 페이지 단위로 불러올지
- 1회성 회비와 월 회비를 같은 도메인으로 합칠지 분리할지
