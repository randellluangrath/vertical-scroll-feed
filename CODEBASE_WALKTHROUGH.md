# GoodWatch — Codebase Walkthrough

A top-to-bottom tour of how the app is built: how it boots, how data flows from
DynamoDB to the screen, how the screens and components fit together, and the
cross-cutting concerns (focus, errors, video). Written to be presented section
by section.

---

## 1. What it is, in one breath

GoodWatch is an **Apple TV app** for previewing streaming titles: a 10-foot
**Home** landing page (hero + horizontal rails), a full-screen vertical
**Discover** feed of muted auto-playing previews (TikTok-style, remote-driven),
and a **Player**. It's backed by an **AWS Amplify (Gen 2)** GraphQL API over
DynamoDB. The guiding principle: *the backend owns content; the app just renders
it,* and everything the UI touches is a clean domain type, never a raw backend
shape.

## 2. Tech stack

- **React Native (tvOS)** via `react-native-tvos` + **Expo SDK 57**, React 19.
- **React Navigation** (native stack) for screens.
- **TanStack Query** for all server data (fetching, caching, dedup).
- **expo-video** for playback.
- **AWS Amplify Gen 2** backend: AppSync (GraphQL) + DynamoDB, public API-key auth.
- **TypeScript** throughout; a shared domain package consumed type-only.

## 3. Repository layout

```
apps/tv/               The Apple TV app (the product)
  index.js             Entry point — polyfills, then registers <App/>
  src/
    App.tsx            Provider tree (Query, ErrorBoundary, Navigation)
    navigation/        RootNavigator — the 3-screen stack
    screens/           Home, Discover, Player
    components/        All UI (rails, cards, nav bar, sheets, primitives)
    hooks/             useContent (the data hook)
    api/               Backend layer: config, client, mappers, Query setup, prewarm
    theme/             tokens.ts — colors/spacing/type scale (design system)
amplify/               Amplify Gen 2 backend
  data/resource.ts     GraphQL schema: Content, Review
  seed/seed.ts         Loads mock catalog into DynamoDB
packages/shared/       Canonical domain types + mock data + format utils
```

## 4. The layered architecture (the mental model)

Read this bottom-to-top; it's the spine of the whole app.

```
 ┌────────────────────────────────────────────────────────────┐
 │  SCREENS / COMPONENTS   Home · Discover · Player · rails…    │  React/tvOS UI
 ├────────────────────────────────────────────────────────────┤
 │  useContent (hook)      wraps TanStack Query                 │  data hook
 ├────────────────────────────────────────────────────────────┤
 │  TanStack Query         cache, dedup, staleness             │  client cache
 ├────────────────────────────────────────────────────────────┤
 │  api: ContentApi        getContent() / getReviews()         │  interface (contract)
 ├────────────────────────────────────────────────────────────┤
 │  createAmplifyApi +     toContent()/toReview() mappers      │  anti-corruption layer
 │  CONTENT_SELECTION      (raw Amplify → domain types)        │
 ├────────────────────────────────────────────────────────────┤
 │  aws-amplify Data client   generateClient()                │  transport
 ├────────────────────────────────────────────────────────────┤
 │  AppSync (GraphQL)  →  DynamoDB                             │  backend
 └────────────────────────────────────────────────────────────┘
```

The key idea: **each layer only knows about the one directly below it, through
an interface.** Screens depend on `useContent`, not on Amplify. `useContent`
depends on `ContentApi`, not on the Amplify client. Only one file
(`api/client.ts`) knows a real Amplify client exists. So swapping Amplify for a
REST gateway later is a one-layer change.

## 5. How it boots

**`index.js`** runs first. It loads two polyfills *before* anything imports
Amplify — `react-native-get-random-values` (crypto for UUIDs/signing) and an
async-iterator polyfill (Hermes lacks `Symbol.asyncIterator`, which Amplify
uses) — then `registerRootComponent(App)`.

**`App.tsx`** builds the provider tree, outermost to innermost:

```
QueryClientProvider          ← makes the Query cache available app-wide
  QueryErrorResetBoundary     ← lets "Try again" reset failed queries
    ErrorBoundary             ← catches render errors, shows branded fallback
      SafeAreaProvider
        NavigationContainer
          RootNavigator       ← the actual screens
```

It also calls `setupAppStateFocus()` once, wiring RN's AppState into Query's
`focusManager` (refetch on foreground).

## 6. Navigation

`RootNavigator` is a **native stack** with three screens (`headerShown: false`,
fade transitions): **Home**, **Discover**, **Player**. Route params are typed in
`RootStackParamList`. The important one:

```ts
Player: { content: Content }
```

The whole `Content` object is passed as a nav param. Because the calling screen
already has it (from its own list), the Player starts **without any refetch** —
and it's why the API layer doesn't need a `getContentById`.

