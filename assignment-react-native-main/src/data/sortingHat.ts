import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_READING_KEY = "lastSortingHatReading";

const CHARACTERS_URL = process.env.EXPO_PUBLIC_CHARACTERS_URL!;

type Character = {
  name: string;
  house: string;
  patronus: string;
};

const FALLBACK_READINGS = [
  "Gryffindor would suit you well.",
  "Slytherin runs in your veins.",
  "Ravenclaw sees your curiosity.",
  "Hufflepuff knows your loyalty.",
  "Adventure calls your name.",
  "A quiet greatness awaits you.",
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export async function getSortingHatReading(): Promise<string> {
  try {
    const res = await fetch(CHARACTERS_URL);
    const characters: Character[] = await res.json();
    const sorted = characters.filter((c) => c.house);
    const pick = pickRandom(sorted);

    const reading = pick.patronus
      ? `Like ${pick.name}, you belong in ${pick.house}. Your patronus would be a ${pick.patronus}.`
      : `Like ${pick.name}, you belong in ${pick.house}.`;

    await AsyncStorage.setItem(LAST_READING_KEY, reading);
    return reading;
  } catch {
    const cached = await AsyncStorage.getItem(LAST_READING_KEY);
    if (cached) return cached;
    return pickRandom(FALLBACK_READINGS);
  }
}
