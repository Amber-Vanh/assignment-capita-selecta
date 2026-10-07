const HISTORY_KEY = "fortuneHistory";

// Replaces zustand + AsyncStorage. A plain EventTarget is enough: components
// subscribe in connectedCallback and unsubscribe in disconnectedCallback.
class HistoryStore extends EventTarget {
  entries = [];
  isLoaded = false;

  constructor() {
    super();
    try {
      const raw = localStorage.getItem(HISTORY_KEY); // synchronous, so no `historyLoaded` promise needed
      this.entries = raw ? JSON.parse(raw) : [];
    } catch {
      this.entries = [];
    }
    this.isLoaded = true;
  }

  addToHistory(type, text, question) {
    const entry = {
      id: String(Date.now()),
      type,
      text,
      question,
      timestamp: Date.now(),
      favorite: false,
    };
    this.#set([entry, ...this.entries]);
  }

  clearHistory() {
    this.#set([]);
  }

  #set(entries) {
    this.entries = entries;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } catch {
      // storage full / blocked: memory is still correct for this session
    }
    this.dispatchEvent(new Event("change"));
  }
}

export const historyStore = new HistoryStore();
