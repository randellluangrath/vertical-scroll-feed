// TV-adapted DiscoveryBar.
// On the web this is a top overlay with horizontal scroll genre chips.
// On TV the same structure works, but:
//  - chips are FocusableButton instances navigable with D-pad left/right
//  - active chip has a solid white background (high contrast for distance viewing)
//  - font sizes are ~40% larger (TV sits 2-3m away, not 30cm)
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FocusableButton } from "./FocusableButton";

type Rail = "for-you" | "trending";

type Props = {
  rail: Rail;
  onRailChange: (rail: Rail) => void;
  genres: string[];
  activeGenre: string | null;
  onGenreChange: (genre: string | null) => void;
};

const TABS: { key: Rail; label: string }[] = [
  { key: "for-you", label: "For You" },
  { key: "trending", label: "Trending" },
];

export function DiscoveryBar({
  rail,
  onRailChange,
  genres,
  activeGenre,
  onGenreChange,
}: Props) {
  return (
    <LinearGradient
      colors={["rgba(0,0,0,0.80)", "rgba(0,0,0,0.40)", "transparent"]}
      style={styles.container}
      pointerEvents="box-none"
    >
      {/* Rail switcher */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <FocusableButton
            key={tab.key}
            onPress={() => onRailChange(tab.key)}
            style={styles.tab}
            accessibilityLabel={tab.label}
          >
            <View>
              <Text
                style={[
                  styles.tabLabel,
                  rail === tab.key ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
              {rail === tab.key && <View style={styles.tabUnderline} />}
            </View>
          </FocusableButton>
        ))}
      </View>

      {/* Genre chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        pointerEvents="box-none"
      >
        <Chip
          label="All"
          active={activeGenre === null}
          onPress={() => onGenreChange(null)}
        />
        {genres.map((g) => (
          <Chip
            key={g}
            label={g}
            active={activeGenre === g}
            onPress={() => onGenreChange(activeGenre === g ? null : g)}
          />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <FocusableButton
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityLabel={label}
    >
      <Text
        style={[styles.chipLabel, active && styles.chipLabelActive]}
      >
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Text>
    </FocusableButton>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingBottom: 32,
    zIndex: 30,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  tabLabelActive: {
    color: "#ffffff",
  },
  tabLabelInactive: {
    color: "rgba(255,255,255,0.45)",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -4,
    left: "50%",
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#6366f1",
    transform: [{ translateX: -12 }],
  },
  chips: {
    paddingHorizontal: 40,
    gap: 10,
    flexDirection: "row",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  chipActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  chipLabel: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 16,
    fontWeight: "600",
  },
  chipLabelActive: {
    color: "#000000",
  },
});
