import { useHistoryStore } from "@/hooks/use-history-store";
import { getLetterText } from "@/data/letter";
import { preload, useAudioPlayer } from "expo-audio";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { PageTitle } from "@/components/page-title";
import { PageHint } from "@/components/page-hint";
import { ShareButton } from "@/components/share-button";
import { OLD_INK, PARCHMENT } from "@/constants/colors";

const ENVELOPE_SIZE = Dimensions.get("window").width * 1.5;
const LETTER_SIZE = Dimensions.get("window").width * 0.85;

const LETTER_CLOSED = require("../assets/letter-closed.png");
const LETTER_OPEN = require("../assets/letter-open.png");
const UNFOLD_SOUND = require("../assets/sounds/paper-unfold.mp3");
const UNFOLD_SOUND_DURATION_MS = 1540;

preload(UNFOLD_SOUND);

export function LetterPage({ isActive = true }: { isActive?: boolean }) {
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const crack = useSharedValue(0);
  const unfold = useSharedValue(0);
  const idleStrain = useSharedValue(0);
  const idleStrainTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unfoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);
  const captureRefHandle = useRef<View>(null);

  const unfoldPlayer = useAudioPlayer(UNFOLD_SOUND);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const breakSeal = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    crack.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });

    soundTimeoutRef.current = setTimeout(() => {
      unfoldPlayer.seekTo(0);
      unfoldPlayer.play();
    }, 500);

    unfoldTimeoutRef.current = setTimeout(() => {
      unfold.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    }, 500 + UNFOLD_SOUND_DURATION_MS);

    const text = await getLetterText();
    if (!isMountedRef.current) return;

    setLetter(text);
    setIsOpen(true);
    setLoading(false);
    await addToHistory("letter", text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, addToHistory]);

  const reseal = useCallback(() => {
    // eslint-disable-next-line react-hooks/immutability
    crack.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/immutability
    unfold.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
    setIsOpen(false);
    setLetter(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // breakSeal reads isMountedRef.current only after its awaited fetch resolves
  // (never during render); the lint rule can't see that through runOnJS
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .enabled(isActive)
    // eslint-disable-next-line react-hooks/refs
    .onEnd(() => {
      if (isOpen) {
        runOnJS(reseal)();
      } else {
        runOnJS(breakSeal)();
      }
    });

  // swiping away gives this page a new key in the pager, so React unmounts it
  // and all state above starts fresh. What React can't reset is work running
  // outside it — the delayed sound and unfold — so cancel those here. (The
  // unfold sound is released by useAudioPlayer itself.)
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
      }
      if (unfoldTimeoutRef.current) {
        clearTimeout(unfoldTimeoutRef.current);
      }
    };
  }, []);

  // an occasional restless strain against the seal while the envelope is just
  // resting — as if it wants to be opened — rather than a smooth continuous
  // loop. Scheduled with a randomized delay each time so it never feels
  // mechanical; off while cracking/unfolding or once it's open.
  useEffect(() => {
    const isIdle = isActive && !isOpen && !loading;

    if (!isIdle) {
      if (idleStrainTimeoutRef.current) {
        clearTimeout(idleStrainTimeoutRef.current);
        idleStrainTimeoutRef.current = null;
      }
      idleStrain.value = 0;
      return;
    }

    let cancelled = false;

    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 4000;
      idleStrainTimeoutRef.current = setTimeout(() => {
        if (cancelled) return;

        idleStrain.value = withSequence(
          withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
          withTiming(0.3, { duration: 90, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 350, easing: Easing.inOut(Easing.quad) })
        );

        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (idleStrainTimeoutRef.current) {
        clearTimeout(idleStrainTimeoutRef.current);
        idleStrainTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isOpen, loading]);

  const envelopeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - unfold.value,
    transform: [
      { rotate: `${idleStrain.value * -1.2}deg` },
      { translateY: idleStrain.value * -2 },
      { scale: 1 - crack.value * 0.03 },
    ],
  }));

  const letterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: unfold.value,
    transform: [
      { scale: 0.85 + unfold.value * 0.15 },
      { translateY: (1 - unfold.value) * 20 },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.captureArea} ref={captureRefHandle} collapsable={false}>
        <PageTitle color={PARCHMENT}>The Sealed Letter</PageTitle>

        <GestureDetector gesture={doubleTap}>
          <View style={styles.stage}>
            <Animated.View style={[styles.letterLayer, letterAnimatedStyle]}>
              <Image source={LETTER_OPEN} style={styles.letterImage} contentFit="contain" />
              {letter && (
                <View style={styles.letterTextArea}>
                  <Text
                    style={styles.letterText}
                    numberOfLines={9}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {letter}
                  </Text>
                </View>
              )}
            </Animated.View>

            <Animated.View style={[styles.envelopeLayer, envelopeAnimatedStyle]}>
              <Image source={LETTER_CLOSED} style={styles.envelopeImage} contentFit="contain" />
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      {isOpen ? (
        <ShareButton captureRef={captureRefHandle} color={PARCHMENT} style={styles.shareButton} />
      ) : (
        <PageHint color={PARCHMENT}>
          {loading
            ? "The seal is cracking..."
            : "Double-tap the envelope to break the seal"}
        </PageHint>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OLD_INK,
  },
  captureArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OLD_INK,
  },
  stage: {
    width: ENVELOPE_SIZE,
    height: ENVELOPE_SIZE * 1.3,
    alignItems: "center",
    justifyContent: "center",
  },
  envelopeLayer: {
    position: "absolute",
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  envelopeImage: {
    width: "100%",
    height: "100%",
  },
  letterLayer: {
    position: "absolute",
    width: LETTER_SIZE,
    height: LETTER_SIZE * 1.3,
    alignItems: "center",
    justifyContent: "center",
  },
  letterImage: {
    width: "100%",
    height: "100%",
  },
  letterTextArea: {
    position: "absolute",
    top: "22%",
    bottom: "12%",
    left: "12%",
    right: "12%",
    justifyContent: "center",
  },
  letterText: {
    color: OLD_INK,
    fontFamily: "HomemadeApple",
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
  },
  shareButton: {
    position: "absolute",
    bottom: 80,
    left: 40,
    right: 40,
  },
});
