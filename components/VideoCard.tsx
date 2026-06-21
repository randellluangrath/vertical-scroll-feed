"use client";

import { useOnInView } from "react-intersection-observer";
import { Video } from "../types/Video";
import { useRef } from "react";

const Overlay = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Vertical Scroll Feed
        </h1>
      </div>
    </div>
  );
};

type VideoCardProps = {
  video: Video;
};

const VideoCard = ({ video }: VideoCardProps) => {
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
      <Overlay />
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={video.url}
        muted
        loop
        playsInline
      />
    </div>
  );
};

export default VideoCard;
