export type Sentiment = "loved" | "liked" | "mixed";

export type Review = {
  id: string;
  author: string;
  avatarColor: string;
  rating: number;
  sentiment: Sentiment;
  body: string;
  likes: number;
  timeAgo: string;
};

export type Rail = "for-you" | "trending";

export type Content = {
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
  // HLS stream URL — Mux, CloudFront, or any CDN
  streamUrl: string;
  // Mux thumbnail or S3-hosted poster frame
  thumbnailUrl?: string;
  // CSS-compatible gradient tuple for the loading/fallback state
  gradient: [string, string];
  rails: Rail[];
  trendingRank?: number;
  likes: number;
  views: string;
  rating: number;
  reviews: Review[];
};

export type AllGenres = typeof ALL_GENRES[number];

export const ALL_GENRES = [
  "kids",
  "adventure",
  "animation",
  "nature",
  "science",
  "education",
  "family",
  "comedy",
] as const;
