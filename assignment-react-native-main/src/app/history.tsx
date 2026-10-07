import { BackButton } from "@/components/back-button";
import { OLD_INK, PENSIEVE_SILVER_BLUE, SPECTRAL_NAVY } from "@/constants/colors";
import { FortuneEntry, useHistoryStore } from "@/hooks/use-history-store";
import { Image, ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const PARCHMENT_ASSET = require("../assets/parchment.png");
const POTION_ICON = require("../assets/potion-of-truth.png");
const HAT_ICON = require("../assets/sorting-hat.png");
const LETTER_ICON = require("../assets/letter-closed.png");
const BASIN_ASSET = require("../assets/basin.png");

const TYPE_ICON: Record<FortuneEntry["type"], number> = {
  potion: POTION_ICON,
  hat: HAT_ICON,
  letter: LETTER_ICON,
};

type Section = {
  label: string;
  data: FortuneEntry[];
};

function dayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function groupByDay(entries: FortuneEntry[]): Section[] {
  const sections: Section[] = [];
  for (const entry of entries) {
    const label = dayLabel(entry.timestamp);
    const last = sections[sections.length - 1];
    if (last && last.label === label) {
      last.data.push(entry);
    } else {
      sections.push({ label, data: [entry] });
    }
  }
  return sections;
}

type Row =
  | { kind: "header"; label: string }
  | { kind: "entry"; entry: FortuneEntry };

export default function History() {
  const router = useRouter();
  const entries = useHistoryStore((state) => state.entries);
  const clearHistory = useHistoryStore((state) => state.clearHistory);

  function handleClear() {
    Alert.alert(
      "Clear History",
      "This will erase every fortune. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearHistory();
          },
        },
      ]
    );
  }

  const rows = useMemo<Row[]>(() => {
    const sections = groupByDay(entries);
    const flat: Row[] = [];
    for (const section of sections) {
      flat.push({ kind: "header", label: section.label });
      for (const entry of section.data) {
        flat.push({ kind: "entry", entry });
      }
    }
    return flat;
  }, [entries]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <BackButton onPress={() => router.back()} width={99} />
        <Text style={styles.title}>History</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No memories yet{"\n"}try one of the three on the other side
          </Text>
          <Image source={BASIN_ASSET} style={styles.emptyBasin} contentFit="contain" />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row, index) =>
            row.kind === "header" ? `header-${row.label}-${index}` : row.entry.id
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) =>
            item.kind === "header" ? (
              <Text style={styles.dayHeader}>{item.label}</Text>
            ) : (
              <Pressable
                style={styles.entryShadow}
                onPress={() => router.push(`/entry/${item.entry.id}`)}
              >
                <ImageBackground
                  source={PARCHMENT_ASSET}
                  contentFit="fill"
                  style={styles.entryTexture}
                >
                  <View style={styles.entryContent}>
                    <Image
                      source={TYPE_ICON[item.entry.type]}
                      style={styles.entryIcon}
                      contentFit="contain"
                    />
                    <View style={styles.entryBody}>
                      {item.entry.question && (
                        <Text style={styles.entryQuestion} numberOfLines={1}>
                          &ldquo;{item.entry.question}&rdquo;
                        </Text>
                      )}
                      <Text style={styles.entryText} numberOfLines={2}>
                        {item.entry.text}
                      </Text>
                      <Text style={styles.entryDate}>
                        {new Date(item.entry.timestamp).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            )
          }
        />
      )}

      {entries.length > 0 && (
        <Pressable style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear History</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPECTRAL_NAVY,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: PENSIEVE_SILVER_BLUE,
    fontSize: 36,
    lineHeight: 36,
    fontFamily: "ClimateCrisis",
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  dayHeader: {
    color: PENSIEVE_SILVER_BLUE,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 6,
  },
  entryShadow: {
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  entryTexture: {
    borderRadius: 4,
    overflow: "hidden",
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  entryIcon: {
    width: 28,
    height: 28,
    marginLeft: 12,
  },
  entryBody: {
    flex: 1,
    marginRight: 12,
  },
  entryQuestion: {
    color: OLD_INK,
    opacity: 0.7,
    fontSize: 12,
    fontStyle: "italic",
    marginRight: 12,
    marginBottom: 2,
  },
  entryText: {
    color: OLD_INK,
    fontSize: 14,
    marginRight: 12
  },
  entryDate: {
    color: OLD_INK,
    opacity: 0.6,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 3,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
  },
  emptyBasin: {
    position: "absolute",
    bottom: 0,
    width: 260,
    height: 465,
  },
  emptyText: {
    color: PENSIEVE_SILVER_BLUE,
    fontFamily: "HomemadeApple",
    fontSize: 24,
    lineHeight: 40,
    textAlign: "center",
    paddingHorizontal: 30,
    marginTop: 60,
    marginBottom: 10,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: PENSIEVE_SILVER_BLUE,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  clearButtonText: {
    color: PENSIEVE_SILVER_BLUE,
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
