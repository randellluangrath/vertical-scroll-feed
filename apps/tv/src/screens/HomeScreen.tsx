import React, { useCallback, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContent } from "../hooks/useContent";
import { Billboard } from "../components/Billboard";
import { BrandBar } from "../components/BrandBar";
import { ContentRail } from "../components/ContentRail";
import { DiscoverBanner } from "../components/DiscoverBanner";
import { SplashInterstitial } from "../components/SplashInterstitial";
import type { RootStackParamList } from "../navigation/RootNavigator";
import type { Content } from "../api/client";
import { colors, spacing } from "../theme/tokens";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const trending = useContent({ rail: "trending", genre: null });
  const forYou = useContent({ rail: "for-you", genre: null });
  const scrollRef = useRef<ScrollView>(null);

  const openPlayer = useCallback(
    (content: Content) => navigation.navigate("Player", { content }),
    [navigation],
  );
  const openDiscover = useCallback(
    () => navigation.navigate("Discover"),
    [navigation],
  );

  // When focus walks back up to the billboard CTA, the focus engine's own
  // scroll-to-reveal shows only the button, leaving the page stuck
  // half-scrolled. Snap the whole ScrollView back to the top instead —
  // same imperative-scroll pattern as the Discover feed.
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  if (trending.loading || forYou.loading) {
    return <SplashInterstitial message="Loading some good watches..." />;
  }

  if (trending.error || forYou.error) {
    throw new Error(
      `Failed to load content: ${trending.error ?? forYou.error}`,
    );
  }

  const hero = trending.content[0] ?? forYou.content[0];

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Fixed top nav — pinned outside the ScrollView so it never scrolls
          off-screen and stays reachable when navigating focus back up. */}
      <BrandBar onDiscover={openDiscover} />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Autoplaying billboard — muted preview of the featured title */}
        {hero && (
          <Billboard
            content={hero}
            onWatch={() => openPlayer(hero)}
            onCtaFocus={scrollToTop}
          />
        )}

        {/* Rails */}
        <ContentRail
          title="Trending Now"
          items={trending.content}
          onSelect={openPlayer}
        />

        {/* Discover gets its own section — it's a destination, not a hero CTA */}
        <DiscoverBanner onPress={openDiscover} />

        <ContentRail
          title="For You"
          items={forYou.content}
          onSelect={openPlayer}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
