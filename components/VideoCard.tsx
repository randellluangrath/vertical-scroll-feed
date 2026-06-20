import { Video } from "../types/Video";

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

const VideoCard = ({ video }: { video: Video }) => {
  return (
    <div className="h-screen snap-start">
      <Overlay />
      <video
        className="w-full h-full object-cover"
        controls
        src={video.url}
        autoPlay
        muted
        loop
      />
    </div>
  );
};

export default VideoCard;
