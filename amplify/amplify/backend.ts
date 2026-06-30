// Amplify Gen 2 backend entry point.
// Add auth, storage, functions here as the platform grows.
import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";

export const backend = defineBackend({
  data,
  // auth: auth,       → add Cognito when user accounts / watchlists ship
  // storage: storage, → add S3 when we host thumbnails / trailers ourselves
});
