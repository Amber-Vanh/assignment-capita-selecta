import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Accelerometer, type AccelerometerMeasurement } from "expo-sensors";
import type { EventSubscription } from "expo-modules-core";
import * as Haptics from "expo-haptics";
import { preload, useAudioPlayer } from "expo-audio";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useHistoryStore } from "@/hooks/use-history-store";
import { PageTitle } from "@/components/page-title";
import { PageHint } from "@/components/page-hint";
import { RevealBadge } from "@/components/reveal-badge";
import { ShareButton } from "@/components/share-button";
import {
  STUDY_WOOD,
  CANDLELIGHT_GOLD,
  OLD_INK,
  POTION_CRIMSON,
  POTION_EMERALD,
} from "@/constants/colors";

const SHAKE_THRESHOLD = 0.7;
const SHAKE_COOLDOWN_MS = 2000;
const SHAKE_COUNT_REQUIRED = 2;
const SHAKE_WINDOW_MS = 1000;
const VIAL_SIZE = Dimensions.get("window").width * 0.95;

const POTION_NEUTRAL = require("../assets/potion-of-truth.png");
const POTION_YES = require("../assets/potion-of-truth-green.png");
const POTION_NO = require("../assets/potion-of-truth-red.png");

const SWIRL_SOUND = require("../assets/sounds/potion-swirl.mp3");

preload(SWIRL_SOUND);

