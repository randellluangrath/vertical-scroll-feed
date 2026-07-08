// BrandBar — the top navigation bar.
//
//   [ GoodWatch  Discover ] ...................... [ Search   (avatar) ]
//
// Left: wordmark + primary nav. Right (justified): utility actions. All
// interactive items are FocusableButtons so the tvOS focus engine can reach
// them with the D-pad. None take hasTVPreferredFocus — initial focus belongs
// to the screen content (e.g. the hero's Watch Now), not the chrome.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FocusableButton } from "./FocusableButton";
import { colors, spacing, radii, type as typeScale } from "../theme/tokens";

type NavKey = "home" | "discover";

type Props = {
  /** Highlights the matching nav item. */
  activeItem?: NavKey;
  onDiscover?: () => void;
  onSearch?: () => void;
  onProfile?: () => void;
  /** Initial shown in the profile avatar. */
  userInitial?: string;
};

export function BrandBar({
  activeItem = "home",
  onDiscover,
  onSearch,
  onProfile,
  userInitial = "R",
}: Props) {
  return (
    <View style={styles.brandBar}>
      {/* Left: wordmark + primary nav */}
      <View style={styles.leftGroup}>
        <Text style={styles.brandMark}>
          Good<Text style={styles.brandAccent}>Watch</Text>
        </Text>

        <FocusableButton
          onPress={onDiscover}
          style={styles.navItem}
          accessibilityLabel="Discover"
        >
          <Text
            style={[
              styles.navLabel,
              activeItem === "discover" && styles.navLabelActive,
            ]}
          >
            Discover
          </Text>
        </FocusableButton>
      </View>

      {/* Right: utility actions */}
      <View style={styles.rightGroup}>
        <FocusableButton
          onPress={onSearch}
          style={styles.searchItem}
          accessibilityLabel="Search"
        >
          <View style={styles.searchInner}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.navLabel}>Search</Text>
          </View>
        </FocusableButton>

        <FocusableButton
          onPress={onProfile}
          style={styles.avatarButton}
          accessibilityLabel="Profile"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{userInitial}</Text>
          </View>
        </FocusableButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
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
  navItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  searchItem: {
    minWidth: 280,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.chipBorder,
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  searchIcon: {
    color: colors.textSecondary,
    fontSize: typeScale.title,
    fontWeight: "400",
    lineHeight: typeScale.title,
  },
  navLabel: {
    color: colors.textSecondary,
    fontSize: typeScale.body,
    fontWeight: "600",
  },
  navLabelActive: {
    color: colors.textPrimary,
  },
  avatarButton: {
    borderRadius: radii.pill,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    color: colors.textPrimary,
    fontSize: typeScale.body,
    fontWeight: "800",
  },
});
