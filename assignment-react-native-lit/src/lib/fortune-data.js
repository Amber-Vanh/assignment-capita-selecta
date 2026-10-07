// Ports of data/sortingHat.ts and data/letter.ts: fetch -> cache -> fallback.
// AsyncStorage -> localStorage. EXPO_PUBLIC_* env vars -> plain constants (or import.meta.env.VITE_*).
const CHARACTERS_URL = "https://hp-api.onrender.com/api/characters";
const QUOTES_URL = "https://raw.githubusercontent.com/SyntaxOutlaw/HarryPotterAPI/main/app/data/quotes.json";

const FALLBACK_READINGS = [
  "Gryffindor would suit you well.",
  "Slytherin runs in your veins.",
  "Ravenclaw sees your curiosity.",
  "Hufflepuff knows your loyalty.",
  "Adventure calls your name.",
  "A quiet greatness awaits you.",
];

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

export async function getSortingHatReading() {
  try {
    const res = await fetch(CHARACTERS_URL);
    const characters = await res.json();
    const pick = pickRandom(characters.filter((c) => c.house));
    const reading = pick.patronus
      ? `Like ${pick.name}, you belong in ${pick.house}. Your patronus would be a ${pick.patronus}.`
      : `Like ${pick.name}, you belong in ${pick.house}.`;
    localStorage.setItem("lastSortingHatReading", reading);
    return reading;
  } catch {
    return localStorage.getItem("lastSortingHatReading") ?? pickRandom(FALLBACK_READINGS);
  }
}

export async function getLetterText() {
  try {
    const res = await fetch(QUOTES_URL);
    const quotes = await res.json();
    const pick = pickRandom(quotes);
    const text = `"${pick.quote}" — ${pick.speaker}`;
    localStorage.setItem("lastLetter", text);
    return text;
  } catch {
    return localStorage.getItem("lastLetter") ?? "The owl has not yet arrived. Try again later.";
  }
}
