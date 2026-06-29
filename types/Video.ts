export type Review = {
  id: string;
  author: string;
  avatarColor: string;
  rating: number; // 1-5
  sentiment: "loved" | "liked" | "mixed";
  body: string;
  likes: number;
  timeAgo: string;
};

export type Video = {
  id: number;
  title: string;
  url: string;
  /** Fallback gradient shown before/while the video loads. */
  gradient: [string, string];
  tagline: string;
  synopsis: string;
  genres: string[];
  year: number;
  maturity: string; // e.g. "TV-MA", "PG-13"
  runtimeMinutes: number;
  /** Personalised relevance score, Netflix-style. */
  matchPercent: number;
  rating: number; // average review score, 1-5
  cast: string[];
  /** Discovery surfaces this title appears on. */
  rails: ("for-you" | "trending")[];
  trendingRank?: number;
  likes: number;
  views: string;
  durationInSeconds: number;
  createdAt: string;
  reviews: Review[];
};
