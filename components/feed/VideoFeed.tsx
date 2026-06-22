import { manifest } from "@/data/manifest";
import Overlay from "./Overlay";
import VideoCard from "./VideoCard";

const VideoFeed = () => {
  const videos = manifest.data.videos;

  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
      {videos.map((video) => {
        return (
          <div key={video.id} className="h-screen snap-start snap-always">
            <Overlay video={video} />
            <VideoCard videoUrl={video.url} />
          </div>
        );
      })}
    </div>
  );
};

export default VideoFeed;
