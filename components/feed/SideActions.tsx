"use client";

import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";

type SideActionsProps = {
  likes: number;
  liked: boolean;
  onLike: () => void;
  reviewCount: number;
  onOpenReviews: () => void;
  saved: boolean;
  onSave: () => void;
};

const SideActions = ({
  likes,
  liked,
  onLike,
  reviewCount,
  onOpenReviews,
  saved,
  onSave,
}: SideActionsProps) => {
  return (
    <div className="pointer-events-auto absolute bottom-36 right-3 z-20 flex flex-col items-center gap-5">
      <Action
        label={compactNumber(likes + (liked ? 1 : 0))}
        onClick={onLike}
        active={liked}
      >
        <Heart
          className={cn("size-7", liked && "fill-rose-500 text-rose-500")}
        />
      </Action>

      <Action label={compactNumber(reviewCount)} onClick={onOpenReviews}>
        <MessageCircle className="size-7" />
      </Action>

      <Action label={saved ? "Saved" : "Save"} onClick={onSave} active={saved}>
        <Bookmark
          className={cn("size-7", saved && "fill-brand-strong text-brand-strong")}
        />
      </Action>

      <Action label="Share">
        <Share2 className="size-7" />
      </Action>
    </div>
  );
};

const Action = ({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] transition-transform active:scale-90"
  >
    <span className={cn(active ? "text-white" : "text-white")}>{children}</span>
    <span className="text-[11px] font-semibold">{label}</span>
  </button>
);

export default SideActions;
