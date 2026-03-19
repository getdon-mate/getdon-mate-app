# API 배포 및 환경 설정 가이드 (Deployment Guide)

이 문서는 Vercel 배포 환경에서 API 연동을 위해 적용된 임시 조치(Failsafe)와 향후 개선 방향을 기록합니다.

## ⚠️ 현재 적용된 임시 조치 (Workarounds)

Vercel 빌드 시점의 환경 변수(`EXPO_PUBLIC_API_MODE`) 주입 문제로 인해 아래와 같은 우회 로직이 적용되어 있습니다.

### 1. API 모드 자동 감지 (Failsafe)
- **위치**: `src/core/api/config.ts`
- **내용**: 브라우저의 `hostname`이 `localhost`가 아닌 경우, `EXPO_PUBLIC_API_MODE` 변수가 없더라도 자동으로 `real` 모드로 동작하게 설정했습니다.
- **이유**: Vercel 빌드 서버에서 환경 변수가 클라이언트 번들에 제대로 포함되지 않아 앱이 Mock(Demo) 모드로 실행되는 문제를 방지하기 위함입니다.

### 2. 빌드 스크립트 강제 지정
- **위치**: `package.json`
- **내용**: `"build": "pnpm run export:web"` 추가.
- **이유**: Vercel이 기본 빌드 명령어를 사용할 경우 환경 변수 주입이 누락될 수 있어, 명시적으로 `expo export`를 호출하는 스크립트를 빌드 명령어로 지정했습니다.

## 🛠 향후 개선 과제 (TODO)

배포 환경이 안정화되면 아래 작업을 통해 코드를 더 깔끔하게 정리해야 합니다.

- [ ] **환경 변수 주입 확인**: Vercel의 `Environment Variables` 설정만으로 클라이언트 번들에 값이 완벽하게 주입되는지 확인 후 `config.ts`의 Failsafe 로직 제거.
- [ ] **빌드 파이프라인 정립**: `ci:web` 스크립트를 Vercel Build Command로 설정하고, `package.json`의 `"build"` 스크립트 의존성 제거 검토.
- [ ] **프록시 설정 검증**: `vercel.json`의 rewrites가 모든 API 엔드포인트(v1, v2 등)를 포괄하는지 확인하고 정규표현식 최적화.

## 📝 관련 파일
- `src/core/api/config.ts`
- `package.json`
- `vercel.json`
