import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { STUDY_WOOD, PARCHMENT } from "@/constants/colors";

// deliberately translucent — different from the standard opaque Candlelight
// Gold used everywhere else, since this doubles as the transition flash color
const CANDLELIGHT_GOLD = "#b8892bc4";

const HOLD_DURATION_MS = 1400;
const CANDLE_WIDTH = Dimensions.get("window").width * 0.8;
const CANDLE_HEIGHT = CANDLE_WIDTH * (1308 / 736);

const CANDLE_UNLIT = require("../assets/candle-unlit.png");
const CANDLE_LIT = require("../assets/candle-lit.png");

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function StartScreen() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const glow = useSharedValue(0);
  const fadeOut = useSharedValue(0);

  const enterPager = useCallback(() => {
    router.replace("/pager");
  }, [router]);

  const beginEnter = useCallback(() => {
    setEntering(true);
    fadeOut.value = withTiming(1, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(enterPager)();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelGlow = useCallback(() => {
    if (!entering) {
      glow.value = withTiming(0, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entering]);

  const gesture = Gesture.LongPress()
    .minDuration(HOLD_DURATION_MS)
    .onBegin(() => {
      // eslint-disable-next-line react-hooks/immutability
      glow.value = withTiming(1, { duration: HOLD_DURATION_MS, easing: Easing.out(Easing.quad) });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onStart(() => {
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
      runOnJS(beginEnter)();
    })
    .onFinalize((_event, success) => {
      if (!success) {
        runOnJS(cancelGlow)();
      }
    });

  const litAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - fadeOut.value,
  }));

  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeOut.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Fortune Teller</Text>
            <Text style={styles.subtitle}>Wizarding Edition</Text>
          </View>

          <View style={styles.candleArea}>
            <Image source={CANDLE_UNLIT} style={styles.candle} contentFit="contain" />
            <AnimatedImage
              source={CANDLE_LIT}
              style={[styles.candle, styles.candleOverlay, litAnimatedStyle]}
              contentFit="contain"
            />
          </View>
          <Text style={styles.hint}>Hold your finger to the candle to light it</Text>
        </Animated.View>

        <Animated.View style={[styles.flash, flashAnimatedStyle]} pointerEvents="none" />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STUDY_WOOD,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 96,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  title: {
    color: CANDLELIGHT_GOLD,
    fontSize: 44,
    lineHeight: 52,
    fontFamily: "ClimateCrisis",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: PARCHMENT,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 3,
    textAlign: "center",
    textTransform: "uppercase",
  },
  candleArea: {
    width: CANDLE_WIDTH,
    height: CANDLE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  candle: {
    width: CANDLE_WIDTH,
    height: CANDLE_HEIGHT,
  },
  candleOverlay: {
    position: "absolute",
  },
  flash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CANDLELIGHT_GOLD,
  },
  hint: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    color: CANDLELIGHT_GOLD,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1.5,
    textAlign: "center",
    textTransform: "uppercase",
    paddingHorizontal: 40,
  },
});
