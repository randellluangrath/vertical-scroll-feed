// API adapter: switch API_MODE env var (or build config) to "amplify" in prod.
// For local dev it talks to the Express backend at localhost:3001.
// The shape of every response is identical regardless of backend.
import Constants from "expo-constants";

type Rail = "for-you" | "trending";

const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "http://localhost:3001";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export type ContentSummary = {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  genres: string[];
  year: number;
  maturity: string;
  runtimeMinutes: number;
  matchPercent: number;
  cast: string[];
  streamUrl: string;
  thumbnailUrl?: string;
  gradient: [string, string];
  rails: Rail[];
  trendingRank?: number;
  likes: number;
  views: string;
  rating: number;
  reviews: Review[];
};

export type Review = {
  id: string;
  author: string;
  avatarColor: string;
  rating: number;
  sentiment: "loved" | "liked" | "mixed";
  body: string;
  likes: number;
  timeAgo: string;
};

export const api = {
  getContent(opts?: { rail?: Rail; genre?: string }): Promise<ContentSummary[]> {
    const params = new URLSearchParams();
    if (opts?.rail) params.set("rail", opts.rail);
    if (opts?.genre) params.set("genre", opts.genre);
    const qs = params.toString();
    return get<ContentSummary[]>(`/api/content${qs ? `?${qs}` : ""}`);
  },

  getContentById(id: string): Promise<ContentSummary> {
    return get<ContentSummary>(`/api/content/${id}`);
  },

  getReviews(id: string): Promise<Review[]> {
    return get<Review[]>(`/api/content/${id}/reviews`);
  },
};

// --- Amplify swap-in (uncomment in production) ---
//
// import { generateClient } from "aws-amplify/data";
// import type { Schema } from "../../amplify/data/resource";
//
// const amplifyClient = generateClient<Schema>();
//
// export const api = {
//   async getContent(opts?: { rail?: Rail; genre?: string }) {
//     const { data } = await amplifyClient.models.Content.list({
//       filter: opts?.rail ? { rails: { contains: opts.rail } } : undefined,
//     });
//     return data;
//   },
//   async getContentById(id: string) {
//     const { data } = await amplifyClient.models.Content.get({ id });
//     return data;
//   },
//   async getReviews(contentId: string) {
//     const { data } = await amplifyClient.models.Review.list({
//       filter: { contentId: { eq: contentId } },
//     });
//     return data;
//   },
// };
