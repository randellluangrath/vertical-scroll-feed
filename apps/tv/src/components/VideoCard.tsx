// TV-adapted VideoCard.
//
// Web-to-TV mapping:
//   useInView (intersection observer)  →  onFocus / onBlur on TouchableHighlight
//   double-tap like                    →  long-press SELECT (via useTVEventHandler)
//   tap play/pause                     →  short SELECT press (isActive card)
//   swipe-right side actions           →  D-pad RIGHT to SideActionsPanel (nextFocusRight)
//   bottom overlay text                →  same, scaled up for 2m viewing distance
//
// Focus model:
//   The card itself is the primary focusable element in the FlatList.
//   When it receives focus, video plays. When it loses focus, video pauses.
//   Pressing D-pad RIGHT moves focus into the SideActionsPanel (via ref + nextFocusRight).
//   Pressing D-pad LEFT from the panel returns focus to the card.
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
  findNodeHandle,
  useTVEventHandler,
  TVEventControl,
} from "react-native";
import { Video as AVVideo, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { ContentSummary } from "../api/client";
import { SideActionsPanel } from "./SideActionsPanel";

const { width: W, height: H } = Dimensions.get("window");

type Props = {
  content: ContentSummary;
  isActive: boolean;
  hasTVPreferredFocus?: boolean;
  onPress: () => void;
};

export function VideoCard({ content, isActive, hasTVPreferredFocus, onPress }: Props) {
  const videoRef = useRef<AVVideo>(null);
  const cardRef = useRef<TouchableHighlight>(null);
  const panelRef = useRef<View>(null);

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [panelFocused, setPanelFocused] = useState(false);

  // Drive play/pause from parent-controlled isActive flag.
  // isActive is set via FlatList onViewableItemsChanged — same pattern as web's useInView.
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.playAsync().catch(() => {});
    } else {
      videoRef.current.pauseAsync().catch(() => {});
      videoRef.current.setPositionAsync(0).catch(() => {});
    }
  }, [isActive]);

  // Remote control events for the focused card.
  // On tvOS, useTVEventHandler fires for the currently focused element.
  useTVEventHandler(useCallback((event) => {
    if (!isActive) return;
    if (event.eventType === "select") {
      // Short press → play/pause toggle
      videoRef.current?.getStatusAsync().then((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        if (status.isPlaying) {
          videoRef.current?.pauseAsync();
        } else {
          videoRef.current?.playAsync();
        }
      });
    }
    if (event.eventType === "longSelect") {
      setLiked((l) => !l);
    }
  }, [isActive]));

  return (
    <View style={styles.card}>
      {/* Gradient fallback — shown while video loads */}
      <LinearGradient
        colors={content.gradient as [string, string]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Video */}
      <AVVideo
        ref={videoRef}
        source={{ uri: content.streamUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted
        shouldPlay={false}
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

      {/* Primary focusable surface — fills the card.
          nextFocusRight wires D-pad RIGHT to the side actions panel. */}
      <TouchableHighlight
        ref={cardRef}
        style={StyleSheet.absoluteFill}
        underlayColor="transparent"
        hasTVPreferredFocus={hasTVPreferredFocus}
        onPress={onPress}
        nextFocusRight={findNodeHandle(panelRef.current) ?? undefined}
        accessibilityLabel={`${content.title}. ${content.tagline}`}
      >
        <View style={styles.invisible} />
      </TouchableHighlight>

      {/* Side actions panel — D-pad RIGHT from card focuses this */}
      <SideActionsPanel
        ref={panelRef}
        likes={content.likes}
        liked={liked}
        onLike={() => setLiked((l) => !l)}
        rating={content.rating}
        saved={saved}
        onSave={() => setSaved((s) => !s)}
        onFocusChange={setPanelFocused}
        nextFocusLeft={findNodeHandle(cardRef.current) ?? undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: W,
    height: H,
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
