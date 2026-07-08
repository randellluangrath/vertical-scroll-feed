// DiscoverScreen — the vertical swipe feed, one full-viewport video per card.
//
// Viewport fit: cards are sized to the *measured* height of the list container
// (onLayout), not Dimensions.get("window") — the two can disagree on tvOS,
// which is what lets a sliver of the next card leak in. With cards exactly
// viewport-sized, the tvOS focus engine's own scroll-to-reveal aligns each
// card perfectly. Do NOT add snapToInterval here: snap logic fights the focus
// engine's scroll and freezes the feed.
import React, { useCallback, useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  ViewToken,
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
  const [rail, setRail] = useState<"for-you" | "trending">("for-you");
  const [genre, setGenre] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Fall back to the window height until the first layout pass reports the truth.
  const [viewportHeight, setViewportHeight] = useState(
    Dimensions.get("window").height,
  );

  const { content, loading, error } = useContent({ rail, genre });

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    // Ignore sub-pixel layout jitter — a state change here re-renders every
    // card, and video players flicker when torn down needlessly.
    setViewportHeight((prev) => (h > 0 && Math.abs(h - prev) > 1 ? h : prev));
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
    [],
  );

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
        data={content}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoCard
            content={item}
            height={viewportHeight}
            isActive={index === activeIndex}
            hasTVPreferredFocus={index === 0}
            onPress={() => handlePress(item)}
          />
        )}
        getItemLayout={(_, index) => ({
          length: viewportHeight,
          offset: viewportHeight * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
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
