import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useHistoryStore } from "@/hooks/use-history-store";
import { getSortingHatReading } from "@/data/sortingHat";
import { PageTitle } from "@/components/page-title";
import { PageHint } from "@/components/page-hint";
import { RevealBadge } from "@/components/reveal-badge";
import { ShareButton } from "@/components/share-button";
import { OLD_INK, PARCHMENT, STUDY_WOOD } from "@/constants/colors";

const HAT_SIZE = Dimensions.get("window").width * 1.4;

const HAT_ASSET = require("../assets/sorting-hat.png");

const PREFERRED_VOICES = ["en-gb-x-gbd-local", "en-gb-x-gba-local", "en-GB-language"];

let cachedVoiceId: string | null | undefined;

async function resolvePreferredVoice(): Promise<string | undefined> {
  if (cachedVoiceId !== undefined) return cachedVoiceId ?? undefined;

  const voices = await Speech.getAvailableVoicesAsync();
  const match = voices.find((voice) => PREFERRED_VOICES.includes(voice.identifier));
  cachedVoiceId = match?.identifier ?? null;
  return cachedVoiceId ?? undefined;
}

export function SortingHatPage({ isActive = true }: { isActive?: boolean }) {
  const [reading, setReading] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const brimLift = useSharedValue(0);
  const pulsate = useSharedValue(1);
  const idleBow = useSharedValue(0);
  const idleBowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);
  const captureRefHandle = useRef<View>(null);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const beginReading = useCallback(async () => {
    setStatusMessage(null);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setStatusMessage("This device has no fingerprint or Face ID sensor.");
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setStatusMessage("No fingerprint or Face ID is set up on this device.");
        return;
      }

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Press your finger to the screen",
      });

      if (!auth.success) {
        setStatusMessage("The Hat couldn't read you. Try again.");
        return;
      }
    } catch {
      setStatusMessage("Something went wrong. Try again.");
      return;
    }

    setIsThinking(true);
    setReading(null);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    brimLift.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    pulsate.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );

    readingTimeoutRef.current = setTimeout(async () => {
      const pick = await getSortingHatReading();
      if (!isMountedRef.current) return;

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setReading(pick);
      setIsThinking(false);
      pulsate.value = withTiming(1, { duration: 300 });

      const voice = await resolvePreferredVoice();
      Speech.speak(pick, { voice, rate: 0.8, pitch: 0.75 });

      await addToHistory("hat", pick);
    }, 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToHistory]);
  
  // swiping away gives this page a new key in the pager, so React unmounts it
  // and all state above starts fresh. What React can't reset is work running
  // outside it — the pending reading and the Hat's voice — so stop those here.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (readingTimeoutRef.current) {
        clearTimeout(readingTimeoutRef.current);
      }
      Speech.stop();
    };
  }, []);

  // an occasional, slow forward bow while the Hat is just resting — as if it's
  // concentrating, brow furrowed — rather than a quick twitch or continuous
  // loop. Scheduled with a randomized delay each time so it never feels
  // mechanical; off while thinking or once a reading is showing.
  useEffect(() => {
    const isIdle = isActive && !isThinking && !reading;

    if (!isIdle) {
      if (idleBowTimeoutRef.current) {
        clearTimeout(idleBowTimeoutRef.current);
        idleBowTimeoutRef.current = null;
      }
      idleBow.value = 0;
      return;
    }

    let cancelled = false;

    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 5000;
      idleBowTimeoutRef.current = setTimeout(() => {
        if (cancelled) return;

        idleBow.value = withSequence(
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) }),
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.cubic) })
        );

        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (idleBowTimeoutRef.current) {
        clearTimeout(idleBowTimeoutRef.current);
        idleBowTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isThinking, reading]);

  const hatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: idleBow.value * 6 },
      { rotate: `${idleBow.value * 4}deg` },
      { scaleY: (1 + brimLift.value * 0.06 - idleBow.value * 0.04) * pulsate.value },
      { scaleX: pulsate.value },
    ],
  }));

  return (
    <Pressable style={styles.container} onPress={beginReading} disabled={isThinking || !isActive}>
      <View style={styles.captureArea} ref={captureRefHandle} collapsable={false}>
        <PageTitle color={STUDY_WOOD}>The Sorting Hat</PageTitle>
        <View style={styles.hatArea}>
          <Animated.View style={hatAnimatedStyle}>
            <Image source={HAT_ASSET} style={styles.hat} contentFit="contain" />
          </Animated.View>
        </View>
        {reading && (
          <RevealBadge style={styles.badge} textureStyle={styles.badgeTexture}>
            <Text style={styles.result}>{reading}</Text>
          </RevealBadge>
        )}
      </View>
      {reading ? (
        <ShareButton
          captureRef={captureRefHandle}
          color={STUDY_WOOD}
          style={styles.shareButton}
        />
      ) : (
        <PageHint color={STUDY_WOOD}>
          {isThinking
            ? "The Hat is thinking..."
            : statusMessage ?? "Tap the screen to let the Sorting Hat read you."}
        </PageHint>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: PARCHMENT,
  },
  captureArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: PARCHMENT,
  },
  hatArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  hat: {
    width: HAT_SIZE,
    height: HAT_SIZE,
  },
  badge: {
    position: "absolute",
    top: "65%",
    left: 32,
    right: 32,
    transform: [{ rotate: "-5deg" }],
  },
  badgeTexture: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  result: {
    color: OLD_INK,
    fontSize: 18,
    fontFamily: "BebasNeue",
    letterSpacing: 1,
    textAlign: "center",
  },
  shareButton: {
    position: "absolute",
    bottom: 80,
    left: 40,
    right: 40,
  },
});