export function PotionPage({ isActive = true }: { isActive?: boolean }) {
  const [result, setResult] = useState<"yes" | "no" | null>(null);
  const [isSwirling, setIsSwirling] = useState(false);
  const [question, setQuestion] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const busyRef = useRef(false);
  const lastShakeRef = useRef(0);
  const crossingTimestampsRef = useRef<number[]>([]);
  const wasAboveThresholdRef = useRef(false);
  const lastMagnitudeRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);
  const captureRefHandle = useRef<View>(null);

  const swirl = useSharedValue(0);
  const resultPop = useSharedValue(0);
  const idleBreathe = useSharedValue(0);

  const swirlPlayer = useAudioPlayer(SWIRL_SOUND);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const activatePotion = useCallback(async () => {
    busyRef.current = true;
    setIsSwirling(true);
    setResult(null);
    resultPop.value = 0;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isMountedRef.current) return;
    swirlPlayer.seekTo(0);
    swirlPlayer.play();

    swirl.value = withRepeat(
      withTiming(1, { duration: 220, easing: Easing.linear }),
      6,
      false,
      (finished) => {
        if (finished) {
          swirl.value = 0;
        }
      }
    );

    const outcome: "yes" | "no" = Math.random() < 0.5 ? "yes" : "no";

    revealTimeoutRef.current = setTimeout(async () => {
      await Haptics.notificationAsync(
        outcome === "yes"
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );

      setResult(outcome);
      setIsSwirling(false);
      busyRef.current = false;
      resultPop.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );

      await addToHistory("potion", outcome === "yes" ? "Yes." : "No.", question.trim() || undefined);
    }, 1320);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToHistory, question]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let subscription: EventSubscription | null = null;

    Accelerometer.setUpdateInterval(100);

    subscription = Accelerometer.addListener((data: AccelerometerMeasurement) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      const delta =
        lastMagnitudeRef.current === null ? 0 : Math.abs(magnitude - lastMagnitudeRef.current);
      lastMagnitudeRef.current = magnitude;

      const isAboveThreshold = delta > SHAKE_THRESHOLD;

      if (isAboveThreshold && !wasAboveThresholdRef.current) {
        crossingTimestampsRef.current.push(now);
        crossingTimestampsRef.current = crossingTimestampsRef.current.filter(
          (t) => now - t <= SHAKE_WINDOW_MS
        );

        if (
          crossingTimestampsRef.current.length >= SHAKE_COUNT_REQUIRED &&
          !busyRef.current &&
          now - lastShakeRef.current > SHAKE_COOLDOWN_MS
        ) {
          lastShakeRef.current = now;
          crossingTimestampsRef.current = [];
          activatePotion();
        }
      }

      wasAboveThresholdRef.current = isAboveThreshold;
    });

    return () => {
      subscription?.remove();
    };
  }, [activatePotion, isActive]);

  // swiping away gives this page a new key in the pager, so React unmounts it
  // and all state above starts fresh. What React can't reset is work running
  // outside it — so cancel the pending reveal here, or it would still save a
  // fortune. (The swirl sound is released by useAudioPlayer itself.)
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  // a slow, gentle rock while the vial is just resting — off while swirling
  // or once a result is showing, so it never competes with those animations
  useEffect(() => {
    if (isActive && !isSwirling && !result) {
      // starts and ends each cycle at 0, so withRepeat's loop boundary has no
      // jump — a start/end value that didn't match caused a visible snap
      idleBreathe.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      );
    } else {
      idleBreathe.value = withTiming(0, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isSwirling, result]);

  const vialAnimatedStyle = useAnimatedStyle(() => {
    const wobble = isSwirling
      ? `${(swirl.value % 1) * 360}deg`
      : `${idleBreathe.value * 1.5}deg`;

    return {
      transform: [
        { rotate: wobble },
        { translateY: idleBreathe.value * -3 },
        { scale: 1 + swirl.value * 0.05 },
      ],
    };
  });

  const potionSource =
    result === "yes" ? POTION_YES : result === "no" ? POTION_NO : POTION_NEUTRAL;

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: resultPop.value },
      { rotate: result === "no" ? "-8deg" : "6deg" },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.captureArea} ref={captureRefHandle} collapsable={false}>
        <PageTitle color={CANDLELIGHT_GOLD}>Potion of Truth</PageTitle>
        <View style={styles.vialArea}>
          <Animated.View style={vialAnimatedStyle}>
            <Image
              source={potionSource}
              style={styles.vial}
              contentFit="contain"
              transition={300}
            />
          </Animated.View>
          {result && (
            <RevealBadge style={[styles.badge, resultAnimatedStyle]} textureStyle={styles.badgeTexture}>
              <Text
                style={[
                  styles.result,
                  { color: result === "no" ? POTION_CRIMSON : POTION_EMERALD },
                ]}
              >
                {result === "yes" ? "Yes." : "No."}
              </Text>
            </RevealBadge>
          )}
        </View>

        {result && question.trim() ? (
          <Text style={styles.question}>&ldquo;{question.trim()}&rdquo;</Text>
        ) : null}
      </View>

      {!result && (
        <TextInput
          style={[
            styles.questionInput,
            keyboardHeight > 0
              ? { bottom: keyboardHeight + 32 }
              : styles.questionInputResting,
          ]}
          placeholder="Ask a yes-or-no question..."
          placeholderTextColor={`${CANDLELIGHT_GOLD}99`}
          value={question}
          onChangeText={setQuestion}
          editable={!isSwirling}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          maxLength={140}
        />
      )}

      {result ? (
        <ShareButton
          captureRef={captureRefHandle}
          color={CANDLELIGHT_GOLD}
          style={styles.shareButton}
        />
      ) : (
        <PageHint color={CANDLELIGHT_GOLD}>Ask your question and then shake the phone for your answer</PageHint>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: STUDY_WOOD,
  },
  captureArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: STUDY_WOOD,
  },
  vialArea: {
    width: "100%",
    height: VIAL_SIZE,
    marginTop: 190,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  vial: {
    width: VIAL_SIZE,
    height: VIAL_SIZE,
  },
  badge: {
    position: "absolute",
    top: "50%",
    marginTop: -50,
    right: VIAL_SIZE * 0.16,
  },
  badgeTexture: {
    width: 120,
    height: 80,
  },
  result: {
    color: OLD_INK,
    fontSize: 32,
    fontFamily: "BebasNeue",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  shareButton: {
    position: "absolute",
    bottom: 80,
    left: 40,
    right: 40,
  },
  question: {
    color: CANDLELIGHT_GOLD,
    fontSize: 22,
    fontFamily: "HomemadeApple",
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 24,
  },
  questionInput: {
    position: "absolute",
    left: "7.5%",
    width: "85%",
    borderWidth: 1,
    borderColor: CANDLELIGHT_GOLD,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: CANDLELIGHT_GOLD,
    fontSize: 14,
    backgroundColor: STUDY_WOOD,
  },
  questionInputResting: {
    bottom: 170,
  },
});
