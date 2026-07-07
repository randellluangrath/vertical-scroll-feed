import { generateClient } from "aws-amplify/data";
import type { Schema } from "../data/resource";
import { CONTENT } from "../../packages/shared/src/data/content";

const client = generateClient<Schema>();

async function main() {
  for (const c of CONTENT) {
    const { data: content, errors } = await client.models.Content.create({
      id: c.id,
      title: c.title,
      tagline: c.tagline,
      synopsis: c.synopsis,
      genres: c.genres,
      year: c.year,
      maturity: c.maturity,
      runtimeMinutes: c.runtimeMinutes,
      matchPercent: c.matchPercent,
      cast: c.cast,
      streamUrl: c.streamUrl,
      thumbnailUrl: c.thumbnailUrl,
      gradientFrom: c.gradient[0],
      gradientTo: c.gradient[1],
      rails: c.rails,
      trendingRank: c.trendingRank,
      likes: c.likes,
      views: c.views,
      rating: c.rating,
    });

    if (errors) {
      console.error(`✗ ${c.title}`, errors);
      continue;
    }
    console.log(`✓ ${content?.title}`);

    for (const r of c.reviews) {
      const { errors: reviewErrors } = await client.models.Review.create({
        contentId: c.id,
        author: r.author,
        avatarColor: r.avatarColor,
        rating: r.rating,
        sentiment: r.sentiment,
        body: r.body,
        likes: r.likes,
        timeAgo: r.timeAgo,
      });
      if (reviewErrors) console.error(`✗ review by ${r.author}`, reviewErrors);
    }
  }

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
