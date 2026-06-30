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
