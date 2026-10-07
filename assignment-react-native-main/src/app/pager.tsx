import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useIsFocused } from "expo-router";
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { PotionPage } from "@/components/potion-page";
import { SortingHatPage } from "@/components/sorting-hat-page";
import { LetterPage } from "@/components/letter-page";
import { PensieveButton } from "@/components/pensieve-button";
import { CardFanIndicator } from "@/components/card-fan-indicator";
import { PageStub } from "@/components/page-stub";

const { width } = Dimensions.get("window");

const REAL_FIRST_INDEX = 1;
const REAL_LAST_INDEX = 3;
const STUB_START_INDEX = 0;
const STUB_END_INDEX = 4;

export default function Pager() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(REAL_FIRST_INDEX * width);
  // resetKeys[i] is bumped each time you swipe away from page i. It's used as
  // that page's `key`, and a new key makes React mount a fresh copy — so the
  // page starts over with its initial state, no reset effect needed.
  const [pageState, setPageState] = useState({ activeRealIndex: 0, resetKeys: [0, 0, 0] });
  const { activeRealIndex, resetKeys } = pageState;

  // the pager stays mounted underneath History, so without this the Potion
  // would keep listening to the accelerometer and save fortunes off-screen
  const isFocused = useIsFocused();

  const updateActiveRealIndex = useCallback((slotIndex: number) => {
    const realIndex = Math.min(Math.max(slotIndex - REAL_FIRST_INDEX, 0), REAL_LAST_INDEX - REAL_FIRST_INDEX);
    setPageState((prev) => {
      if (prev.activeRealIndex === realIndex) return prev;
      return {
        activeRealIndex: realIndex,
        resetKeys: prev.resetKeys.map((key, i) => (i === prev.activeRealIndex ? key + 1 : key)),
      };
    });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / width);
      if (index === STUB_START_INDEX) {
        scrollTo(scrollRef, REAL_LAST_INDEX * width, 0, false);
        runOnJS(updateActiveRealIndex)(REAL_LAST_INDEX);
      } else if (index === STUB_END_INDEX) {
        scrollTo(scrollRef, REAL_FIRST_INDEX * width, 0, false);
        runOnJS(updateActiveRealIndex)(REAL_FIRST_INDEX);
      } else {
        runOnJS(updateActiveRealIndex)(index);
      }
    },
  });

  return (
    <View style={styles.container}>
      <PensieveButton />
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentOffset={{ x: REAL_FIRST_INDEX * width, y: 0 }}
      >
        <View style={{ width }}>
          <PageStub page="letter" />
        </View>
        <View style={{ width }}>
          <PotionPage key={resetKeys[0]} isActive={isFocused && activeRealIndex === 0} />
        </View>
        <View style={{ width }}>
          <SortingHatPage key={resetKeys[1]} isActive={isFocused && activeRealIndex === 1} />
        </View>
        <View style={{ width }}>
          <LetterPage key={resetKeys[2]} isActive={isFocused && activeRealIndex === 2} />
        </View>
        <View style={{ width }}>
          <PageStub page="potion" />
        </View>
      </Animated.ScrollView>
      <CardFanIndicator scrollX={scrollX} pageWidth={width} indexOffset={REAL_FIRST_INDEX} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
