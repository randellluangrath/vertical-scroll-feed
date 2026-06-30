// Vertical panel of action buttons on the right edge of each VideoCard.
// Accessible via D-pad RIGHT from the main card surface.
// Each button is independently focusable and activatable with SELECT.
// D-pad LEFT from any button here returns focus to the card (via nextFocusLeft).
import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FocusableButton } from "./FocusableButton";

type Props = {
  likes: number;
  liked: boolean;
  onLike: () => void;
  rating: number;
  saved: boolean;
  onSave: () => void;
  onFocusChange: (focused: boolean) => void;
  nextFocusLeft?: number | null;
};

function compactNumber(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export const SideActionsPanel = forwardRef<View, Props>(function SideActionsPanel(
  { likes, liked, onLike, rating, saved, onSave, onFocusChange, nextFocusLeft },
  ref,
) {
  return (
    <View ref={ref} style={styles.panel} pointerEvents="box-none">
      <ActionButton
        icon={liked ? "♥" : "♡"}
        label={compactNumber(likes + (liked ? 1 : 0))}
        active={liked}
        activeColor="#f43f5e"
        onPress={onLike}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        nextFocusLeft={nextFocusLeft}
        accessibilityLabel={liked ? "Unlike" : "Like"}
      />
      <ActionButton
        icon="★"
        label={rating.toFixed(1)}
        active={false}
        activeColor="#fbbf24"
        onPress={() => {}}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        nextFocusLeft={nextFocusLeft}
        accessibilityLabel={`Rating ${rating.toFixed(1)}`}
      />
      <ActionButton
        icon={saved ? "⊕" : "+"}
        label={saved ? "Saved" : "My List"}
        active={saved}
        activeColor="#6366f1"
        onPress={onSave}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        nextFocusLeft={nextFocusLeft}
        accessibilityLabel={saved ? "Remove from list" : "Add to list"}
      />
      <ActionButton
        icon="⇧"
        label="Share"
        active={false}
        activeColor="#fff"
        onPress={() => {}}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        nextFocusLeft={nextFocusLeft}
        accessibilityLabel="Share"
      />
    </View>
  );
});

type ActionButtonProps = {
  icon: string;
  label: string;
  active: boolean;
  activeColor: string;
  onPress: () => void;
  onFocus: () => void;
  onBlur: () => void;
  nextFocusLeft?: number | null;
  accessibilityLabel: string;
};

function ActionButton({
  icon,
  label,
  active,
  activeColor,
  onPress,
  onFocus,
  onBlur,
  nextFocusLeft,
  accessibilityLabel,
}: ActionButtonProps) {
  return (
    <FocusableButton
      style={styles.button}
      onPress={onPress}
      onFocus={onFocus}
      onBlur={onBlur}
      nextFocusLeft={nextFocusLeft ?? undefined}
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
    right: 40,
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
    color: "#ffffff",
    fontSize: 32,
    lineHeight: 36,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
