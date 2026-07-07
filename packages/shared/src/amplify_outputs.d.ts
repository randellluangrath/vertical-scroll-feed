// Ambient declaration so TypeScript resolves the generated-config import
// before `amplify_outputs.json` exists. The real file is created by
// `npm run sandbox` (ampx) and is gitignored. Metro still needs the actual
// file to bundle — this only keeps `tsc` green pre-deploy.
declare module "*/amplify_outputs.json" {
  const outputs: Record<string, unknown>;
  export default outputs;
}
