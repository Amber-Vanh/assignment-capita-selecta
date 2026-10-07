import { useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { FortuneEntry, useHistoryStore } from "@/hooks/use-history-store";
import { PageTitle } from "@/components/page-title";
import { RevealBadge } from "@/components/reveal-badge";
import { BackButton } from "@/components/back-button";
import { ShareButton } from "@/components/share-button";
import {
  STUDY_WOOD,
  PARCHMENT,
  OLD_INK,
  CANDLELIGHT_GOLD,
  POTION_CRIMSON,
  POTION_EMERALD,
  SPECTRAL_NAVY,
  PENSIEVE_SILVER_BLUE,
} from "@/constants/colors";

const { width } = Dimensions.get("window");

const POTION_YES = require("../../assets/potion-of-truth-green.png");
const POTION_NO = require("../../assets/potion-of-truth-red.png");
const HAT_ASSET = require("../../assets/sorting-hat.png");
const LETTER_OPEN = require("../../assets/letter-open.png");

const VIAL_SIZE = width * 0.95;
const HAT_SIZE = width * 1.4;
const LETTER_SIZE = width * 0.85;

const TITLE_TOP = 150;

export default function EntryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isLoaded = useHistoryStore((state) => state.isLoaded);
  const entry = useHistoryStore((state) => state.entries.find((e) => e.id === id) ?? null);
  const captureRefHandle = useRef<View>(null);

  if (!isLoaded) {
    return <View style={styles.loading} />;
  }

  if (!entry) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>This fortune could not be found.</Text>
        <BackButton onPress={() => router.back()} width={99} style={styles.backButton} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View ref={captureRefHandle} collapsable={false}>
        {entry.type === "potion" && <PotionRecreation entry={entry} />}
        {entry.type === "hat" && <HatRecreation entry={entry} />}
        {entry.type === "letter" && <LetterRecreation entry={entry} />}
      </View>

      <BackButton onPress={() => router.back()} width={99} style={styles.backButton} />

      <ShareButton
        captureRef={captureRefHandle}
        color={PENSIEVE_SILVER_BLUE}
        style={styles.shareButton}
      />
    </View>
  );
}

function PotionRecreation({ entry }: { entry: FortuneEntry }) {
  const isYes = entry.text.trim().toLowerCase().startsWith("yes");

  return (
    <View style={[styles.recreation, { backgroundColor: STUDY_WOOD }]}>
      <PageTitle color={CANDLELIGHT_GOLD} top={TITLE_TOP}>Potion of Truth</PageTitle>
      <View style={styles.vialArea}>
        <Image
          source={isYes ? POTION_YES : POTION_NO}
          style={styles.vial}
          contentFit="contain"
        />
        <RevealBadge style={styles.badge} textureStyle={styles.badgeTexture}>
          <Text style={[styles.result, { color: isYes ? POTION_EMERALD : POTION_CRIMSON }]}>
            {entry.text}
          </Text>
        </RevealBadge>
      </View>
      {entry.question && (
        <Text style={styles.potionQuestion}>&ldquo;{entry.question}&rdquo;</Text>
      )}
    </View>
  );
}

function HatRecreation({ entry }: { entry: FortuneEntry }) {
  return (
    <View style={[styles.recreation, { backgroundColor: PARCHMENT }]}>
      <PageTitle color={STUDY_WOOD} top={TITLE_TOP}>The Sorting Hat</PageTitle>
      <View style={styles.centerArea}>
        <Image source={HAT_ASSET} style={styles.hat} contentFit="contain" />
        <RevealBadge style={styles.hatBadge} textureStyle={styles.badgeTexture}>
          <Text style={styles.hatResult}>{entry.text}</Text>
        </RevealBadge>
      </View>
    </View>
  );
}

function LetterRecreation({ entry }: { entry: FortuneEntry }) {
  return (
    <View style={[styles.recreation, { backgroundColor: OLD_INK }]}>
      <PageTitle color={PARCHMENT} top={TITLE_TOP}>The Sealed Letter</PageTitle>
      <View style={styles.centerArea}>
        <View style={styles.letterStage}>
          <Image source={LETTER_OPEN} style={styles.letterImage} contentFit="contain" />
          <View style={styles.letterTextArea}>
            <Text
              style={styles.letterText}
              numberOfLines={9}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {entry.text}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SPECTRAL_NAVY,
  },
  loading: {
    flex: 1,
    backgroundColor: SPECTRAL_NAVY,
  },
  notFound: {
    flex: 1,
    backgroundColor: SPECTRAL_NAVY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  notFoundText: {
    color: PENSIEVE_SILVER_BLUE,
    textAlign: "center",
    marginBottom: 24,
  },
  recreation: {
    width,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  centerArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 130,
  },
  vialArea: {
    width: "100%",
    height: VIAL_SIZE,
    marginTop: 236,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  vial: {
    width: VIAL_SIZE,
    height: VIAL_SIZE,
  },
  potionQuestion: {
    color: CANDLELIGHT_GOLD,
    fontSize: 22,
    fontFamily: "HomemadeApple",
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 24,
  },
  hat: {
    width: HAT_SIZE,
    height: HAT_SIZE,
  },
  badge: {
    position: "absolute",
    top: "50%",
    marginTop: -50,
    right: VIAL_SIZE * 0.16,
  },
  badgeTexture: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  result: {
    color: OLD_INK,
    fontSize: 32,
    fontFamily: "BebasNeue",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  hatBadge: {
    position: "absolute",
    top: "65%",
    left: 32,
    right: 32,
    transform: [{ rotate: "-5deg" }],
  },
  hatResult: {
    color: OLD_INK,
    fontSize: 18,
    fontFamily: "BebasNeue",
    letterSpacing: 1,
    textAlign: "center",
  },
  letterStage: {
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
  backButton: {
    position: "absolute",
    top: 60,
    left: 16,
  },
  shareButton: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
    backgroundColor: SPECTRAL_NAVY,
  },
});
