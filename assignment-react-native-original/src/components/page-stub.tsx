import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { PageTitle } from "@/components/page-title";
import { PageHint } from "@/components/page-hint";
import { CANDLELIGHT_GOLD, STUDY_WOOD, OLD_INK, PARCHMENT } from "@/constants/colors";

const { width } = Dimensions.get("window");

const POTION_ICON = require("../assets/potion-of-truth.png");
const HAT_ICON = require("../assets/sorting-hat.png");
const LETTER_ICON = require("../assets/letter-closed.png");

const STUB_CONFIG = {
  potion: {
    backgroundColor: STUDY_WOOD,
    titleColor: CANDLELIGHT_GOLD,
    title: "Potion of Truth",
    icon: POTION_ICON,
    heroWidth: width * 0.95,
    heroHeight: width * 0.95,
    heroMarginTop: 190,
    hint: "Ask your question and then shake the phone for your answer",
    hintColor: CANDLELIGHT_GOLD,
    inputPlaceholder: "Ask a yes-or-no question...",
  },
  hat: {
    backgroundColor: PARCHMENT,
    titleColor: STUDY_WOOD,
    title: "The Sorting Hat",
    icon: HAT_ICON,
    heroWidth: width * 1.4,
    heroHeight: width * 1.4,
    hint: "Tap the screen to let the Sorting Hat read you.",
    hintColor: STUDY_WOOD,
  },
  letter: {
    backgroundColor: OLD_INK,
    titleColor: PARCHMENT,
    title: "The Sealed Letter",
    icon: LETTER_ICON,
    heroWidth: width * 1.5,
    heroHeight: width * 1.5 * 1.3,
    hint: "Double-tap the envelope to break the seal",
    hintColor: PARCHMENT,
  },
} as const;

export type StubPageKey = keyof typeof STUB_CONFIG;


export function PageStub({ page }: { page: StubPageKey }) {
  const config = STUB_CONFIG[page];
  const inputPlaceholder = "inputPlaceholder" in config ? config.inputPlaceholder : null;
  const heroMarginTop = "heroMarginTop" in config ? config.heroMarginTop : undefined;

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <PageTitle color={config.titleColor}>{config.title}</PageTitle>
      <View
        style={[
          heroMarginTop === undefined
            ? styles.heroArea
            : [styles.heroAreaFixed, { height: config.heroHeight, marginTop: heroMarginTop }],
        ]}
      >
        <Image
          source={config.icon}
          style={{ width: config.heroWidth, height: config.heroHeight }}
          contentFit="contain"
        />
      </View>
      {inputPlaceholder && (
        <View style={[styles.inputBox, { borderColor: config.hintColor }]}>
          <Text style={[styles.inputPlaceholderText, { color: config.hintColor }]}>
            {inputPlaceholder}
          </Text>
        </View>
      )}
      <PageHint color={config.hintColor}>{config.hint}</PageHint>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  heroArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  heroAreaFixed: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  inputBox: {
    position: "absolute",
    left: "7.5%",
    width: "85%",
    bottom: 170,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  inputPlaceholderText: {
    fontSize: 14,
    opacity: 0.6,
  },
});
