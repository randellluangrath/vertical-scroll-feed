// ContentRail — a horizontal row of focusable poster cards, the standard
// 10-foot browsing pattern. D-pad left/right moves along the rail (the
// FlatList keeps the focused card in view), up/down moves between rails.
// Focused card scales up and gains a focus ring.
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableHighlight,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Content } from "../api/client";
import { colors, spacing, radii, type as typeScale } from "../theme/tokens";

const CARD_WIDTH = 400;
const CARD_HEIGHT = 225; // 16:9

type Props = {
  title: string;
  items: Content[];
  onSelect: (content: Content) => void;
  /** Give the first card in this rail initial focus. */
  hasTVPreferredFocus?: boolean;
};

export function ContentRail({
  title,
  items,
  onSelect,
  hasTVPreferredFocus,
}: Props) {
  return (
    <View style={styles.rail}>
      <Text style={styles.railTitle}>{title}</Text>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        renderItem={({ item, index }) => (
          <PosterCard
            content={item}
            onPress={() => onSelect(item)}
            hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
          />
        )}
      />
    </View>
  );
}

function PosterCard({
  content,
  onPress,
  hasTVPreferredFocus,
}: {
  content: Content;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();

  return (
    <TouchableHighlight
      underlayColor="transparent"
      onPress={onPress}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={() => {
        setFocused(true);
        animate(1.08);
      }}
      onBlur={() => {
        setFocused(false);
        animate(1);
      }}
      style={styles.cardTouchable}
      accessibilityLabel={`${content.title}. ${content.tagline}`}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale }] },
          focused && styles.cardFocused,
        ]}
      >
        {/* Gradient fallback while the thumbnail loads */}
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
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.cardOverlay}
        >
          <Text style={styles.cardTitle} numberOfLines={1}>
            {content.title}
          </Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardMatch}>{content.matchPercent}% match</Text>
            <Text style={styles.cardMetaText}>{content.maturity}</Text>
            <Text style={styles.cardMetaText}>
              ★ {content.rating.toFixed(1)}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  rail: {
    marginBottom: spacing.xl,
  },
  railTitle: {
    color: colors.textPrimary,
    fontSize: typeScale.heading,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  railContent: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  cardTouchable: {
    borderRadius: radii.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  cardFocused: {
    borderWidth: 3,
    borderColor: colors.focusRing,
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xl,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typeScale.body,
    fontWeight: "700",
  },
  cardMeta: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cardMatch: {
    color: colors.match,
    fontSize: typeScale.small,
    fontWeight: "700",
  },
  cardMetaText: {
    color: colors.textSecondary,
    fontSize: typeScale.small,
  },
});
