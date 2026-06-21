import VideoCard from "./VideoCard";
import { manifest } from "../data/manifest";

const VideoFeed = () => {
  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
      {manifest.videos.map((video) => {
        console.log("Rendering video:", video);
        return <VideoCard key={video.id} video={video} />;
      })}
    </div>
  );
};

export default VideoFeed;
