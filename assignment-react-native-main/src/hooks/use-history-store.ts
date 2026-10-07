import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type FortuneType = "potion" | "hat" | "letter";

export type FortuneEntry = {
  id: string;
  type: FortuneType;
  text: string;
  question?: string;
  timestamp: number;
  favorite: boolean;
};

const HISTORY_KEY = "fortuneHistory";

async function persist(entries: FortuneEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // Storage write failed (e.g. device storage full). The in-memory
    // state already reflects the change, so the UI stays correct for
    // this session even though it won't survive a restart.
  }
}

interface HistoryState {
  entries: FortuneEntry[];
  error: string | null;
  isLoaded: boolean;
  addToHistory: (type: FortuneType, text: string, question?: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  entries: [],
  error: null,
  isLoaded: false,

  addToHistory: async (type, text, question) => {
    await historyLoaded;
    const entry: FortuneEntry = {
      id: String(Date.now()),
      type,
      text,
      question,
      timestamp: Date.now(),
      favorite: false,
    };
    const entries = [entry, ...get().entries];
    set({ entries });
    await persist(entries);
  },

  toggleFavorite: async (id) => {
    await historyLoaded;
    const entries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, favorite: !entry.favorite } : entry
    );
    set({ entries });
    await persist(entries);
  },

  clearHistory: async () => {
    await historyLoaded;
    set({ entries: [] });
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch {
      // If the remove fails, memory is already cleared for this session;
      // a future load may resurrect stale entries, which is an acceptable
      // degradation over crashing the screen.
    }
  },
}));

// Loaded once, as soon as the store is first imported — not by whichever
// screen happens to mount first. Every setter awaits this, so a fortune
// added before storage finished reading can't overwrite the saved history.
async function loadHistory(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    useHistoryStore.setState({ entries: raw ? JSON.parse(raw) : [], error: null, isLoaded: true });
  } catch {
    // Corrupted or unreadable storage — fall back to an empty history
    // instead of crashing the screen.
    useHistoryStore.setState({ entries: [], error: "Your history couldn't be loaded.", isLoaded: true });
  }
}

const historyLoaded = loadHistory();
