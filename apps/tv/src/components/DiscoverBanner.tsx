// DiscoverBanner — a full-width, focusable section that owns the Discover
// entry point. The vertical preview feed is a destination in its own right,
// so it gets a branded banner between rails rather than a button squeezed
// next to the hero's Watch Now CTA.
import React, { useRef, useState } from "react";
import {
  Text,
  View,
  TouchableHighlight,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radii, type as typeScale } from "../theme/tokens";

type Props = {
  onPress: () => void;
};

export function DiscoverBanner({ onPress }: Props) {
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
    <View style={styles.wrapper}>
      <TouchableHighlight
        underlayColor="transparent"
        onPress={onPress}
        onFocus={() => {
          setFocused(true);
          animate(1.02);
        }}
        onBlur={() => {
          setFocused(false);
          animate(1);
        }}
        style={styles.touchable}
        accessibilityLabel="Open Discover: a full-screen feed of previews"
      >
        <Animated.View
          style={[
            styles.banner,
            { transform: [{ scale }] },
            focused && styles.bannerFocused,
          ]}
        >
          <LinearGradient
            colors={[colors.brand, "#312E81"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.textBlock}>
            <Text style={styles.kicker}>DISCOVER</Text>
            <Text style={styles.title}>Preview before you commit</Text>
            <Text style={styles.subtitle}>
              A full-screen feed of previews. Scroll with your remote, read the
              reviews, and save what grabs you.
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Animated.View>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
  },
  touchable: {
    borderRadius: radii.lg,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.lg,
    overflow: "hidden",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  bannerFocused: {
    borderWidth: 3,
    borderColor: colors.focusRing,
  },
  textBlock: {
    maxWidth: 900,
  },
  kicker: {
    color: "rgba(255,255,255,0.75)",
    fontSize: typeScale.small,
    fontWeight: "800",
    letterSpacing: 3,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typeScale.heading,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: "rgba(255,255,255,0.80)",
    fontSize: typeScale.caption,
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  chevron: {
    color: colors.textPrimary,
    fontSize: 56,
    fontWeight: "300",
    marginLeft: spacing.xl,
  },
});
