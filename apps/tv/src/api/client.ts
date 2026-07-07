// API entry point — selects a backend and exposes it as `api`.
//
// Every screen/hook imports `{ api }` (and domain types) from here and never
// knows which backend is live. Swapping REST ↔ Amplify is a config change,
// not a code change in the UI.
//
//   REST (default):  talks to the local Express server (backend/).
//   Amplify (prod):  talks to AppSync/DynamoDB via the generated Data client.
//
// Domain types are re-exported so callers keep importing from "../api/client".
import type { ContentApi } from "./types";
import { restApi } from "./rest";

export type { Content, Review, Rail, Sentiment, ContentFilter } from "./types";
export type { ContentApi } from "./types";

export const api: ContentApi = restApi;

// ---------------------------------------------------------------------------
// Enabling the Amplify backend (production)
// ---------------------------------------------------------------------------
// 1. Install the runtime deps in apps/tv:
//      npm install aws-amplify
//      npm install react-native-get-random-values @azure/core-asynciterator-polyfill
//    (the two polyfills are required for the Amplify Data client under Hermes).
//
// 2. Import the polyfills once at the very top of index.js:
//      import "react-native-get-random-values";
//      import "@azure/core-asynciterator-polyfill";
//
// 3. After `npx ampx sandbox` (or a pipeline deploy) generates
//    apps/tv/amplify_outputs.json, replace the export above with:
//
//      import { Amplify } from "aws-amplify";
//      import { generateClient } from "aws-amplify/data";
//      import type { Schema } from "../../../../amplify/amplify/data/resource";
//      import { createAmplifyApi } from "./amplify";
//      import outputs from "../../amplify_outputs.json";
//
//      Amplify.configure(outputs);
//      // generateClient<Schema>() is structurally assignable to AmplifyDataClient
//      const client = generateClient<Schema>();
//      export const api: ContentApi = createAmplifyApi(client);
//
// The UI needs no changes: createAmplifyApi returns the same ContentApi that
// restApi implements, mapping Amplify's shape to domain types (see amplify.ts).
