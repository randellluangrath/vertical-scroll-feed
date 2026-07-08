import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Content } from "../api/client";

export type ContentQueryArgs = {
  rail: "for-you" | "trending";
  genre: string | null;
};

export const contentQueryKey = ({ rail, genre }: ContentQueryArgs) =>
  ["content", rail, genre] as const;

export const contentQueryOptions = (args: ContentQueryArgs) => ({
  queryKey: contentQueryKey(args),
  queryFn: () =>
    api.getContent({ rail: args.rail, genre: args.genre ?? undefined }),
});

export function useContent(args: ContentQueryArgs) {
  const { data, isPending, error } = useQuery(contentQueryOptions(args));

  return {
    content: (data ?? []) as Content[],
    loading: isPending,
    error: error ? (error as Error).message : null,
  };
}

export function useCachedContent(id: string): Content | undefined {
  const queryClient = useQueryClient();
  return useMemo(() => {
    const entries = queryClient.getQueriesData<Content[]>({
      queryKey: ["content"],
    });
    for (const [, list] of entries) {
      const hit = list?.find((c) => c.id === id);
      if (hit) return hit;
    }
    return undefined;
  }, [queryClient, id]);
}
