"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { manifest, ALL_GENRES } from "@/data/manifest";
import DiscoveryBar from "./DiscoveryBar";
import VideoCard from "./VideoCard";

type Rail = "for-you" | "trending";

const VideoFeed = () => {
  const allVideos = manifest.data.videos;

  const [rail, setRail] = useState<Rail>("for-you");
  const [genre, setGenre] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  const videos = useMemo(() => {
    let list = allVideos.filter((v) => v.rails.includes(rail));
    if (rail === "trending") {
      list = [...list].sort(
        (a, b) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99),
      );
    }
    if (genre) list = list.filter((v) => v.genres.includes(genre));
    return list;
  }, [allVideos, rail, genre]);

  return (
    <div className="relative mx-auto h-full w-full max-w-[440px] overflow-hidden bg-black sm:h-[min(100dvh,900px)] sm:rounded-[2.25rem] sm:border-[10px] sm:border-neutral-800 sm:shadow-2xl">
      <DiscoveryBar
        rail={rail}
        onRailChange={setRail}
        genres={[...ALL_GENRES]}
        activeGenre={genre}
        onGenreChange={setGenre}
      />

      {videos.length > 0 ? (
        <div
          key={`${rail}-${genre ?? "all"}`}
          className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain"
        >
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
            />
          ))}
        </div>
      ) : (
        <div className="grid h-full place-items-center px-8 text-center">
          <div className="text-white/70">
            <Sparkles className="text-brand-strong mx-auto mb-3 size-8" />
            <p className="text-sm">
              Nothing in{" "}
              <span className="font-semibold capitalize">{genre}</span> on this
              rail yet. Try another genre.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
