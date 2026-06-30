import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { PlayerScreen } from "../screens/PlayerScreen";

export type RootStackParamList = {
  Home: undefined;
  Player: { contentId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  );
}
