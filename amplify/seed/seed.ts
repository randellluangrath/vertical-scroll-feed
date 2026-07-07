// Amplify Gen 2 seed — populates DynamoDB with the mock catalog.
//
// Run with:  npm run seed        (repo root → `ampx sandbox seed`)
// Requires a running sandbox (`npm run sandbox`) so amplify_outputs.json exists.
// `ampx sandbox seed` configures Amplify from the sandbox outputs automatically,
// so there's no Amplify.configure() here.
//
// Auth note: Content/Review are guest-READABLE but write-protected (Content
// requires the "Editors" group). So we create an Editor, add it to the group,
// then sign in AGAIN so the session token carries the group claim before writing.
import { generateClient } from "aws-amplify/data";
import {
  createAndSignUpUser,
  addToUserGroup,
  signInUser,
} from "@aws-amplify/seed";
import type { Schema } from "../data/resource";
// Canonical catalog. Node/tsx bundles this directly — no Metro constraint here,
// so unlike the app we import the runtime value from shared.
import { CONTENT } from "../../packages/shared/src/data/content";

const client = generateClient<Schema>({ authMode: "userPool" });

const EDITOR = { username: "seed-editor@goodwatch.local", password: "Seed-Editor-1!" };

async function ensureEditor() {
  try {
    await createAndSignUpUser({
      username: EDITOR.username,
      password: EDITOR.password,
      signInFlow: "Password",
      signInAfterCreation: false,
    });
    await addToUserGroup({ username: EDITOR.username }, "Editors");
  } catch (err) {
    // Re-runs: user already exists / already in group — fine.
    console.log("Editor already provisioned:", String(err));
  }
  // Re-sign-in so the fresh token includes the Editors group claim.
  await signInUser({
    username: EDITOR.username,
    password: EDITOR.password,
    signInFlow: "Password",
  });
}

async function main() {
  await ensureEditor();

  for (const c of CONTENT) {
    // Stable id so re-seeding updates rather than duplicates.
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
      if (reviewErrors) console.error(`  ✗ review by ${r.author}`, reviewErrors);
    }
  }

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
