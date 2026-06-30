import { useState, useEffect } from "react";
import { api, ContentSummary } from "../api/client";

type Options = {
  rail: "for-you" | "trending";
  genre: string | null;
};

export function useContent({ rail, genre }: Options) {
  const [content, setContent] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .getContent({ rail, genre: genre ?? undefined })
      .then((data) => {
        if (!cancelled) {
          setContent(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rail, genre]);

  return { content, loading, error };
}
