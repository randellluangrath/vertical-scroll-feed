import "./amplifyConfig";
import { generateClient } from "aws-amplify/data";
import { createAmplifyApi, type AmplifyDataClient } from "./amplify";
import { Content, ContentFilter, Review } from "@goodwatch/shared";

export type {
  Content,
  Review,
  Rail,
  Sentiment,
  ContentFilter,
} from "@goodwatch/shared";

const client = generateClient() as unknown as AmplifyDataClient;

export interface ContentApi {
  getContent(filter?: ContentFilter): Promise<Content[]>;
  getReviews(contentId: string): Promise<Review[]>;
}

export const api: ContentApi = createAmplifyApi(client);
