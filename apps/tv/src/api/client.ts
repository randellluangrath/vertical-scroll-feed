// API entry point — the Amplify Data client, mapped to domain types.
//
// This app is Amplify-only. `./amplifyConfig` runs Amplify.configure(outputs)
// at import time, so it must be imported before generateClient(). The bundle
// therefore requires amplify_outputs.json to exist — generate it by deploying:
//   npm run sandbox        (repo root; provisions AppSync + DynamoDB + Cognito)
//   npm run seed           (populates the tables — tables start empty!)
//
// Domain types are re-exported so callers keep importing from "../api/client".
import "./amplifyConfig";
import { generateClient } from "aws-amplify/data";
import { createAmplifyApi, type AmplifyDataClient } from "./amplify";
import type { ContentApi } from "./types";

export type { Content, Review, Rail, Sentiment, ContentFilter } from "./types";
export type { ContentApi } from "./types";

// generateClient() is intentionally left untyped here: passing <Schema> would
// pull @aws-amplify/backend types into the RN app's typecheck, where they don't
// belong. The structural AmplifyDataClient interface (amplify.ts) documents the
// exact query surface we use, and the mappers convert results to domain types.
const client = generateClient() as unknown as AmplifyDataClient;

export const api: ContentApi = createAmplifyApi(client);