## 7. The data layer, end to end

This is the part to slow down on when presenting.

**Backend schema** (`amplify/data/resource.ts`). Two models — `Content` (title,
genres/cast/rails as string arrays, `gradientFrom`/`gradientTo`, `streamUrl`,
etc.) and `Review` (`belongsTo` Content). Auth is `publicApiKey` with
`read` + `create` (the `create` is a temporary seeding grant — the
`// remove create after seed` comment flags it). Auth mode is `apiKey`.

**Config + client** (`api/amplifyConfig.ts`, `api/client.ts`). `amplifyConfig`
calls `Amplify.configure(outputs)` using the generated `amplify_outputs.json`.
`client.ts` creates the Amplify data client and — crucially — casts it to a
tiny hand-written `AmplifyDataClient` interface, then exposes a single
`api: ContentApi` with just `getContent()` and `getReviews()`. That `ContentApi`
interface is the contract the rest of the app depends on.

**Anti-corruption layer** (`api/amplify.ts`). This is the most important file.
Amplify's generated types are nullable-everywhere, split `gradient` into two
columns, and expose `reviews` lazily. `toContent`/`toReview` map that mess into
the clean `@goodwatch/shared` domain types the UI speaks — coalescing nulls,
validating the `sentiment` enum, filtering junk out of arrays, rebuilding the
`gradient` tuple. `CONTENT_SELECTION` explicitly lists the fields to fetch
(plus `reviews.*` for the nested relation). `getContent` also translates a
`{ rail, genre }` filter into a DynamoDB `contains` filter and sorts the
trending rail by `trendingRank`.

**The hook** (`hooks/useContent.ts`). `contentQueryOptions({ rail, genre })` is
the single source of truth for a list's **query key** and **fetcher**, shared by
both `useContent` (via `useQuery`) and the genre-chip prefetch. `useContent`
returns a stable shape — `{ content, loading, error }` — so screens don't know
Query is underneath. `loading` maps to `isPending`, which is only true on the
first uncached load, so background refetches don't flash the splash.

**Query client** (`api/queryClient.ts`). One `QueryClient` (5-min `staleTime`,
30-min `gcTime`, 2 retries). RN adapters: `onlineManager` ← NetInfo,
`focusManager` ← AppState.

### The request path (say this out loud)

```
Screen → useContent → useQuery(contentQueryOptions)
       → api.getContent(filter) → createAmplifyApi
       → client.models.Content.list({ selectionSet, filter })
       → AppSync → DynamoDB
       → raw rows → toContent()/toReview() → domain Content[]
       → cached under ["content", rail, genre] → back to the Screen
```

## 8. The three screens

**Home** (`screens/HomeScreen.tsx`). Fires **two** `useContent` calls
(`trending` and `for-you`). While either is loading → `SplashInterstitial`. On
error → it `throw`s, which the app-level `ErrorBoundary` catches. Otherwise it
renders a pinned **`BrandBar`** (outside the ScrollView so focus can always
reach it), a **hero** (the first trending title), a **Trending** rail, a
**DiscoverBanner**, and a **For You** rail. Selecting anything calls
`openPlayer(content)` → navigates to Player with the full object.

**Discover** (`screens/DiscoverScreen.tsx`). The vertical feed. Local state:
`rail`, `genre`, `activeIndex`, and a measured `viewportHeight`. It fetches with
the same `useContent({ rail, genre })` — and because the default `for-you`
key matches Home's For You rail, **entering Discover is served from cache**. A
vertical `FlatList` renders one full-viewport `VideoCard` per title;
`onViewableItemsChanged` sets `activeIndex`, which tells exactly one card to
play. A `DiscoveryBar` overlays rail tabs + genre chips. Careful tvOS details:
cards are sized to the *measured* container height (not `Dimensions`), there's
no `snapToInterval` (it fights the focus engine), and the list only remounts on
rail/genre change (height changes flow through `extraData` to avoid tearing down
players mid-play).

**Player** (`screens/PlayerScreen.tsx`). Reads `content` from the nav param, so
no fetch. Creates an **expo-video** player with `useVideoPlayer(content.streamUrl)`
(loop, autoplay). Playback state is *read from the player* via
`useEvent(player, "playingChange")` and `"timeUpdate"` — not mirrored into React.
Local state is only UI chrome: a 4-second auto-hiding controls overlay and an
`Animated` progress bar. `useTVEventHandler` maps the remote: select/play-pause
toggles, left/right `seekBy(±10s)`.

## 9. Component catalog & how they interact

