// Vertical panel of action buttons on the right edge of each VideoCard.
// tvOS's geometric focus engine moves focus here on D-pad RIGHT from the
// card surface, and back on D-pad LEFT — no explicit wiring needed
// (nextFocus* props are Android TV APIs and don't exist on tvOS).
//
// Icons are Ionicons via @expo/vector-icons — filled variant when active,
// outline when idle, matching the platform's visual language.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FocusableButton } from "./FocusableButton";
import { colors, spacing, type as typeScale } from "../theme/tokens";

type IoniconName = keyof typeof Ionicons.glyphMap;

type Props = {
  likes: number;
  liked: boolean;
  onLike: () => void;
  rating: number;
  reviewCount: number;
  onOpenReviews: () => void;
  saved: boolean;
  onSave: () => void;
};

function compactNumber(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export function SideActionsPanel({
  likes,
  liked,
  onLike,
  rating,
  reviewCount,
  onOpenReviews,
  saved,
  onSave,
}: Props) {
  return (
    <View style={styles.panel} pointerEvents="box-none">
      <ActionButton
        icon={liked ? "heart" : "heart-outline"}
        iconColor={liked ? colors.like : colors.textPrimary}
        label={compactNumber(likes + (liked ? 1 : 0))}
        onPress={onLike}
        accessibilityLabel={liked ? "Unlike" : "Like"}
      />
      <ActionButton
        icon="chatbubble-ellipses-outline"
        iconColor={colors.textPrimary}
        label={`${reviewCount}`}
        onPress={onOpenReviews}
        accessibilityLabel={`Read ${reviewCount} reviews`}
      />
      <ActionButton
        icon="star"
        iconColor={colors.rating}
        label={rating.toFixed(1)}
        onPress={onOpenReviews}
        accessibilityLabel={`Rating ${rating.toFixed(1)}, read reviews`}
      />
      <ActionButton
        icon={saved ? "bookmark" : "bookmark-outline"}
        iconColor={saved ? colors.brandStrong : colors.textPrimary}
        label={saved ? "Saved" : "My List"}
        onPress={onSave}
        accessibilityLabel={saved ? "Remove from list" : "Add to list"}
      />
      <ActionButton
        icon="share-outline"
        iconColor={colors.textPrimary}
        label="Share"
        onPress={() => {}}
        accessibilityLabel="Share"
      />
    </View>
  );
}

type ActionButtonProps = {
  icon: IoniconName;
  iconColor: string;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
};

function ActionButton({
  icon,
  iconColor,
  label,
  onPress,
  accessibilityLabel,
}: ActionButtonProps) {
  return (
    <FocusableButton
      style={styles.button}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.buttonInner}>
        <Ionicons
          name={icon}
          size={34}
          color={iconColor}
          style={styles.icon}
        />
        <Text style={styles.buttonLabel}>{label}</Text>
      </View>
    </FocusableButton>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    right: spacing.xl,
    bottom: 100,
    alignItems: "center",
    gap: spacing.lg,
  },
  button: {
    alignItems: "center",
  },
  buttonInner: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  icon: {
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  buttonLabel: {
    color: colors.textPrimary,
    fontSize: typeScale.small,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
