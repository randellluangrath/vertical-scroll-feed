// Billboard — the autoplaying hero at the top of the landing page.
//
// Netflix pattern: the poster art renders instantly; the muted looping
// preview fades in over it once the player actually starts producing frames
// (playingChange event), so there's never a black flash. Playback pauses
// whenever this screen loses navigation focus — no billboard decoding
// underneath the full-screen Player.
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import type { Content } from "../api/client";
import { FocusableButton } from "./FocusableButton";
import { colors, spacing, radii, type as typeScale } from "../theme/tokens";

const { height: SCREEN_H } = Dimensions.get("window");

type Props = {
  content: Content;
  onWatch: () => void;
  /** Give the Watch Now CTA initial focus (default true — it's the landing action). */
  hasTVPreferredFocus?: boolean;
};

export function Billboard({
  content,
  onWatch,
  hasTVPreferredFocus = true,
}: Props) {
  const player = useVideoPlayer(content.streamUrl, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // Pause when the Home screen is covered (e.g. by the Player); resume on return.
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, isFocused]);

  // Fade the video in over the poster art on first real playback.
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  const videoOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isPlaying) {
      Animated.timing(videoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying, videoOpacity]);

  return (
    <View style={styles.billboard}>
      {/* Poster art — visible instantly, and again if playback ever stalls */}
      <LinearGradient
        colors={content.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {content.thumbnailUrl && (
        <Image
          source={{ uri: content.thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      {/* Autoplaying muted preview, faded in over the art */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: videoOpacity }]}
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </Animated.View>

      {/* Left-to-right scrim keeps the text legible over motion */}
      <LinearGradient
        colors={[colors.overlayStrong, colors.overlaySoft, "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", colors.background]}
        style={styles.bottomFade}
      />

      <View style={styles.content}>
        <View style={styles.metaLine}>
          <Text style={styles.match}>{content.matchPercent}% match</Text>
          <Text style={styles.badge}>{content.maturity}</Text>
          <Text style={styles.metaText}>{content.year}</Text>
          <Text style={styles.metaText}>★ {content.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.tagline}>{content.tagline}</Text>
        <Text style={styles.synopsis} numberOfLines={2}>
          {content.synopsis}
        </Text>

        <View style={styles.actions}>
          <FocusableButton
            onPress={onWatch}
            hasTVPreferredFocus={hasTVPreferredFocus}
            style={styles.primaryButton}
            focusBorderColor={colors.brandStrong}
            underlayColor="#EDEDF7"
            accessibilityLabel={`Watch ${content.title} now`}
          >
            <View style={styles.primaryButtonInner}>
              <Ionicons name="play" size={22} color="#000000" />
              <Text style={styles.primaryButtonLabel}>Watch Now</Text>
            </View>
          </FocusableButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  billboard: {
    height: SCREEN_H * 0.58,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    maxWidth: 900,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  match: {
    color: colors.match,
    fontSize: typeScale.caption,
    fontWeight: "700",
  },
  badge: {
    color: colors.textSecondary,
    fontSize: typeScale.small,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    fontWeight: "600",
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: typeScale.caption,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typeScale.hero,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: typeScale.hero + 6,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: typeScale.body,
    fontWeight: "500",
    marginTop: spacing.xs,
  },
  synopsis: {
    color: colors.textSecondary,
    fontSize: typeScale.caption,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  primaryButtonLabel: {
    color: "#000000",
    fontSize: typeScale.body,
    fontWeight: "600",
  },
});
