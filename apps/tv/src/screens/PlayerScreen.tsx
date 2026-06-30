// PlayerScreen — full episode playback with TV-native controls.
//
// The remote maps to:
//   SELECT          → play / pause
//   D-pad LEFT/RIGHT → seek ±10s (via useTVEventHandler)
//   MENU / BACK     → navigate back to HomeScreen (handled by React Navigation)
//   PLAY_PAUSE      → play / pause
//
// Progress bar is a simple animated view driven by a 1-second interval.
// Scrubbing is done by accumulating left/right D-pad events while the
// progress bar has focus — this matches how native tvOS video players work.
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  useTVEventHandler,
} from "react-native";
import { Video as AVVideo, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { FocusableButton } from "../components/FocusableButton";
import { api } from "../api/client";
import type { ContentSummary } from "../api/client";

const { width: W, height: H } = Dimensions.get("window");
const SEEK_SECONDS = 10;

type Route = RouteProp<RootStackParamList, "Player">;

export function PlayerScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { contentId } = route.params;

  const videoRef = useRef<AVVideo>(null);
  const [content, setContent] = useState<ContentSummary | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    api.getContentById(contentId).then(setContent).catch(console.error);
  }, [contentId]);

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

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setDuration(status.durationMillis ?? 0);
    setPosition(status.positionMillis ?? 0);
  }, []);

  // Remote control handler
  useTVEventHandler(
    useCallback(
      (event) => {
        showControls();
        if (event.eventType === "select" || event.eventType === "playPause") {
          isPlaying
            ? videoRef.current?.pauseAsync()
            : videoRef.current?.playAsync();
        }
        if (event.eventType === "left") {
          videoRef.current?.setPositionAsync(
            Math.max(0, position - SEEK_SECONDS * 1000),
          );
        }
        if (event.eventType === "right") {
          videoRef.current?.setPositionAsync(
            Math.min(duration, position + SEEK_SECONDS * 1000),
          );
        }
      },
      [isPlaying, position, duration, showControls],
    ),
  );

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!content) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <AVVideo
        ref={videoRef}
        source={{ uri: content.streamUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />

      {/* Controls overlay */}
      {controlsVisible && (
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent", "transparent", "rgba(0,0,0,0.85)"]}
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
              <Text style={styles.playState}>{isPlaying ? "▶" : "⏸"}</Text>
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
  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 22,
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
  playState: {
    color: "#fff",
    fontSize: 20,
  },
});
