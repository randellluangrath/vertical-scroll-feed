// Player pool — decouples the expo-video player lifecycle from the React
// component lifecycle so playback can be warmed *before* the UI that shows it.
//
// createVideoPlayer() builds a player outside the useVideoPlayer() hook, so it
// isn't tied to any component's mount/unmount. We keep a small LRU of warm,
// paused, buffering players keyed by stream URL; a screen acquires one (already
// loading) and binds it to a <VideoView>. Bounded because every live player
// holds an AV pipeline + buffers — precious on tvOS.
import { createVideoPlayer, type VideoPlayer } from "expo-video";

const MAX_PLAYERS = 3; // foreground + a couple warm; tune on-device
const FORWARD_BUFFER_SECONDS = 6;

type Entry = { url: string; player: VideoPlayer };

// pool[0] = least-recently-used, pool[last] = most-recently-used
const pool: Entry[] = [];
// The URL currently bound to a mounted view — exempt from eviction.
let pinnedUrl: string | null = null;

function touch(url: string): Entry | undefined {
  const i = pool.findIndex((e) => e.url === url);
  if (i === -1) return undefined;
  const [entry] = pool.splice(i, 1);
  pool.push(entry);
  return entry;
}

function evict(): void {
  while (pool.length > MAX_PLAYERS) {
    const idx = pool.findIndex((e) => e.url !== pinnedUrl);
    if (idx === -1) break; // everything pinned (shouldn't happen with MAX > 1)
    const [dead] = pool.splice(idx, 1);
    try {
      dead.player.release();
    } catch {
      // already released — ignore
    }
  }
}

function getOrCreate(url: string): VideoPlayer {
  const existing = touch(url);
  if (existing) return existing.player;

  const player = createVideoPlayer(url);
  player.muted = true; // warmed silently; the foreground caller unmutes
  player.bufferOptions = {
    preferredForwardBufferDuration: FORWARD_BUFFER_SECONDS,
  };
  pool.push({ url, player });
  evict();
  return player;
}

/** Build (or refresh) a warm, paused, buffering player for this URL. */
export function preloadPlayer(url?: string | null): void {
  if (!url) return;
  getOrCreate(url);
}

/**
 * Return a player to bind to a <VideoView>. Pins it so preloads of other URLs
 * can't evict it while it's on screen. The caller configures loop/mute/play.
 */
export function acquirePlayer(url: string): VideoPlayer {
  const player = getOrCreate(url);
  pinnedUrl = url;
  return player;
}

/** The foreground view unmounted: stop audio, keep the player warm for re-entry. */
export function releasePlayer(url: string): void {
  if (pinnedUrl === url) pinnedUrl = null;
  const entry = pool.find((e) => e.url === url);
  try {
    entry?.player.pause();
  } catch {
    // ignore
  }
  evict(); // now unpinned, may be reclaimed if the pool is over capacity
}

// --- Debounced dwell preload -------------------------------------------------
// Rail browsing fires focus rapidly; only warm a full player once the user
// lingers, so we don't thrash AV pipelines on titles they skim past.
let dwellTimer: ReturnType<typeof setTimeout> | null = null;
let dwellUrl: string | null = null;

export function schedulePreload(url?: string | null, delayMs = 350): void {
  if (!url) return;
  dwellUrl = url;
  if (dwellTimer) clearTimeout(dwellTimer);
  dwellTimer = setTimeout(() => {
    if (dwellUrl) preloadPlayer(dwellUrl);
    dwellTimer = null;
  }, delayMs);
}
