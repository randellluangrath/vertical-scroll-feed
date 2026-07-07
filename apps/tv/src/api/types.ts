// The TV app's single import point for domain types + the API contract.
//
// Domain types are re-exported from @goodwatch/shared via `export type`, which
// @babel/preset-typescript erases at compile time — so Metro never resolves the
// cross-package path at runtime. TypeScript resolves it through the path alias
// in tsconfig.json ("@goodwatch/shared" -> ../../packages/shared/src/index.ts).
// This gives us ONE source of truth for domain types with zero Metro config.
//
// Rule: only ever `import type` from @goodwatch/shared. Importing a runtime
// value (e.g. ALL_GENRES, the CONTENT array) would force Metro to bundle the
// package and reintroduce the workspace-resolution problems we avoid here.
export type {
  Content,
  Review,
  Rail,
  Sentiment,
  ContentFilter,
} from "@goodwatch/shared";

import type { Content, Review, ContentFilter } from "@goodwatch/shared";

export interface ContentApi {
  getContent(filter?: ContentFilter): Promise<Content[]>;
  getContentById(id: string): Promise<Content>;
  getReviews(contentId: string): Promise<Review[]>;
}