```
HomeScreen
├─ BrandBar          pinned top nav: wordmark + Discover | Search + avatar
├─ (hero)            featured title with Watch Now (FocusableButton)
├─ ContentRail ×2    horizontal poster rows → onSelect(content) → Player
│   └─ PosterCard    focus-scales; prewarmStream(streamUrl) on focus
└─ DiscoverBanner    CTA → Discover

DiscoverScreen
├─ FlatList
│   └─ VideoCard     per-card expo-video (muted loop); plays when isActive
│       ├─ SideActionsPanel   like / reviews / rating / save / share
│       └─ ReviewsSheet       overlay list of content.reviews
└─ DiscoveryBar      rail tabs + genre chips; prefetch genre on chip focus

PlayerScreen
└─ VideoView         full-screen player + controls overlay

Shared primitives
├─ FocusableButton   TouchableHighlight + focus ring; forwards onFocus/onBlur
├─ SplashInterstitial branded loading screen + animated spinner
└─ ErrorBoundary     class boundary + branded fallback with "Try again"
```

Interaction highlights:

- **`FocusableButton`** is the focus primitive nearly everything builds on — it
  draws the focus ring and forwards focus events (that's how rail cards trigger
  `prewarm`, and how genre chips trigger prefetch).
- **`VideoCard`** owns its own player and its own `liked`/`saved`/`reviewsOpen`
  state; the parent only tells it whether it's the active (visible) card.
- **`SideActionsPanel`** actions are local component state today (likes/saves
  aren't persisted yet); Share is a no-op placeholder.
- **`prewarm.ts`** is a tiny, deduped `fetch()` of the HLS manifest to warm
  DNS/TLS/CDN when a card is focused — it warms the *network*, not decode.

## 10. Shared package & design system

`packages/shared` holds the canonical `Content`/`Review`/`Rail`/`Sentiment`
types, `ALL_GENRES`, the mock `CONTENT` catalog, and format helpers
(`compactNumber`, `runtimeLabel`). The app imports these **type-only**, so Babel
erases them and Metro never has to resolve the cross-package path (no workspace
config needed). The seed script, running under Node, imports the runtime data
directly.

`theme/tokens.ts` is the single source of visual truth — colors, spacing, radii,
and a type scale sized for 10-foot viewing. Re-skinning is a one-file change.

## 11. Cross-cutting concerns

- **Focus (tvOS).** No mouse/touch — the OS moves focus geometrically between
  focusable views. Everything interactive is a `FocusableButton`; the BrandBar
  is pinned so "up" always has somewhere to land.
- **Errors.** Query failures surface as `error`; Home throws on error and the
  app-level `ErrorBoundary` renders the branded fallback. `QueryErrorResetBoundary`
  is wired so a future "Try again" can reset failed queries.
- **Video/player state.** Owned by the expo-video `player` object; React
  subscribes via `useEvent` and issues imperative commands. Players are per
  component (per card / per Player screen) and released on unmount.
- **Backend seeding.** `amplify/seed/seed.ts` walks the shared `CONTENT` array
  and creates `Content` + nested `Review` rows via the Amplify client (uses the
  temporary public `create` grant).

## 12. Two traces to narrate when presenting

**A. App open → Home renders.**
`index.js` polyfills → `App` providers mount → `RootNavigator` shows `Home` →
Home fires two `useContent` hooks → `useQuery` runs `contentQueryOptions` →
`api.getContent` → Amplify `list` → AppSync → DynamoDB → raw rows → `toContent`
mappers → domain `Content[]` cached under `["content", rail, genre]` → hook
returns `loading:false` → Home renders hero + rails. (While pending, the
`SplashInterstitial` shows.)

**B. Focus a title → play it.**
User focuses a rail card → `PosterCard.onFocus` → `prewarmStream(streamUrl)`
warms the CDN → user presses SELECT → `onSelect(content)` → `openPlayer` →
`navigate("Player", { content })` → `PlayerScreen` reads the param (no fetch) →
`useVideoPlayer(content.streamUrl)` starts playback, warm from the prewarm.

**C. Home → Discover (cache win).**
Discover's default query is `useContent({ rail: "for-you", genre: null })` —
the *same key* Home already populated — so the feed renders instantly from
cache instead of refetching.

## 13. Quick FAQ (anticipate these)

- **"Where's global state / Redux?"** There isn't any, by design. Server state
  lives in TanStack Query; player state lives in the expo-video player; the rest
  is local component state. No global store is needed yet.
- **"How does the Player avoid a loading spinner?"** The full `Content` is
  passed as a nav param, so it has the stream URL and metadata immediately.
- **"Why the mapper layer?"** To keep Amplify's nullable/lazy generated types
  out of the UI and make the backend swappable. It's also the highest-value unit
  to test.
- **"Biggest scaling risks?"** `contains` filters on `genres`/`rails` are
  DynamoDB scans; public-API-key auth won't cover per-user features; eager
  `reviews.*` loads every review. All fixable (GSIs, Cognito, pagination).
