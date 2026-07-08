import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
  useTVEventHandler,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import type { Content } from "../api/client";
import { SideActionsPanel } from "./SideActionsPanel";
import { ReviewsSheet } from "./ReviewsSheet";

const { width: W } = Dimensions.get("window");

type Props = {
  content: Content;
  height: number;
  isActive: boolean;
  hasTVPreferredFocus?: boolean;
  /** Fires when the card's main surface gains TV focus — the screen uses this
      to drive paging (imperative scrollToOffset). */
  onFocus?: () => void;
  onPress: () => void;
};

export function VideoCard({
  content,
  height,
  isActive,
  hasTVPreferredFocus,
  onFocus,
  onPress,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  // expo-video player: muted looping preview, playback driven imperatively.
  const player = useVideoPlayer(content.streamUrl, (p) => {
    p.loop = true;
    p.muted = true;
  });

  // Drive play/pause from parent-controlled isActive flag.
  // isActive is set via FlatList onViewableItemsChanged — same pattern as web's
  // useInView. Pause only — resetting position while the card is still
  // partially on screen causes a visible frame-jump flicker.
  useEffect(() => {
    if (isActive && !reviewsOpen) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, isActive, reviewsOpen]);

  // Remote control events for the focused card.
  // On tvOS, useTVEventHandler fires for the currently focused element.
  useTVEventHandler(
    useCallback(
      (event) => {
        if (!isActive || reviewsOpen) return;
        if (event.eventType === "select") {
          // Short press → play/pause toggle
          if (player.playing) {
            player.pause();
          } else {
            player.play();
          }
        }
        if (event.eventType === "longSelect") {
          setLiked((l) => !l);
        }
      },
      [player, isActive, reviewsOpen],
    ),
  );

  return (
    <View style={[styles.card, { height }]}>
      {/* Gradient fallback — shown while video loads */}
      <LinearGradient
        colors={content.gradient as [string, string]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Video */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Bottom content overlay — gradient + metadata */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.92)"]}
        style={styles.overlay}
        pointerEvents="none"
      >
        <View style={styles.meta} pointerEvents="none">
          <View style={styles.metaLine}>
            <Text style={styles.match}>{content.matchPercent}% match</Text>
            <Text style={styles.badge}>{content.maturity}</Text>
            <Text style={styles.dim}>{content.year}</Text>
            <Text style={styles.dim}>
              {Math.floor(content.runtimeMinutes / 60)}h{" "}
              {content.runtimeMinutes % 60}m
            </Text>
          </View>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.tagline}>{content.tagline}</Text>
          <Text style={styles.synopsis} numberOfLines={2}>
            {content.synopsis}
          </Text>
          <View style={styles.genres}>
            {content.genres.map((g) => (
              <View key={g} style={styles.genreChip}>
                <Text style={styles.genreLabel}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Primary focusable surface — fills the card. tvOS's geometric focus
          engine handles D-pad RIGHT into the side actions panel on its own. */}
      <TouchableHighlight
        style={StyleSheet.absoluteFill}
        underlayColor="transparent"
        hasTVPreferredFocus={hasTVPreferredFocus}
        onFocus={onFocus}
        onPress={onPress}
        accessibilityLabel={`${content.title}. ${content.tagline}`}
      >
        <View style={styles.invisible} />
      </TouchableHighlight>

      {/* Side actions panel — D-pad RIGHT from card focuses this */}
      <SideActionsPanel
        likes={content.likes}
        liked={liked}
        onLike={() => setLiked((l) => !l)}
        rating={content.rating}
        reviewCount={content.reviews.length}
        onOpenReviews={() => setReviewsOpen(true)}
        saved={saved}
        onSave={() => setSaved((s) => !s)}
      />

      {/* Reviews sheet — community reactions, comments-section style */}
      {reviewsOpen && (
        <ReviewsSheet content={content} onClose={() => setReviewsOpen(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: W,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 60,
    paddingTop: 120,
  },
  meta: {
    paddingHorizontal: 60,
    paddingRight: 160,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  match: {
    color: "#4ade80",
    fontSize: 18,
    fontWeight: "700",
  },
  badge: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontWeight: "600",
  },
  dim: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 54,
  },
  tagline: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 20,
    marginTop: 4,
    fontWeight: "500",
  },
  synopsis: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 18,
    marginTop: 12,
    lineHeight: 26,
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  genreChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  genreLabel: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  invisible: {
    flex: 1,
  },
});
