import { Review, Video } from "@/types/Video";
import { faker } from "@faker-js/faker";

// Deterministic mock data so the feed looks identical on every render.
faker.seed(424242);

const SENTIMENTS = ["loved", "liked", "mixed"] as const;

const REVIEW_SNIPPETS: Record<(typeof SENTIMENTS)[number], string[]> = {
  loved: [
    "Watched the first minute here and immediately added it. Lived up to the hype.",
    "The preview sold me — binged the whole thing the same night. No regrets.",
    "This clip is exactly the vibe. Cinematography is unreal on a phone.",
    "Came for the trailer, stayed for the story. Instant favourite.",
  ],
  liked: [
    "Solid. Slow to start but the payoff is worth it if you stick around.",
    "Good background watch. The lead carries it more than the plot does.",
    "Better than I expected from the snippet. Worth a weekend.",
    "Fun and easy. Not life-changing but I'd recommend it.",
  ],
  mixed: [
    "The clip is stronger than the full thing, honestly. Front-loaded.",
    "Gorgeous to look at, thin on story. Your mileage may vary.",
    "Started great, lost me halfway. Glad I previewed first.",
    "Hyped but uneven. The preview is the best part.",
  ],
};

const makeReviews = (count: number): Review[] =>
  Array.from({ length: count }).map(() => {
    const sentiment = faker.helpers.arrayElement(SENTIMENTS);
    const rating =
      sentiment === "loved"
        ? faker.number.int({ min: 5, max: 5 })
        : sentiment === "liked"
          ? faker.number.int({ min: 4, max: 4 })
          : faker.number.int({ min: 2, max: 3 });
    return {
      id: faker.string.uuid(),
      author: faker.internet.username().toLowerCase(),
      avatarColor: faker.helpers.arrayElement([
        "#6366f1",
        "#ec4899",
        "#14b8a6",
        "#f59e0b",
        "#8b5cf6",
        "#ef4444",
        "#0ea5e9",
      ]),
      rating,
      sentiment,
      body: faker.helpers.arrayElement(REVIEW_SNIPPETS[sentiment]),
      likes: faker.number.int({ min: 0, max: 2400 }),
      timeAgo: faker.helpers.arrayElement([
        "2h",
        "5h",
        "1d",
        "3d",
        "1w",
        "2w",
      ]),
    };
  });

const avgRating = (reviews: Review[]) =>
  Math.round(
    (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
  ) / 10;

type Seed = Pick<
  Video,
  | "title"
  | "tagline"
  | "synopsis"
  | "genres"
  | "year"
  | "maturity"
  | "runtimeMinutes"
  | "matchPercent"
  | "cast"
  | "gradient"
  | "rails"
  | "trendingRank"
>;

const SEEDS: Seed[] = [
  {
    title: "Afterglow",
    tagline: "The night the city stopped sleeping.",
    synopsis:
      "When a blackout swallows the coast, two strangers chase the last working signal in town — and discover the dark was hiding more than the lights.",
    genres: ["sci-fi", "thriller", "drama"],
    year: 2025,
    maturity: "TV-MA",
    runtimeMinutes: 112,
    matchPercent: 97,
    cast: ["Mara Quill", "Devon Asar", "Lila North"],
    gradient: ["#1e1b4b", "#0f172a"],
    rails: ["for-you", "trending"],
    trendingRank: 1,
  },
  {
    title: "Slow Burn",
    tagline: "Some recipes take a lifetime.",
    synopsis:
      "A washed-up chef inherits a failing roadside diner and the regulars who refuse to let it die. A warm, funny look at second chances served family-style.",
    genres: ["comedy", "drama", "romance"],
    year: 2024,
    maturity: "TV-14",
    runtimeMinutes: 98,
    matchPercent: 93,
    cast: ["Theo Marsh", "Priya Vale", "Sunny Okafor"],
    gradient: ["#7c2d12", "#1c1917"],
    rails: ["for-you"],
  },
  {
    title: "Deep Field",
    tagline: "We were never meant to look this far.",
    synopsis:
      "A deep-space telescope picks up a signal that shouldn't exist. As the crew decodes it, the line between discovery and warning starts to blur.",
    genres: ["sci-fi", "horror", "thriller"],
    year: 2025,
    maturity: "TV-MA",
    runtimeMinutes: 124,
    matchPercent: 91,
    cast: ["Ingrid Vance", "Caleb Roe", "Nadia Sol"],
    gradient: ["#082f49", "#020617"],
    rails: ["for-you", "trending"],
    trendingRank: 2,
  },
  {
    title: "Paper Tigers",
    tagline: "Everyone's bluffing. Nobody's safe.",
    synopsis:
      "Inside a crumbling investment bank, four junior analysts gamble everything on one impossible trade. A razor-sharp heist of ego, money, and nerve.",
    genres: ["thriller", "drama", "action"],
    year: 2024,
    maturity: "TV-MA",
    runtimeMinutes: 117,
    matchPercent: 88,
    cast: ["Jonah Reyes", "Bex Halloran", "Sim Park"],
    gradient: ["#3b0764", "#0c0a09"],
    rails: ["trending"],
    trendingRank: 3,
  },
  {
    title: "Wildkeep",
    tagline: "The forest remembers everything.",
    synopsis:
      "A grieving ranger returns to the national park where she grew up and finds it changing in ways nature can't explain. A haunting, beautiful slow-burn.",
    genres: ["fantasy", "drama", "horror"],
    year: 2025,
    maturity: "TV-14",
    runtimeMinutes: 105,
    matchPercent: 86,
    cast: ["Elena Brook", "Marcus Vane", "Joon Lee"],
    gradient: ["#052e16", "#0a0a0a"],
    rails: ["for-you"],
  },
  {
    title: "Neon Sunday",
    tagline: "One last race before the world wakes up.",
    synopsis:
      "Underground street racers in a rain-soaked megacity have 12 hours to pull off the run that sets them free. High-octane, neon-drenched, all heart.",
    genres: ["action", "thriller", "drama"],
    year: 2025,
    maturity: "TV-MA",
    runtimeMinutes: 101,
    matchPercent: 84,
    cast: ["Rico Tan", "Aya Moreau", "Dex Hill"],
    gradient: ["#4a044e", "#09090b"],
    rails: ["trending"],
    trendingRank: 4,
  },
];

const generateVideoData = (): Video[] =>
  SEEDS.map((seed, i) => {
    const reviews = makeReviews(faker.number.int({ min: 5, max: 8 }));
    return {
      id: i + 1,
      url: `/clip-${i + 1}.mp4`,
      likes: faker.number.int({ min: 12_000, max: 480_000 }),
      views: `${faker.number.float({ min: 1.1, max: 9.8, fractionDigits: 1 })}M`,
      rating: avgRating(reviews),
      durationInSeconds: faker.number.int({ min: 30, max: 90 }),
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
      reviews,
      ...seed,
    };
  });

export const ALL_GENRES = [
  "sci-fi",
  "thriller",
  "drama",
  "comedy",
  "romance",
  "horror",
  "action",
  "fantasy",
] as const;

export const manifest = {
  data: { videos: generateVideoData() },
};
