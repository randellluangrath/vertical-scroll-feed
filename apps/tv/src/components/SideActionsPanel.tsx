// Vertical panel of action buttons on the right edge of each VideoCard.
// tvOS's geometric focus engine moves focus here on D-pad RIGHT from the
// card surface, and back on D-pad LEFT — no explicit wiring needed
// (nextFocus* props are Android TV APIs and don't exist on tvOS).
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FocusableButton } from "./FocusableButton";
import { colors, spacing, type as typeScale } from "../theme/tokens";

type Props = {
  likes: number;
  liked: boolean;
  onLike: () => void;
  rating: number;
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
  saved,
  onSave,
}: Props) {
  return (
    <View style={styles.panel} pointerEvents="box-none">
      <ActionButton
        icon={liked ? "♥" : "♡"}
        label={compactNumber(likes + (liked ? 1 : 0))}
        active={liked}
        activeColor={colors.like}
        onPress={onLike}
        accessibilityLabel={liked ? "Unlike" : "Like"}
      />
      <ActionButton
        icon="★"
        label={rating.toFixed(1)}
        active={false}
        activeColor={colors.rating}
        onPress={() => {}}
        accessibilityLabel={`Rating ${rating.toFixed(1)}`}
      />
      <ActionButton
        icon={saved ? "⊕" : "+"}
        label={saved ? "Saved" : "My List"}
        active={saved}
        activeColor={colors.brand}
        onPress={onSave}
        accessibilityLabel={saved ? "Remove from list" : "Add to list"}
      />
      <ActionButton
        icon="⇧"
        label="Share"
        active={false}
        activeColor={colors.textPrimary}
        onPress={() => {}}
        accessibilityLabel="Share"
      />
    </View>
  );
}

type ActionButtonProps = {
  icon: string;
  label: string;
  active: boolean;
  activeColor: string;
  onPress: () => void;
  accessibilityLabel: string;
};

function ActionButton({
  icon,
  label,
  active,
  activeColor,
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
        <Text style={[styles.icon, active && { color: activeColor }]}>{icon}</Text>
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
    gap: 28,
  },
  button: {
    alignItems: "center",
  },
  buttonInner: {
    alignItems: "center",
    gap: 6,
  },
  icon: {
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 36,
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
