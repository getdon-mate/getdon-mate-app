# getdon-mate-app

모임통장 서비스의 React Native 앱 저장소입니다.

## Current Baseline

- Runtime: Expo-based React Native single frontend app
- Package manager: `npm`
- Backend: separate repository
- Future package-manager migration: tracked in Linear `GET-32`

## Commands

```bash
nvm use
npm install
npm run start
npm run ios
npm run android
npm run web
npm run export:web
npm run typecheck
```

## Scope

현재 브랜치의 1차 목표는 AI/Figma 기반으로 유입된 화면 코드를 Expo 앱 구조에 맞게 정리하는 것입니다.

## Preview Web Deploy

백엔드 개발자와 화면 공유가 필요할 때는 Expo web export 결과물을 Vercel에 프리뷰/데모용으로 배포합니다.

```bash
npm run export:web
```

위 명령이 실행되면 `dist/`가 생성됩니다.

Vercel 설정:
- Framework Preset: `Other`
- Build Command: `npm run export:web`
- Output Directory: `dist`

주의:
- 이 경로는 웹 프리뷰 공유용입니다.
- 실제 모바일 앱 배포는 Vercel이 아니라 Expo/EAS 경로로 처리해야 합니다.
- 로컬 실행 전 `.nvmrc` 기준 Node 버전을 맞추는 것을 권장합니다.
