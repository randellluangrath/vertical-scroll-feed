// Safe wrappers around expo-video player commands.
//
// useVideoPlayer releases the native player on unmount, and the release can
// land BEFORE deferred callbacks that also touch the player (navigation blur
// listeners, effect cleanups, late TV remote events). Calling any method on a
// released player throws "Unable to find the native shared object associated
// with given JS object". A released player needs no pause — the audio is
// already gone — so swallowing that specific failure is correct, not lossy.
import type { VideoPlayer } from "expo-video";

export function safePause(player: VideoPlayer): void {
  try {
    player.pause();
  } catch {
    // Player already released — nothing left to pause.
  }
}

export function safePlay(player: VideoPlayer): void {
  try {
    player.play();
  } catch {
    // Player already released.
  }
}

/** Toggle play/pause, tolerating a released player. */
export function safeToggle(player: VideoPlayer): void {
  try {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  } catch {
    // Player already released.
  }
}
