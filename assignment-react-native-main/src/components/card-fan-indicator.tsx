import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { PARCHMENT, OLD_INK, CANDLELIGHT_GOLD } from "@/constants/colors";

const CARD_WIDTH = 30;
const CARD_HEIGHT = 44;
const ACTIVE_SCALE = 1.13;
const SIDE_OFFSET_X = 22;
const SIDE_OFFSET_Y = 6;
const SIDE_ROTATION_DEG = 12;

const POTION_ICON = require("../assets/potion-of-truth.png");
const HAT_ICON = require("../assets/sorting-hat.png");
const LETTER_ICON = require("../assets/letter-closed.png");

const PAGE_ICONS = [POTION_ICON, HAT_ICON, LETTER_ICON];
const PAGE_COUNT = PAGE_ICONS.length;

function shortestSignedDistance(raw: number, count: number) {
  "worklet";
  let d = raw % count;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

function FanCard({
  scrollX,
  pageWidth,
  indexOffset,
  index,
  icon,
}: {
  scrollX: SharedValue<number>;
  pageWidth: number;
  indexOffset: number;
  index: number;
  icon: number;
}) {
  const slot = useDerivedValue(() =>
    shortestSignedDistance(index - (scrollX.value / pageWidth - indexOffset), PAGE_COUNT)
  );

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const s = slot.value;

    const translateX = interpolate(s, [-1, 0, 1], [-SIDE_OFFSET_X, 0, SIDE_OFFSET_X], Extrapolation.CLAMP);
    const translateY = interpolate(s, [-1, 0, 1], [SIDE_OFFSET_Y, 0, SIDE_OFFSET_Y], Extrapolation.CLAMP);
    const rotate = interpolate(
      s,
      [-1, 0, 1],
      [-SIDE_ROTATION_DEG, 0, SIDE_ROTATION_DEG],
      Extrapolation.CLAMP
    );
    const scale = interpolate(Math.abs(s), [0, 1], [ACTIVE_SCALE, 1], Extrapolation.CLAMP);
    const opacity = interpolate(Math.abs(s), [0, 0.5, 1], [1, 0.7, 0.7], Extrapolation.CLAMP);
    const zIndex = interpolate(Math.abs(s), [0, 1], [10, 1], Extrapolation.CLAMP);

    const glowOpacity = interpolate(Math.abs(s), [0, 0.4], [1, 0], Extrapolation.CLAMP);

    return {
      opacity,
      zIndex,
      transform: [{ translateX }, { translateY }, { rotate: `${rotate}deg` }, { scale }],
      shadowOpacity: glowOpacity * 0.9,
    };
  });

  const glyphAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(Math.abs(slot.value), [0, 0.4, 1], [1, 0.15, 0.15], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <Animated.View style={[styles.card, cardAnimatedStyle]}>
      <Animated.View style={glyphAnimatedStyle}>
        <Image source={icon} style={styles.glyph} contentFit="contain" tintColor={OLD_INK} />
      </Animated.View>
    </Animated.View>
  );
}

export function CardFanIndicator({
  scrollX,
  pageWidth,
  indexOffset = 0,
}: {
  scrollX: SharedValue<number>;
  pageWidth: number;
  indexOffset?: number;
}) {
  return (
    <View style={styles.container} pointerEvents="none">
      {PAGE_ICONS.map((icon, index) => (
        <FanCard
          key={index}
          scrollX={scrollX}
          pageWidth={pageWidth}
          indexOffset={indexOffset}
          index={index}
          icon={icon}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: OLD_INK,
    backgroundColor: PARCHMENT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: CANDLELIGHT_GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },
  glyph: {
    width: CARD_WIDTH * 0.55,
    height: CARD_WIDTH * 0.55,
  },
});
