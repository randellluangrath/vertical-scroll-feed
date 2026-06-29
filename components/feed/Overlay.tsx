"use client";

import { useState } from "react";
import { Check, ChevronUp, Play, Plus, Star } from "lucide-react";
import { Video } from "@/types/Video";
import { cn } from "@/lib/utils";
import { runtimeLabel } from "@/lib/format";

type OverlayProps = {
  video: Video;
  saved: boolean;
  onSave: () => void;
  onOpenReviews: () => void;
};

const Overlay = ({ video, saved, onSave, onOpenReviews }: OverlayProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/55 to-transparent pb-[max(1rem,env(safe-area-inset-bottom))] pt-24">
      <div className="pointer-events-auto px-4 pr-20">
        {/* Match + meta line */}
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
          <span className="font-bold text-emerald-400">
            {video.matchPercent}% match
          </span>
          <span className="rounded border border-white/30 px-1 text-[11px] font-medium text-white/80">
            {video.maturity}
          </span>
          <span className="text-white/80">{video.year}</span>
          <span className="text-white/80">{runtimeLabel(video.runtimeMinutes)}</span>
          <button
            onClick={onOpenReviews}
            className="flex items-center gap-1 font-semibold text-white"
          >
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {video.rating.toFixed(1)}
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow">
          {video.title}
        </h1>
        <p className="mt-0.5 text-sm font-medium text-white/70">
          {video.tagline}
        </p>

        {/* Synopsis (tap to expand) */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 block text-left text-[13px] leading-snug text-white/80"
        >
          <span className={cn(!expanded && "line-clamp-2")}>
            {video.synopsis}
          </span>
          <span className="mt-0.5 inline-flex items-center gap-0.5 text-[12px] font-semibold text-white/60">
            {expanded ? "Less" : "More"}
            <ChevronUp
              className={cn(
                "size-3 transition-transform",
                !expanded && "rotate-180",
              )}
            />
          </span>
        </button>

        {/* Genre chips */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {video.genres.map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium capitalize text-white/80 backdrop-blur-sm"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Commit CTAs */}
        <div className="mt-3.5 flex items-center gap-2.5">
          <button className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-bold text-black transition-transform active:scale-[0.98]">
            <Play className="size-5 fill-black" />
            Watch Now
          </button>
          <button
            onClick={onSave}
            className={cn(
              "flex h-11 items-center justify-center gap-1.5 rounded-xl border px-4 text-[14px] font-semibold backdrop-blur-md transition-colors",
              saved
                ? "border-brand-strong bg-brand/20 text-white"
                : "border-white/25 bg-white/10 text-white hover:bg-white/20",
            )}
          >
            {saved ? <Check className="size-5" /> : <Plus className="size-5" />}
            {saved ? "Added" : "My List"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
