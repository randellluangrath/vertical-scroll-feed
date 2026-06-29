"use client";

import { useMemo, useState } from "react";
import { Send, Star, ThumbsUp, X } from "lucide-react";
import { Video } from "@/types/Video";
import { Review } from "@/types/Video";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";

type ReviewsSheetProps = {
  video: Video;
  open: boolean;
  onClose: () => void;
};

const sentimentMeta: Record<
  Review["sentiment"],
  { label: string; className: string }
> = {
  loved: { label: "Loved it", className: "bg-rose-500/15 text-rose-300" },
  liked: { label: "Liked it", className: "bg-brand/15 text-brand-strong" },
  mixed: { label: "Mixed", className: "bg-amber-500/15 text-amber-300" },
};

const ReviewsSheet = ({ video, open, onClose }: ReviewsSheetProps) => {
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<Review[]>([]);

  const reviews = useMemo(() => [...extra, ...video.reviews], [extra, video.reviews]);

  const lovedPct = Math.round(
    (reviews.filter((r) => r.sentiment !== "mixed").length / reviews.length) *
      100,
  );

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setExtra((prev) => [
      {
        id: `me-${Date.now()}`,
        author: "you",
        avatarColor: "#6366f1",
        rating: 5,
        sentiment: "loved",
        body: text,
        likes: 0,
        timeAgo: "now",
      },
      ...prev,
    ]);
    setDraft("");
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Scrim */}
      <button
        aria-label="Close reviews"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/50"
      />

      {/* Sheet */}
      <div className="animate-sheet-up bg-background/95 relative flex max-h-[72%] flex-col rounded-t-3xl border-t border-white/10 backdrop-blur-xl">
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-white/25" />

        {/* Header / social proof summary */}
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-3">
          <div>
            <h2 className="text-base font-semibold">Reviews</h2>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 font-semibold text-white">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {video.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                {compactNumber(video.reviews.length * 318)} ratings ·{" "}
                <span className="text-emerald-400">{lovedPct}% positive</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Review list */}
        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 pb-3">
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} />
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-white/10 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Add your take…"
              className="placeholder:text-muted-foreground h-10 flex-1 rounded-full border border-white/15 bg-white/5 px-4 text-sm outline-none focus:border-brand-strong"
            />
            <button
              onClick={submit}
              disabled={!draft.trim()}
              className="bg-brand grid size-10 shrink-0 place-items-center rounded-full text-white transition-opacity disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewRow = ({ review }: { review: Review }) => {
  const meta = sentimentMeta[review.sentiment];
  return (
    <div className="flex gap-3">
      <div
        className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: review.avatarColor }}
      >
        {review.author.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold">@{review.author}</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              meta.className,
            )}
          >
            {meta.label}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-amber-400">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="size-2.5 fill-amber-400" />
            ))}
          </span>
          <span className="text-muted-foreground text-[11px]">
            {review.timeAgo}
          </span>
        </div>
        <p className="mt-1 text-sm leading-snug text-white/85">{review.body}</p>
        <button className="text-muted-foreground mt-1.5 flex items-center gap-1 text-[11px] hover:text-white">
          <ThumbsUp className="size-3" />
          {compactNumber(review.likes)}
        </button>
      </div>
    </div>
  );
};

export default ReviewsSheet;
