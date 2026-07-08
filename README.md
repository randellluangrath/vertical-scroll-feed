# GoodWatch TV

A React Native **tvOS** app for previewing streaming content — a vertical,
remote-driven "Discover" feed plus a 10-foot landing page — backed by
**AWS Amplify (Gen 2)**.

```
apps/tv/          Apple TV app (Expo SDK 57 + react-native-tvos 0.86 + React 19)
amplify/          Amplify Gen 2 backend (AppSync + DynamoDB + Cognito)
packages/shared/  Domain types + mock catalog data
```

## Prerequisites

- Node `^20.19.4 || ^22.13 || ^24.3+` (react-native 0.86 engines — Node 22.12 is NOT enough), a Mac with Xcode + the tvOS simulator runtime
- AWS credentials configured (`aws configure` or SSO) for the backend

## Run it

```bash
# 1. Install (repo root + app)
npm install
cd apps/tv && npm ci && cd ..

# 2. Stand up the cloud backend (provisions AppSync + DynamoDB + Cognito,
#    generates amplify_outputs.json). Leave running in its own terminal.
npm run sandbox

# 3. Seed the catalog — the tables start empty!
npm run seed

# 4. Point the app at the generated config and launch on Apple TV
#    (ampx writes amplify_outputs.json; place/symlink it at apps/tv/)
cd apps/tv
npm run prebuild      # generates the tvOS Xcode project (first run / after native dep changes)
npm run ios
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md). In short: the Amplify Data client is
the only backend; a mapping layer (`apps/tv/src/api/amplify.ts`) converts
Amplify's generated shape into clean domain types from `packages/shared`, so the
UI never sees a nullable/lazy Amplify model.
