// Amplify backend — the anti-corruption layer.
//
// Amplify Gen 2's generated `Schema["Content"]["type"]` is NOT usable directly
// by the UI: nearly every field is nullable, `gradient` is split into two
// columns, arrays are `(T | null)[] | null`, and `reviews` is a lazy
// relationship. This module is the ONE place that knows about that shape and
// maps it to the clean domain types the rest of the app consumes.
//
// Nothing here imports `aws-amplify` — the generated client is passed into
// `createAmplifyApi` (dependency injection). That keeps this file typecheckable
// with no extra deps and makes the mapping logic unit-testable in isolation.
// The single spot that imports aws-amplify is client.ts (a commented block you
// enable once the package is installed).
import type {
  Content,
  Review,
  Rail,
  Sentiment,
  ContentApi,
  ContentFilter,
} from "./types";

// --- Wire types: a hand-written mirror of what ClientSchema generates. ---
// Kept explicit (rather than importing `Schema`) so the mapper documents the
// exact nullability contract it defends against. The real generated type is
// structurally assignable to these, so `createAmplifyApi` accepts it as-is.
type Nullable<T> = T | null | undefined;

export type AmplifyReview = {
  id: string;
  contentId: string;
  author: string;
  avatarColor?: Nullable<string>;
  rating: number;
  sentiment?: Nullable<string>;
  body?: Nullable<string>;
  likes?: Nullable<number>;
  timeAgo?: Nullable<string>;
};

export type AmplifyContent = {
  id: string;
  title: string;
  tagline?: Nullable<string>;
  synopsis?: Nullable<string>;
  genres?: Nullable<Array<Nullable<string>>>;
  year?: Nullable<number>;
  maturity?: Nullable<string>;
  runtimeMinutes?: Nullable<number>;
  matchPercent?: Nullable<number>;
  cast?: Nullable<Array<Nullable<string>>>;
  streamUrl: string;
  thumbnailUrl?: Nullable<string>;
  gradientFrom?: Nullable<string>;
  gradientTo?: Nullable<string>;
  rails?: Nullable<Array<Nullable<string>>>;
  trendingRank?: Nullable<number>;
  likes?: Nullable<number>;
  views?: Nullable<string>;
  rating?: Nullable<number>;
  // Populated when queried with selectionSet ["*", "reviews.*"].
  reviews?: Nullable<Array<AmplifyReview>>;
};

// --- Coercion helpers: null/undefined -> safe domain defaults. ---
const DEFAULT_GRADIENT: [string, string] = ["#1e1b4b", "#0f172a"];
const VALID_RAILS: Rail[] = ["for-you", "trending"];
const VALID_SENTIMENTS: Sentiment[] = ["loved", "liked", "mixed"];

const strings = (arr: Nullable<Array<Nullable<string>>>): string[] =>
  (arr ?? []).filter((s): s is string => typeof s === "string");

const rails = (arr: Nullable<Array<Nullable<string>>>): Rail[] =>
  strings(arr).filter((r): r is Rail => (VALID_RAILS as string[]).includes(r));

const sentiment = (s: Nullable<string>): Sentiment =>
  (VALID_SENTIMENTS as string[]).includes(s ?? "") ? (s as Sentiment) : "mixed";

// --- Mappers: Amplify wire shape -> domain type. ---
export function toReview(r: AmplifyReview): Review {
  return {
    id: r.id,
    author: r.author,
    avatarColor: r.avatarColor ?? "#6366f1",
    rating: r.rating ?? 0,
    sentiment: sentiment(r.sentiment),
    body: r.body ?? "",
    likes: r.likes ?? 0,
    timeAgo: r.timeAgo ?? "",
  };
}

export function toContent(c: AmplifyContent): Content {
  return {
    id: c.id,
    title: c.title,
    tagline: c.tagline ?? "",
    synopsis: c.synopsis ?? "",
    genres: strings(c.genres),
    year: c.year ?? 0,
    maturity: c.maturity ?? "NR",
    runtimeMinutes: c.runtimeMinutes ?? 0,
    matchPercent: c.matchPercent ?? 0,
    cast: strings(c.cast),
    streamUrl: c.streamUrl,
    thumbnailUrl: c.thumbnailUrl ?? undefined,
    gradient: [
      c.gradientFrom ?? DEFAULT_GRADIENT[0],
      c.gradientTo ?? DEFAULT_GRADIENT[1],
    ],
    rails: rails(c.rails),
    trendingRank: c.trendingRank ?? undefined,
    likes: c.likes ?? 0,
    views: c.views ?? "0",
    rating: c.rating ?? 0,
    reviews: (c.reviews ?? []).map(toReview),
  };
}

// --- Minimal structural interface of the generated Amplify Data client. ---
// Declaring only what we call means we don't need `aws-amplify` types here;
// `generateClient<Schema>()` is assignable to this.
type ListResult<T> = { data: T[] };
type GetResult<T> = { data: T | null };
type ArrayFilter = { contains?: string };

export interface AmplifyDataClient {
  models: {
    Content: {
      list(opts?: {
        filter?: { rails?: ArrayFilter; genres?: ArrayFilter };
        selectionSet?: readonly string[];
      }): Promise<ListResult<AmplifyContent>>;
      get(
        input: { id: string },
        opts?: { selectionSet?: readonly string[] },
      ): Promise<GetResult<AmplifyContent>>;
    };
    Review: {
      list(opts?: {
        filter?: { contentId?: { eq?: string } };
      }): Promise<ListResult<AmplifyReview>>;
    };
  };
}

// Pull content + its reviews in one round trip.
const CONTENT_SELECTION = ["*", "reviews.*"] as const;

export function createAmplifyApi(client: AmplifyDataClient): ContentApi {
  return {
    async getContent(filter?: ContentFilter): Promise<Content[]> {
      const { data } = await client.models.Content.list({
        selectionSet: CONTENT_SELECTION,
        filter: {
          ...(filter?.rail ? { rails: { contains: filter.rail } } : {}),
          ...(filter?.genre ? { genres: { contains: filter.genre } } : {}),
        },
      });
      const list = data.map(toContent);
      // Trending order isn't an index; sort client-side like the REST backend.
      if (filter?.rail === "trending") {
        list.sort((a, b) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99));
      }
      return list;
    },

    async getContentById(id: string): Promise<Content> {
      const { data } = await client.models.Content.get(
        { id },
        { selectionSet: CONTENT_SELECTION },
      );
      if (!data) throw new Error(`Content ${id} not found`);
      return toContent(data);
    },

    async getReviews(contentId: string): Promise<Review[]> {
      const { data } = await client.models.Review.list({
        filter: { contentId: { eq: contentId } },
      });
      return data.map(toReview);
    },
  };
}
