// HomeScreen — the landing page. Canonical 10-foot layout:
//   brand bar → hero (featured title, full-bleed art, primary CTAs) → rails.
//
// The Discover vertical feed is reachable from the hero's second CTA —
// it's an exploration surface now, not the front door.
//
// Focus flow: "Watch Now" gets initial focus. D-pad right → "Discover".
// D-pad down → Trending rail → For You rail. Left/right within a rail.
import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContent } from "../hooks/useContent";
import { ContentRail } from "../components/ContentRail";
import { DiscoverBanner } from "../components/DiscoverBanner";
import { FocusableButton } from "../components/FocusableButton";
import type { RootStackParamList } from "../navigation/RootNavigator";
import type { Content } from "../api/client";
import { colors, spacing, radii, type as typeScale } from "../theme/tokens";

const { height: SCREEN_H } = Dimensions.get("window");

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const trending = useContent({ rail: "trending", genre: null });
  const forYou = useContent({ rail: "for-you", genre: null });

  const openPlayer = useCallback(
    (content: Content) => navigation.navigate("Player", { content }),
    [navigation],
  );
  const openDiscover = useCallback(
    () => navigation.navigate("Discover"),
    [navigation],
  );

  if (trending.loading || forYou.loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.brandMark}>
          Good<Text style={styles.brandAccent}>Watch</Text>
        </Text>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (trending.error || forYou.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.brandMark}>
          Good<Text style={styles.brandAccent}>Watch</Text>
        </Text>
        <Text style={styles.errorText}>{trending.error ?? forYou.error}</Text>
      </View>
    );
  }

  const hero = trending.content[0] ?? forYou.content[0];

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand bar */}
        <View style={styles.brandBar}>
          <Text style={styles.brandMark}>
            Good<Text style={styles.brandAccent}>Watch</Text>
          </Text>
          <Text style={styles.brandTagline}>discover before you commit</Text>
        </View>

        {/* Hero */}
        {hero && (
          <View style={styles.hero}>
            <LinearGradient
              colors={hero.gradient}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {hero.thumbnailUrl && (
              <Image
                source={{ uri: hero.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            )}
            {/* Left-to-right scrim keeps hero text legible over the art */}
            <LinearGradient
              colors={[colors.overlayStrong, colors.overlaySoft, "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={["transparent", colors.background]}
              style={styles.heroBottomFade}
            />

            <View style={styles.heroContent}>
              <View style={styles.heroMetaLine}>
                <Text style={styles.heroMatch}>{hero.matchPercent}% match</Text>
                <Text style={styles.heroBadge}>{hero.maturity}</Text>
                <Text style={styles.heroMetaText}>{hero.year}</Text>
                <Text style={styles.heroMetaText}>
                  ★ {hero.rating.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.heroTitle}>{hero.title}</Text>
              <Text style={styles.heroTagline}>{hero.tagline}</Text>
              <Text style={styles.heroSynopsis} numberOfLines={2}>
                {hero.synopsis}
              </Text>

              <View style={styles.heroActions}>
                <FocusableButton
                  onPress={() => openPlayer(hero)}
                  hasTVPreferredFocus
                  style={styles.primaryButton}
                  focusBorderColor={colors.brandStrong}
                  underlayColor="#EDEDF7"
                  accessibilityLabel={`Watch ${hero.title} now`}
                >
                  <Text style={styles.primaryButtonLabel}>▶ Watch Now</Text>
                </FocusableButton>
              </View>
            </View>
          </View>
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
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  brandBar: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  brandMark: {
    color: colors.textPrimary,
    fontSize: typeScale.heading,
    fontWeight: "900",
    letterSpacing: -1,
  },
  brandAccent: {
    color: colors.brandStrong,
  },
  brandTagline: {
    color: colors.textTertiary,
    fontSize: typeScale.caption,
    fontWeight: "500",
  },
  hero: {
    height: SCREEN_H * 0.52,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  heroBottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  heroContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    maxWidth: 900,
  },
  heroMetaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heroMatch: {
    color: colors.match,
    fontSize: typeScale.caption,
    fontWeight: "700",
  },
  heroBadge: {
    color: colors.textSecondary,
    fontSize: typeScale.small,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    fontWeight: "600",
  },
  heroMetaText: {
    color: colors.textSecondary,
    fontSize: typeScale.caption,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typeScale.hero,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: typeScale.hero + 6,
  },
  heroTagline: {
    color: colors.textSecondary,
    fontSize: typeScale.body,
    fontWeight: "500",
    marginTop: spacing.xs,
  },
  heroSynopsis: {
    color: colors.textSecondary,
    fontSize: typeScale.caption,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  heroActions: {
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
  primaryButtonLabel: {
    color: "#000000",
    fontSize: typeScale.body,
    fontWeight: "800",
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
