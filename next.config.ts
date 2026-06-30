import type { NextConfig } from "next";
import path from "path";

// Turbopack (Next.js 16 default) auto-detects a workspace root from lockfile
// presence + sibling directories. Adding apps/ and packages/ alongside this
// web app causes it to mis-classify the App Router `app/` dir as a workspace
// app and fail to resolve next/package.json. Pin the root explicitly.
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
