"use client";

import { useOnInView } from "react-intersection-observer";
import { useRef } from "react";

type VideoCardProps = {
  videoUrl: string;
};

const VideoCard = ({ videoUrl }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const inViewRef = useOnInView(
    (inView) => {
      if (!videoRef.current) return;

      if (inView) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    },
    { threshold: 0.7 }, // must be at least 70% visible to count
  );

  return (
    <div className="h-screen snap-start snap-always" ref={inViewRef}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={videoUrl}
        muted
        loop
        playsInline
      />
    </div>
  );
};

export default VideoCard;
