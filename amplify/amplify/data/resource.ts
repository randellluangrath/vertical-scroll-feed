// Amplify Gen 2 data schema.
// Defines AppSync + DynamoDB models for the GoodWatch platform.
// All apps (web, TV, mobile) share this single backend.
//
// To deploy:
//   cd amplify && npx ampx sandbox       # personal dev cloud
//   npx ampx pipeline-deploy --branch main  # CI/CD
import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  // Content item (show, movie, short) — readable by unauthenticated guests.
  Content: a
    .model({
      title: a.string().required(),
      tagline: a.string(),
      synopsis: a.string(),
      genres: a.string().array(),
      year: a.integer(),
      maturity: a.string(),
      runtimeMinutes: a.integer(),
      matchPercent: a.integer(),
      cast: a.string().array(),
      // HLS manifest URL — Mux, CloudFront, or custom CDN
      streamUrl: a.string().required(),
      thumbnailUrl: a.string(),
      // Gradient stored as two hex strings for fallback UI
      gradientFrom: a.string(),
      gradientTo: a.string(),
      rails: a.string().array(),
      trendingRank: a.integer(),
      likes: a.integer().default(0),
      views: a.string(),
      rating: a.float(),
      // Reviews are a child model so they paginate independently
      reviews: a.hasMany("Review", "contentId"),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.group("Editors"),
    ]),

  Review: a
    .model({
      contentId: a.id().required(),
      content: a.belongsTo("Content", "contentId"),
      author: a.string().required(),
      avatarColor: a.string(),
      rating: a.integer().required(),
      sentiment: a.enum(["loved", "liked", "mixed"]),
      body: a.string(),
      likes: a.integer().default(0),
      timeAgo: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      // Authenticated users can write their own reviews
      allow.owner(),
    ]),

  // User watchlist — auth-scoped, not visible to other users.
  WatchlistItem: a
    .model({
      contentId: a.id().required(),
      userId: a.string().required(),
      addedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // Guest API key for unauthenticated read (content catalog)
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
