import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_LETTER_KEY = "lastLetter";

const QUOTES_URL = process.env.EXPO_PUBLIC_QUOTES_URL!;

type Quote = {
  id: string;
  quote: string;
  speaker: string;
  story: string;
  source: string;
};

export async function getLetterText(): Promise<string> {
  try {
    const res = await fetch(QUOTES_URL);
    const quotes: Quote[] = await res.json();
    const pick = quotes[Math.floor(Math.random() * quotes.length)];
    const text = `"${pick.quote}" — ${pick.speaker}`;
    await AsyncStorage.setItem(LAST_LETTER_KEY, text);
    return text;
  } catch {
    const cached = await AsyncStorage.getItem(LAST_LETTER_KEY);
    return cached ?? "The owl has not yet arrived. Try again later.";
  }
}
