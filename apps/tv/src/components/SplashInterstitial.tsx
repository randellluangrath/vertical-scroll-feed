import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  type ViewStyle,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, type as typeScale } from "../theme/tokens";

type SpinnerProps = {
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
};

function Spinner({
  size = 56,
  thickness = 5,
  color = colors.brandStrong,
  trackColor = "rgba(255,255,255,0.12)",
}: SpinnerProps) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const ring: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: thickness,
    borderColor: trackColor,
    borderTopColor: color,
  };

  return <Animated.View style={[ring, { transform: [{ rotate }] }]} />;
}

type Props = {
  message?: string;
};

export function SplashInterstitial({ message = "Loading…" }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar hidden />

      <LinearGradient
        colors={["#151233", colors.background, "#08080C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", "rgba(99,102,241,0.12)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.brandBlock}>
        <Text style={styles.brandMark}>
          Good<Text style={styles.brandAccent}>Watch</Text>
        </Text>
      </View>

      <View style={styles.spinnerLayer} pointerEvents="none">
        <Spinner />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  brandBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },
  brandMark: {
    color: colors.textPrimary,
    fontSize: typeScale.hero,
    fontWeight: "900",
    letterSpacing: -2,
  },
  brandAccent: {
    color: colors.brandStrong,
  },
  tagline: {
    color: colors.textTertiary,
    fontSize: typeScale.body,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  spinnerLayer: {
    position: "absolute",
    bottom: spacing.xxl * 2,
    alignItems: "center",
    gap: spacing.md,
  },
  message: {
    color: colors.textTertiary,
    fontSize: typeScale.caption,
    fontWeight: "500",
  },
});
