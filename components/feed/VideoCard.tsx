"use client";

import { useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Heart, Pause, Volume2, VolumeX } from "lucide-react";
import { Video } from "@/types/Video";
import { compactNumber } from "@/lib/format";
import Overlay from "./Overlay";
import SideActions from "./SideActions";
import ReviewsSheet from "./ReviewsSheet";

type VideoCardProps = {
  video: Video;
  muted: boolean;
  onToggleMute: () => void;
};

const VideoCard = ({ video, muted, onToggleMute }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [showHeart, setShowHeart] = useState(false);

  const lastTap = useRef(0);

  // Drive playback imperatively as the card enters/leaves the viewport.
  const { ref } = useInView({
    threshold: 0.6,
    onChange: (visible) => {
      inView.current = visible;
      const el = videoRef.current;
      if (!el) return;
      if (visible && !reviewsOpen) {
        el.play().catch(() => {});
        setIsPlaying(true);
      } else {
        el.pause();
        if (!visible) el.currentTime = 0;
        setIsPlaying(false);
      }
    },
  });

  const play = () => {
    videoRef.current?.play().catch(() => {});
    setIsPlaying(true);
  };
  const pause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const like = () => {
    setLiked(true);
    setShowHeart(true);
    setBurstKey((k) => k + 1);
    window.setTimeout(() => setShowHeart(false), 850);
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      like(); // double tap
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    window.setTimeout(() => {
      if (lastTap.current && Date.now() - lastTap.current >= 280) {
        if (isPlaying) pause();
        else play();
        lastTap.current = 0;
      }
    }, 290);
  };

  const openReviews = () => {
    pause();
    setReviewsOpen(true);
  };
  const closeReviews = () => {
    setReviewsOpen(false);
    if (inView.current) play();
  };

  return (
    <section
      ref={ref}
      className="relative h-full w-full snap-start snap-always overflow-hidden bg-black"
    >
      {/* Gradient fallback behind the video */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${video.gradient[0]}, ${video.gradient[1]})`,
        }}
      />

      {/* Tap surface + video */}
      <button
        aria-label="Play or pause"
        onClick={handleTap}
        className="absolute inset-0 h-full w-full"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={video.url}
          muted={muted}
          loop
          playsInline
          preload="metadata"
        />
      </button>

      {/* Double-tap heart burst */}
      {showHeart && (
        <div
          key={burstKey}
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <Heart className="animate-heart-burst size-28 fill-rose-500 text-rose-500 drop-shadow-2xl" />
        </div>
      )}

      {/* Paused indicator */}
      {!isPlaying && !reviewsOpen && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="animate-fade-in grid size-16 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
            <Pause className="size-8 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Top-right: mute + live viewers */}
      <div className="pointer-events-none absolute right-3 top-24 z-20 flex flex-col items-end gap-3">
        <button
          onClick={onToggleMute}
          className="pointer-events-auto grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
        <span className="flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          <span className="animate-live-pulse size-1.5 rounded-full bg-emerald-400" />
          {compactNumber((video.likes % 8000) + 600)} watching
        </span>
      </div>

      <SideActions
        likes={video.likes}
        liked={liked}
        onLike={() => (liked ? setLiked(false) : like())}
        reviewCount={video.reviews.length}
        onOpenReviews={openReviews}
        saved={saved}
        onSave={() => setSaved((s) => !s)}
      />

      <Overlay
        video={video}
        saved={saved}
        onSave={() => setSaved((s) => !s)}
        onOpenReviews={openReviews}
      />

      <ReviewsSheet video={video} open={reviewsOpen} onClose={closeReviews} />
    </section>
  );
};

export default VideoCard;
