// HomeScreen — vertical scroll discovery feed, TV-adapted.
//
// Web pattern:           TV pattern:
// scroll container       FlatList (vertical, full-screen items)
// useInView hook      →  onViewableItemsChanged (60% threshold)
// intersection play   →  isActive prop drives play/pause per card
// genre chip bar      →  DiscoveryBar overlay (focusable, D-pad up from feed)
//
// The D-pad up/down on the remote navigates between VideoCard items.
// React Native's FlatList scrolls the list to keep the focused item in view.
// pagingEnabled is NOT used — instead each item is exactly SCREEN_HEIGHT tall
// and getItemLayout tells FlatList the size without measuring. This makes
// scrolling smooth and avoids the layout jank that pagingEnabled can cause on tvOS.
import React, { useCallback, useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  ViewToken,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContent } from "../hooks/useContent";
import { VideoCard } from "../components/VideoCard";
import { DiscoveryBar } from "../components/DiscoveryBar";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { ContentSummary } from "../api/client";

const { height: H } = Dimensions.get("window");

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [rail, setRail] = useState<"for-you" | "trending">("for-you");
  const [genre, setGenre] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { content, loading, error } = useContent({ rail, genre });

  // Identify which card is visible (60% threshold → same as web's useInView threshold: 0.6).
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
    (id: string) => {
      navigation.navigate("Player", { contentId: id });
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
        <Text style={styles.errorText}>
          Could not connect to the API.{"\n"}
          Start the backend: cd backend && npm run dev
        </Text>
      </View>
    );
  }

  const genres = [...new Set(content.flatMap((c) => c.genres))];

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <FlatList<ContentSummary>
        data={content}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoCard
            content={item}
            isActive={index === activeIndex}
            hasTVPreferredFocus={index === 0}
            onPress={() => handlePress(item.id)}
          />
        )}
        // Each item is exactly one screen tall — no layout pass needed.
        getItemLayout={(_, index) => ({
          length: H,
          offset: H * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        // Re-mount the list when rail/genre changes so the first item gets focus.
        key={`${rail}-${genre ?? "all"}`}
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
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 22,
  },
  errorText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 20,
    textAlign: "center",
    lineHeight: 32,
  },
});
