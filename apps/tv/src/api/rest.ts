// REST backend — talks to the local Express server (backend/).
//
// The Express server already returns domain-shaped JSON, so this is a
// passthrough: no mapping needed. It's the anti-corruption layer's trivial
// case. The Amplify backend (amplify.ts) is where real mapping happens.
import Constants from "expo-constants";
import type { Content, Review, ContentApi, ContentFilter } from "./types";

const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "http://localhost:3001";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export const restApi: ContentApi = {
  getContent(filter?: ContentFilter): Promise<Content[]> {
    const params = new URLSearchParams();
    if (filter?.rail) params.set("rail", filter.rail);
    if (filter?.genre) params.set("genre", filter.genre);
    const qs = params.toString();
    return get<Content[]>(`/api/content${qs ? `?${qs}` : ""}`);
  },

  getContentById(id: string): Promise<Content> {
    return get<Content>(`/api/content/${id}`);
  },

  getReviews(contentId: string): Promise<Review[]> {
    return get<Review[]>(`/api/content/${contentId}/reviews`);
  },
};
