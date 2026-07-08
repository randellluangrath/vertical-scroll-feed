import React, { useState } from "react";
import {
  TouchableHighlight,
  TouchableHighlightProps,
  View,
} from "react-native";

type Props = TouchableHighlightProps & {
  focusBorderColor?: string;
  underlayColor?: string;
};

export function FocusableButton({
  children,
  focusBorderColor = "#ffffff",
  underlayColor = "rgba(255,255,255,0.15)",
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableHighlight
      {...rest}
      style={[
        style,
        focused && {
          borderColor: focusBorderColor,
          borderWidth: 3,
          borderRadius: 12,
        },
      ]}
      underlayColor={underlayColor}
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
