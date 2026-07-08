import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useTVEventHandler,
} from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { FocusableButton } from "../components/FocusableButton";

const SEEK_SECONDS = 10;

type Route = RouteProp<RootStackParamList, "Player">;

export function PlayerScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { content } = route.params;

  const player = useVideoPlayer(content.streamUrl, (p) => {
    p.loop = true;
    p.timeUpdateEventInterval = 0.25; // seconds between timeUpdate events
    p.play();
  });

  // Stop audio the moment we navigate away. useVideoPlayer does release the
  // native player on unmount, but the release is deferred — the AVPlayer keeps
  // playing through the pop transition (audible after exiting the screen).
  // Pause explicitly on blur, and again in unmount cleanup as a backstop.
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      player.pause();
    });
    return () => {
      unsubscribe();
      player.pause();
    };
  }, [navigation, player]);

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  const timeUpdate = useEvent(player, "timeUpdate");
  const position = timeUpdate?.currentTime ?? 0; // seconds
  const duration = player.duration || 0; // seconds; 0 until loaded

  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Hide controls after 4s of no interaction
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setControlsVisible(false), 4000);
  }, []);

  useEffect(() => {
    showControls();
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, [showControls]);

  // Animate progress bar
  useEffect(() => {
    if (duration === 0) return;
    Animated.timing(progressAnim, {
      toValue: position / duration,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [position, duration, progressAnim]);

  // Remote control handler
  useTVEventHandler(
    useCallback(
      (event) => {
        showControls();
        if (event.eventType === "select" || event.eventType === "playPause") {
          if (player.playing) {
            player.pause();
          } else {
            player.play();
          }
        }
        if (event.eventType === "left") {
          player.seekBy(-SEEK_SECONDS);
        }
        if (event.eventType === "right") {
          player.seekBy(SEEK_SECONDS);
        }
      },
      [player, showControls],
    ),
  );

  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Controls overlay */}
      {controlsVisible && (
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.7)",
            "transparent",
            "transparent",
            "rgba(0,0,0,0.85)",
          ]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          {/* Top bar */}
          <View style={styles.topBar} pointerEvents="box-none">
            <FocusableButton
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hasTVPreferredFocus
              accessibilityLabel="Back"
            >
              <Text style={styles.backLabel}>← Back</Text>
            </FocusableButton>
            <Text style={styles.topTitle}>{content.title}</Text>
          </View>

          {/* Bottom bar: progress + info */}
          <View style={styles.bottomBar} pointerEvents="none">
            <Text style={styles.playerTitle}>{content.title}</Text>
            <Text style={styles.playerTagline}>{content.tagline}</Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{formatTime(position)}</Text>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#ffffff"
              />
              <Text style={styles.timeLabel}>
                -{formatTime(Math.max(0, duration - position))}
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 60,
    paddingTop: 50,
    gap: 24,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backLabel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  topTitle: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 22,
    fontWeight: "500",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 60,
    paddingBottom: 60,
  },
  playerTitle: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  playerTagline: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  timeLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 16,
    fontWeight: "500",
  },
});
