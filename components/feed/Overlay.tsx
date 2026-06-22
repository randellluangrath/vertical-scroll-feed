import { Badge } from "@/components/ui/Badge";
import { Video } from "@/types/Video";

type OverlayProps = {
  video: Video;
};

const Overlay = ({ video }: OverlayProps) => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-1/2 pointer-events-none">
      <div className="flex w-full flex-wrap justify-center gap-2">
        {video.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </div>
  );
};

export default Overlay;
