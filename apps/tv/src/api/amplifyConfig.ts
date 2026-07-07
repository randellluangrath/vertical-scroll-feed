// Configures Amplify once, at module load, from the generated outputs.
//
// amplify_outputs.json is produced by deploying the backend
// (`npm run sandbox` at the repo root) and is gitignored — it holds your real
// AppSync endpoint + API key. Until it exists, this import fails the bundle,
// which is why Amplify is only wired in when API_MODE === "amplify" (see
// client.ts). The require is isolated here so the rest of the app never
// touches Amplify config.
import { Amplify } from "aws-amplify";
// Path: apps/tv/amplify_outputs.json (copied next to the app by
// `ampx sandbox --outputs-out-dir apps/tv`, or symlinked from the repo root).
import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);
