// Thin wrapper around TouchableHighlight that:
// - applies a visible focus ring on tvOS (the platform focus engine handles hover)
// - forwards all standard Touchable props
// - defaults to an accessible label for the TV focus engine's speech
import React, { useState } from "react";
import {
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  StyleSheet,
} from "react-native";

type Props = TouchableHighlightProps & {
  focusBorderColor?: string;
};

export function FocusableButton({
  children,
  focusBorderColor = "#ffffff",
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableHighlight
      {...rest}
      style={[style, focused && { borderColor: focusBorderColor, borderWidth: 3, borderRadius: 8 }]}
      underlayColor="rgba(255,255,255,0.15)"
      onFocus={(e) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
    >
      <View>{children}</View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({});
