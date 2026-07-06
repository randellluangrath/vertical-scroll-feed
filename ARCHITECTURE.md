# Architecture

GoodWatch is structured as a multi-app platform: one backend contract, one
design language, N device targets.

```
├── app/, components/, ...   # Web app (Next.js) — the original vertical feed
├── apps/
│   └── tv/                  # Apple TV app (Expo + react-native-tvos)
│       └── src/
│           ├── api/         # Backend adapter (Express today, Amplify in prod)
│           ├── components/  # TV-idiom UI (focus-driven, 10-foot sizing)
│           ├── hooks/       # Data-fetching hooks
│           ├── navigation/  # React Navigation stack
│           ├── screens/     # Home (landing) / Discover (feed) / Player
│           └── theme/       # Design tokens — single source of visual truth
├── backend/                 # Node.js/Express API — the platform contract
├── packages/
│   └── shared/              # Shared types, content data, formatting utils
└── amplify/                 # Amplify Gen 2 schema (AppSync + DynamoDB)
```

## Principles

**1. The API contract is the platform boundary.**
Every app consumes the same endpoints (`/api/content`, `/api/content/:id`,
`/api/content/:id/reviews`). Apps never own content logic — they render it.
A new device target starts by pointing at the same API.

**2. Backend implementations are swappable behind an adapter.**
`apps/tv/src/api/client.ts` is the only file that knows how data arrives.
Local dev uses the Express server; production swaps in the Amplify Data
client (the swap-in is stubbed in the same file). Screens and hooks are
backend-agnostic.

**3. Design tokens over hardcoded styles.**
`apps/tv/src/theme/tokens.ts` holds colors, spacing, radii, and the type
scale. Screens reference tokens, never raw hex values. Re-skinning the app —
or aligning it to a Figma export — is a one-file change. A future
`packages/design-tokens` can serve web and TV from one definition.

**4. UI is per-device, logic is shared.**
Interaction models genuinely differ (touch swipe vs D-pad focus vs pointer),
so screens/components are written per app. Types, data shapes, formatting,
and (eventually) hooks live in `packages/shared`.

## Adding a new device target

1. `apps/<target>/` — new Expo app (mobile: plain `react-native`; another TV
   platform: `react-native-tvos` also builds Android TV).
2. Copy the `api/` adapter — it's transport code, identical across targets.
3. Reuse types from `packages/shared`.
4. Write screens in that device's interaction idiom, styled from tokens.

The TV app is the template: `api/` + `hooks/` port unchanged; `screens/` and
`components/` are the per-device work.

## Known tradeoffs and the path forward

- **No workspace manager yet.** Each package installs independently
  (`npm install` per directory, lockfiles committed). This is deliberate:
  npm workspaces change hoisting behavior, and Metro + react-native-tvos are
  sensitive to it (see the `overrides` in `apps/tv/package.json`). Adopt
  Turborepo + pnpm when a second RN app makes the duplication painful, and
  budget time for Metro `watchFolders` config.
- **`packages/shared` is consumed by copy, not import.** Metro doesn't follow
  tsconfig path aliases at runtime; wiring true cross-package imports needs
  `metro.config.js` watchFolders + nodeModulesPaths. Until then, the backend
  and TV app carry small copies of the shared types — acceptable duplication
  at this scale, first thing to fix under a workspace manager.
- **The web app predates `apps/`.** It lives at the repo root because moving
  a deployed Next.js app is churn without immediate payoff. When workspaces
  land, it becomes `apps/web/` in the same change.
- **Mock data lives in the backend.** Prod replaces it with DynamoDB via the
  Amplify schema (`amplify/amplify/data/resource.ts`) — Content, Review, and
  WatchlistItem models with guest-read auth already defined.

## Reliability practices

- Lockfiles are committed everywhere, including `apps/tv` (react-native-tvos
  resolution is fragile across npm versions — install with `npm ci`).
- `npm run typecheck` in `apps/tv`; `next build` type-checks the web app.
- Root `tsconfig.json` excludes `apps/`, `backend/`, `packages/`, `amplify/`
  so each project type-checks against its own dependencies.
- `turbopack.root` is pinned in `next.config.ts` — Next.js 16 misdetects the
  workspace root once sibling app directories exist.
