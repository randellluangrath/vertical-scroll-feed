import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { DiscoverScreen } from "../screens/DiscoverScreen";
import { PlayerScreen } from "../screens/PlayerScreen";
import type { Content } from "../api/client";

export type RootStackParamList = {
  Home: undefined;
  Discover: undefined;
  // The full Content object rides along (plain JSON, serializable) — the
  // caller already has it, so the player starts without a refetch and the
  // slimmed ContentApi doesn't need a getContentById.
  Player: { content: Content };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  );
}
