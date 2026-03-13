# iOS Development Build Runtime Notes

## Goal

Expo Go 대신 iOS development build 기준으로 앱을 테스트한다.

## Why

- 현재 앱은 React Navigation native stack + react-native-screens 조합을 사용한다.
- Expo Go(iOS)는 New Architecture(Fabric)만 지원하므로, 런타임 host prop 타입 오류가 나면 앱 코드가 맞아도 Expo Go에서 계속 막힐 수 있다.
- development build는 `app.json`의 `newArchEnabled` 설정을 반영할 수 있다.

## Project Decision

- iOS 테스트 기본 경로는 Expo Go가 아니라 development build로 전환한다.
- `app.json`에서 `expo.newArchEnabled = false`로 유지한다.
- 웹 프리뷰는 기존 Vercel 경로를 유지한다.

## Local Commands

```bash
nvm use
corepack enable
pnpm install

# iOS native project 생성/실행
pnpm run ios:dev

# JS bundler 캐시 초기화가 필요할 때
pnpm run start -- --clear
```

## First Run Notes

- Xcode, CocoaPods, iOS Simulator가 설치되어 있어야 한다.
- physical iPhone에서 보려면 Apple signing 설정이 필요하다.
- 최초 `expo run:ios`는 native 폴더 생성/동기화로 시간이 걸릴 수 있다.

## Ongoing Rule

- 모바일 상호작용 검증(long press, pull-to-refresh, native gesture)은 iOS development build에서 확인한다.
- Expo Go는 빠른 확인용으로만 보고, iOS 기준 최종 동작 검증 수단으로 사용하지 않는다.
