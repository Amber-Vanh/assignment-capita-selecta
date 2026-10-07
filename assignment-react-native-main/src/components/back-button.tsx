import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";

const BROOM_ASSET = require("../assets/broom.png");
const BROOM_ASPECT_RATIO = 1034 / 944;

export function BackButton({
  onPress,
  width = 44,
  style,
}: {
  onPress: () => void;
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable hitSlop={12} onPress={onPress} style={style}>
      <Image
        source={BROOM_ASSET}
        style={{ width, height: width / BROOM_ASPECT_RATIO }}
        contentFit="contain"
      />
    </Pressable>
  );
}
