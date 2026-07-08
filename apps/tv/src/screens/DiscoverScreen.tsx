import React, { useCallback, useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  LayoutChangeEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContent } from "../hooks/useContent";
import { VideoCard } from "../components/VideoCard";
import { DiscoveryBar } from "../components/DiscoveryBar";
import type { RootStackParamList } from "../navigation/RootNavigator";
import type { Content } from "../api/client";
import { colors, type as typeScale } from "../theme/tokens";

type Nav = NativeStackNavigationProp<RootStackParamList, "Discover">;

export function DiscoverScreen() {
  const navigation = useNavigation<Nav>();
  const [rail, setRailState] = useState<"for-you" | "trending">("for-you");
  const [genre, setGenreState] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Fall back to the window height until the first layout pass reports the truth.
  const [viewportHeight, setViewportHeight] = useState(
    Dimensions.get("window").height,
  );

  const listRef = useRef<FlatList<Content>>(null);
  const activeIndexRef = useRef(0);
  const viewportHeightRef = useRef(viewportHeight);

  const { content, loading, error } = useContent({ rail, genre });

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    // Ignore sub-pixel layout jitter — a state change here re-renders every
    // card, and video players flicker when torn down needlessly.
    setViewportHeight((prev) => {
      const next = h > 0 && Math.abs(h - prev) > 1 ? h : prev;
      viewportHeightRef.current = next;
      return next;
    });
  }, []);

  // Focus-driven paging. The tvOS focus engine moves focus to the next card's
  // surface on D-pad up/down, but its own scroll-to-reveal under-shoots by the
  // safe-area (overscan) inset, leaving a sliver of the previous card visible.
  // So focus is only the *signal* — we own the scroll, and snap the focused
  // card exactly to the top of the viewport.
  const handleCardFocus = useCallback((index: number) => {
    if (activeIndexRef.current === index) return;
    activeIndexRef.current = index;
    setActiveIndex(index);
    listRef.current?.scrollToOffset({
      offset: index * viewportHeightRef.current,
      animated: true,
    });
  }, []);

  // Rail/genre changes remount the list — reset paging state to the top.
  const setRail = useCallback((r: "for-you" | "trending") => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    setRailState(r);
  }, []);
  const setGenre = useCallback((g: string | null) => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    setGenreState(g);
  }, []);

  const handlePress = useCallback(
    (item: Content) => {
      navigation.navigate("Player", { content: item });
    },
    [navigation],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const genres = [...new Set(content.flatMap((c) => c.genres))];

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <StatusBar hidden />

      <FlatList<Content>
        ref={listRef}
        data={content}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoCard
            content={item}
            height={viewportHeight}
            isActive={index === activeIndex}
            hasTVPreferredFocus={index === 0}
            onFocus={() => handleCardFocus(index)}
            onPress={() => handlePress(item)}
          />
        )}
        getItemLayout={(_, index) => ({
          length: viewportHeight,
          offset: viewportHeight * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        // Kill the automatic safe-area content inset — it's what made the
        // focus engine's own scroll settle short of the card boundary.
        contentInsetAdjustmentBehavior="never"
        // Remount only on rail/genre change (new result set, focus resets to
        // the first card). Height changes flow through extraData — a key
        // change here would tear down every video player mid-play (flicker).
        key={`${rail}-${genre ?? "all"}`}
        extraData={viewportHeight}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      <DiscoveryBar
        rail={rail}
        onRailChange={setRail}
        genres={genres}
        activeGenre={genre}
        onGenreChange={setGenre}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  loadingText: {
    color: colors.textTertiary,
    fontSize: typeScale.body,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typeScale.body,
    textAlign: "center",
    lineHeight: 32,
  },
});
