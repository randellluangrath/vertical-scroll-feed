import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
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
      streamUrl: a.string().required(),
      thumbnailUrl: a.string(),
      gradientFrom: a.string(),
      gradientTo: a.string(),
      rails: a.string().array(),
      trendingRank: a.integer(),
      likes: a.integer().default(0),
      views: a.string(),
      rating: a.float(),
      reviews: a.hasMany("Review", "contentId"),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read", "create"]), // remove create after seed
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
      allow.publicApiKey().to(["read", "create"]), // remove create after seed
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
