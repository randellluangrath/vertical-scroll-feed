import VideoFeed from "@/components/feed/VideoFeed";

export default function Home() {
  return (
    <main className="grid h-full w-full place-items-center bg-neutral-950 sm:bg-gradient-to-br sm:from-neutral-900 sm:to-black">
      <VideoFeed />
    </main>
  );
}
