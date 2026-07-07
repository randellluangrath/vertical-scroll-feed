// Configures Amplify once, at module load, from the generated outputs.
//
// amplify_outputs.json is produced by deploying the backend
// (`npm run sandbox` at the repo root) and is gitignored — it holds your real
// AppSync endpoint + API key. Until it exists, this import fails the bundle,
// which is why Amplify is only wired in when API_MODE === "amplify" (see
// client.ts). The require is isolated here so the rest of the app never
// touches Amplify config.
import { Amplify } from "aws-amplify";
// apps/tv/amplify_outputs.json is a synced copy of the monorepo canonical
// (packages/shared/amplify_outputs.json). Metro can't resolve the shared file
// across packages, so each app bundles its own copy. Produce/refresh it with:
//   npm run sandbox        # writes the canonical to packages/shared
//   npm run outputs:sync   # copies it here
import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);
