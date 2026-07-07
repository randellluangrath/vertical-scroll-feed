import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { Content } from "../api/client";

type Options = {
  rail: "for-you" | "trending";
  genre: string | null;
};

export function useContent({ rail, genre }: Options) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async (signal: { cancelled: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getContent({
        rail,
        genre: genre ?? undefined,
      });
      if (!signal.cancelled) setContent(data);
    } catch (err: unknown) {
      if (!signal.cancelled)
        setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (!signal.cancelled) setLoading(false);
    }
  };

  useEffect(() => {
    const signal = { cancelled: false };
    loadContent(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [rail, genre]);

  return { content, loading, error };
}
