import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ImageBackground } from "expo-image";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

const PARCHMENT_ASSET = require("../assets/parchment.png");

export function RevealBadge({
  children,
  style,
  textureStyle,
}: {
  children: React.ReactNode;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
  textureStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View style={[styles.badge, style]}>
      <ImageBackground
        source={PARCHMENT_ASSET}
        contentFit="fill"
        style={[styles.texture, textureStyle]}
      >
        {children}
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  texture: {
    alignItems: "center",
    justifyContent: "center",
  },
});
