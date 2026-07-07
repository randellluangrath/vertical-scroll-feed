import type { Schema } from "../../../../amplify/data/resource";
import {
  Rail,
  Sentiment,
  Review,
  Content,
  ContentFilter,
} from "@goodwatch/shared";
import { ContentApi } from "./client";

type RawContent = Schema["Content"]["type"];
type RawReview = Schema["Review"]["type"];

const DEFAULT_GRADIENT: [string, string] = ["#1e1b4b", "#0f172a"];
const VALID_RAILS: Rail[] = ["for-you", "trending"];
const VALID_SENTIMENTS: Sentiment[] = ["loved", "liked", "mixed"];

// Safely filter out nulls/undefined from Amplify arrays
const cleanArray = (arr: unknown): string[] =>
  Array.isArray(arr)
    ? arr.filter((s): s is string => typeof s === "string")
    : [];

const parseSentiment = (s: string | null | undefined): Sentiment =>
  VALID_SENTIMENTS.includes(s as Sentiment) ? (s as Sentiment) : "mixed";

export function toReview(r: Partial<RawReview>): Review {
  return {
    id: r.id ?? "",
    author: r.author ?? "Anonymous",
    avatarColor: r.avatarColor ?? "#6366f1",
    rating: r.rating ?? 0,
    sentiment: parseSentiment(r.sentiment),
    body: r.body ?? "",
    likes: r.likes ?? 0,
    timeAgo: r.timeAgo ?? "",
  };
}

export function toContent(
  c: RawContent & { reviews?: Partial<RawReview>[] },
): Content {
  return {
    id: c.id,
    title: c.title,
    tagline: c.tagline ?? "",
    synopsis: c.synopsis ?? "",
    genres: cleanArray(c.genres),
    year: c.year ?? 0,
    maturity: c.maturity ?? "NR",
    runtimeMinutes: c.runtimeMinutes ?? 0,
    matchPercent: c.matchPercent ?? 0,
    cast: cleanArray(c.cast),
    streamUrl: c.streamUrl,
    thumbnailUrl: c.thumbnailUrl ?? undefined,
    gradient: [
      c.gradientFrom ?? DEFAULT_GRADIENT[0],
      c.gradientTo ?? DEFAULT_GRADIENT[1],
    ],
    rails: cleanArray(c.rails).filter((r): r is Rail =>
      VALID_RAILS.includes(r as Rail),
    ),
    trendingRank: c.trendingRank ?? undefined,
    likes: c.likes ?? 0,
    views: c.views ?? "0",
    rating: c.rating ?? 0,
    reviews: (c.reviews ?? []).map(toReview),
  };
}

export interface AmplifyDataClient {
  models: {
    Content: {
      list(opts?: object): Promise<{ data: any[] }>;
    };
    Review: {
      list(opts?: object): Promise<{ data: any[] }>;
    };
  };
}

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
      if (filter?.rail === "trending") {
        list.sort((a, b) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99));
      }
      return list;
    },

    async getReviews(contentId: string): Promise<Review[]> {
      const { data } = await client.models.Review.list({
        filter: { contentId: { eq: contentId } },
      });
      return data.map(toReview);
    },
  };
}
