# Questions & Answers

## What is `useCallback` and why is it used?

`useCallback` memoizes a function so React reuses the *same function reference* across re-renders, instead of creating a brand-new function every time the component renders.

**Why that matters:**

Every time a component re-renders, any function defined inside it is a new object in memory, even if the code inside is identical. Normally that's harmless. But it becomes a problem when:

1. **The function is a dependency of something else** (another hook, or a child component wrapped in `React.memo`). If the function reference changes every render, anything depending on it thinks "this changed" and re-runs/re-renders unnecessarily.
2. **You're passing callbacks into things that care about referential stability**, like `useEffect` dependency arrays, or gesture handlers and callbacks passed through Reanimated's `runOnJS`.

`useCallback(fn, deps)` says: "only create a new version of this function when one of `deps` changes; otherwise, give me back the same reference as last time."

**Example from `src/app/index.tsx`:**

- `enterPager` only needs to change if `router` changes, so it's memoized with `[router]` as the dependency.
- `beginEnter` and `cancelGlow` are passed to `runOnJS()` inside gesture callbacks (`onStart`, `onFinalize`). The gesture object built via `Gesture.LongPress()...` benefits from stable function references, avoiding unnecessary gesture config recreation on every render and stale-closure bugs where the handler captures an old version of the function.

Note: some usages disable `react-hooks/exhaustive-deps` to deliberately omit values (like `enterPager`, `glow`, `fadeOut`) from the dependency array — a manual override, not the default linter behavior.

## What is `// eslint-disable-next-line react-hooks/exhaustive-deps`?

This is an ESLint directive that suppresses a specific lint rule warning for the line right after it.

Breaking it down:
- `eslint-disable-next-line` tells ESLint to ignore the rule violation on the next line only (as opposed to disabling it for the whole file).
- `react-hooks/exhaustive-deps` is the specific rule being suppressed. This rule normally checks that every variable used inside a hook (`useEffect`, `useCallback`, `useMemo`, etc.) is listed in its dependency array.

**Why it's needed:** the `exhaustive-deps` rule wants every value referenced inside the callback listed as a dependency. Sometimes you deliberately want to exclude something, because:
- The value is a stable ref/shared value that doesn't actually need to trigger re-creation (common with Reanimated's `useSharedValue`, like `glow` and `fadeOut`).
- You intentionally only want the function to change when specific things change, not everything it touches.

In `src/app/index.tsx`, the linter would otherwise complain that `enterPager` (in `beginEnter`) or `glow`/`fadeOut` (in `cancelGlow`) are missing from the dependency arrays. The disable comment silences that specific warning.

**The risk:** overusing this can create stale closures, where the function keeps referencing an old value from a previous render because it wasn't in the deps array and never triggered a fresh version. It's a valid escape hatch, but should be used deliberately, not as a way to silence warnings you don't want to deal with.

## What is `useMemo` and why is it used?

`useMemo` memoizes a **computed value**, not a function — the counterpart to `useCallback`. It re-runs the calculation only when one of its dependencies changes, and otherwise returns the cached result from last time.

**Why that matters:**

Every render, any code in the component body re-runs. If you have an expensive computation — sorting, filtering, grouping, transforming a big array — recalculating it on *every* render (even when the underlying data hasn't changed) is wasted work. It can also cause problems if you pass a newly-created array/object into a child or a dependency array: referential inequality triggers unnecessary re-renders elsewhere.

`useMemo(fn, deps)` says: "only re-run `fn` and recompute the value when one of `deps` changes; otherwise, give me back the same result as last time."

**Example from `src/app/history.tsx`:**

```ts
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
```

This takes `entries` (the raw history list) and transforms it into a flat array of `Row` objects (headers + entries) suitable for `FlatList`. That transformation — grouping by day, then flattening into a single list with header rows interspersed — only needs to happen when `entries` actually changes. Without `useMemo`, this grouping/flattening logic would re-run on every render of `HistoryScreen`, even for unrelated state changes, and it would also produce a brand-new `rows` array reference each time, which `FlatList` would then treat as entirely new data.

## What is `useFocusEffect`?

`useFocusEffect` (from `expo-router`, re-exported from React Navigation) runs an effect every time the screen comes into focus — i.e. whenever the user navigates to it — rather than only once when the component first mounts, like `useEffect` does.

**Why that matters:**

With React Navigation/Expo Router, screens are typically kept mounted in the background when you navigate away from them (e.g. going from History back to the pager and back again). A plain `useEffect` with `[]` deps only runs on the very first mount, so if data changed elsewhere while the screen was unfocused, a normal `useEffect` won't pick that up when the user returns to the screen. `useFocusEffect` re-runs its callback on every focus event, so the screen can refresh its data each time it becomes visible again.

**Example from `src/app/history.tsx`:**

```ts
const loadHistory = useCallback(async () => {
  const history = await getHistory();
  setEntries(history);
}, []);

useFocusEffect(
  useCallback(() => {
    loadHistory();
  }, [loadHistory])
);
```

Here, every time the History screen gains focus (e.g. the user navigates back to it after adding a new fortune elsewhere), `loadHistory()` re-runs and refreshes `entries` from storage. Note the callback passed to `useFocusEffect` is itself wrapped in `useCallback` — this is a common pattern/requirement from React Navigation to avoid the effect re-running unnecessarily due to a new function reference on every render.

## What other complex patterns show up in this codebase?

### The JS thread vs. UI thread, and `runOnJS`

Reanimated animation callbacks (gesture handlers, scroll handlers, `useAnimatedStyle`) run as **worklets** on the UI thread, not the normal JS thread React runs on. That's what makes them fast — they don't have to hop across the bridge to update styles every frame. But it also means you *can't* call a normal function like a React state setter or an async API directly from inside one; the code looks synchronous but isn't running where you think.

```ts
// src/app/pager.tsx
onMomentumEnd: (event) => {
  const index = Math.round(event.contentOffset.x / width);
  if (index === STUB_START_INDEX) {
    scrollTo(scrollRef, REAL_LAST_INDEX * width, 0, false);
    runOnJS(updateActiveRealIndex)(REAL_LAST_INDEX);
  }
}
```

`runOnJS(fn)(...)` is the bridge back: it schedules `fn` to run on the JS thread instead. Anywhere you see a state setter (`setEntering`, `updateActiveRealIndex`) or an async call (`Haptics.impactAsync`) called from inside a gesture/scroll callback, it'll be wrapped in `runOnJS` for this reason — see `src/app/index.tsx` and `src/components/letter-page.tsx`.

Occasionally a plain helper function needs to run *on* the UI thread (e.g. inside `useAnimatedStyle`). For that, Reanimated needs the function marked explicitly:

```ts
// src/components/card-fan-indicator.tsx
function shortestSignedDistance(raw: number, count: number) {
  "worklet";
  // ...
}
```

The `"worklet"` string directive tells Reanimated's compiler to make this function callable from the UI thread — without it, calling this from `useDerivedValue`/`useAnimatedStyle` would fail.

### Faking an infinite scroll loop with "stub" pages

`src/app/pager.tsx` wants the card pager to feel like it loops forever. Instead of real infinite data, it pads the real pages with one duplicate "stub" page at each end (`STUB_START_INDEX` / `STUB_END_INDEX`). When the scroll's momentum lands on a stub, the code silently jumps back to the matching real page with no animation:

```ts
scrollTo(scrollRef, REAL_LAST_INDEX * width, 0, false); // false = no animation, so the jump is invisible
```

The user briefly sees the stub (which looks identical to the real page it's next to), then the scroll position is teleported back before they notice — creating the illusion of an endless loop. Note `scrollTo` here is Reanimated's own UI-thread function, not the standard `ScrollView.scrollTo` method.

### Gesture composition (`react-native-gesture-handler`)

Gestures are built once, outside JSX, using a fluent builder, then attached to a view via `<GestureDetector gesture={...}>`:

```ts
// src/app/index.tsx
const gesture = Gesture.LongPress()
  .minDuration(HOLD_DURATION_MS)
  .onBegin(() => { /* ... */ })
  .onStart(() => { /* ... */ })
  .onFinalize((_event, success) => { /* ... */ });
```

Each `.onX` handler is itself a worklet running on the UI thread (hence `runOnJS` again inside them). `onFinalize`'s second argument (`success`) tells you whether the gesture completed normally or was cancelled/interrupted — used here to only reset the "glow" animation if the long-press was released early, not if it succeeded.

### Expo Router navigation: `replace` vs `push`/`back`

- `router.push(...)` — navigates forward, keeping the current screen on the history stack so the user can go back to it.
- `router.replace(...)` — swaps out the current screen entirely; the user can't navigate back to it.
- `router.back()` — pops the stack, returning to the previous screen.

`src/app/index.tsx` uses `router.replace("/pager")` after the candle-lighting intro animation finishes, specifically so the user can't accidentally swipe/press back into the intro screen once they've entered the app.

### AsyncStorage as a simple persistence layer

`src/data/history.ts` stores the whole fortune history as a single JSON blob under one AsyncStorage key. Every write reads the full list, mutates it in memory, and writes the entire thing back:

```ts
export async function addToHistory(type, text) {
  const history = await getHistory();
  history.unshift({ id: String(Date.now()), type, text, timestamp: Date.now(), favorite: false });
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
```

This is simple and fine for a small local list, but worth noting it's O(n) per write (rewrites everything every time) and isn't safe if multiple writes could happen concurrently — there's no locking, so two overlapping writes could clobber each other.

### Discriminated union for a mixed-type list (`history.tsx`)

To render headers and entries in one `FlatList` (instead of using `SectionList`), the code flattens grouped data into a single array typed as a discriminated union:

```ts
type Row = { kind: "header"; label: string } | { kind: "entry"; entry: FortuneEntry };
```

Because every `Row` has a `kind` field with a distinct literal value, TypeScript can narrow the type inside `renderItem` just by checking `item.kind` — no type casting needed to safely access `item.label` vs `item.entry`.

### Capturing a view as an image to share it

`src/components/share-button.tsx` turns a live, on-screen native view into a shareable PNG:

```ts
const uri = await captureRef(target, { quality: 1, format: "png", result: "tmpfile" });
if (await Sharing.isAvailableAsync()) {
  await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share this fortune" });
}
```

`captureRef` (from `react-native-view-shot`) rasterizes whatever view the passed ref points to into an actual PNG file, then `expo-sharing` opens the OS's native share sheet with that file. One easy-to-miss detail: the view being captured needs `collapsable={false}` in its style/props — React Native can otherwise "flatten" (optimize away) native views that aren't needed for layout, which silently breaks capture since there's no longer a real native view to screenshot.

## Why use `FlatList` instead of `FlashList`?

FlashList isn't installed in this project, so it's less "chosen over" FlashList and more that `FlatList` (React Native's built-in list component) was simply what was needed.

**`FlatList`** ships with React Native — no extra dependency, well-documented, and "good enough" for most lists. Its main weakness is performance on very large or complex lists: it recycles/renders views less efficiently, which can show up as jank on long lists with heavy items.

**`FlashList`** (from Shopify) is a drop-in-ish replacement that reuses view instances more aggressively (closer to how native recycler views work), giving much better performance on long lists or complex item layouts. The tradeoffs: it's an extra native dependency (needs config in Expo), needs an `estimatedItemSize` prop to perform well, and has a few more edge cases around dynamic item heights.

For `src/app/history.tsx`, the list is a personal fortune history — realistically dozens to low hundreds of entries, not thousands. `FlatList` handles that scale fine, so adding `FlashList` would be extra dependency weight without a real benefit here. If the list were expected to grow very large or items were expensive to render, `FlashList` would be the better call.

**Is it necessary to switch, given the user never clears their history and uses the app at least once a day?**

Even at that usage pattern, the math stays small: once a day for a year is ~365 entries, and several years of daily use without ever clearing lands in the low thousands at most. That's still solidly within `FlatList`'s comfort zone — its performance really starts to suffer at the point of thousands of items *combined with* non-trivial row layouts (images, complex nested views) or very frequent re-renders. History rows here are simple text (a header label or one entry), so there's no expensive rendering work per row to begin with.

So no, switching isn't necessary. The realistic long-term data volume doesn't reach the scale where `FlashList`'s view-recycling advantage would be noticeable to the user — it would just add a native dependency and config overhead to solve a performance problem that wouldn't actually occur in practice. It would be worth reconsidering only if entries became more expensive to render (e.g. an image per entry) or usage expectations grew far beyond "once a day."

## Why is it `.env.example` and not just `.env`?

Both files exist and serve different purposes:

- **`.env`** — the actual file the app reads at build/runtime. It's gitignored, so it's never committed to the repo. This matters when a file holds real secrets (API keys, tokens): you don't want those sitting in git history where anyone with repo access (or anyone at all, on a public repo) can see them.
- **`.env.example`** — a checked-in template showing what variables the app expects, without necessarily containing real/sensitive values. Anyone who clones the repo copies this to `.env` and fills in their own values, so the project stays runnable for new contributors without them having to guess what env vars exist.

In this project specifically, both files happen to contain the *same* values, because the two URLs they hold (`hp-api.onrender.com` and the GitHub raw quotes file) are public, unauthenticated APIs — there's no secret being protected. So `.env.example` isn't hiding anything here; it's just documenting "these are the env vars this project needs" for anyone who clones it, while `.env` remains the one Expo actually loads and stays out of git as a matter of convention.

If these URLs ever needed an API key or became something not meant to be public, that's exactly when the split matters: the real key goes only in `.env` (never committed), and `.env.example` shows just the variable name with a placeholder, e.g. `EXPO_PUBLIC_API_KEY=your_key_here`.

**Would it be an issue to just commit `.env` directly instead of keeping `.env.example`?**

Not a technical issue — Expo only reads `.env` (and variants like `.env.local`); it has no idea `.env.example` exists, so removing it wouldn't break the app.

The issue is what you lose: `.env` is gitignored, so it never gets committed. Without `.env.example`, there's no record in the repo of which env vars the app needs. Anyone who clones the project (a teammate, your future self on a new machine, a grader) gets an app that silently fails — `process.env.EXPO_PUBLIC_CHARACTERS_URL` comes back `undefined`, and nothing in the repo explains what's missing or what to create.

In this project specifically, since both URLs are public and non-secret, you could get away with committing `.env` directly and skipping the split entirely — nothing bad would happen. But that only works because there's no actual secret involved. The moment something like an API key gets added that shouldn't be public, committing `.env` directly would leak it into git history permanently (deleting it later doesn't remove it from past commits). Keeping the `.env` / `.env.example` split now means you don't have to remember to change habits later if a real secret gets introduced.

## Central data store using Zustand

`src/hooks/use-history-store.ts` holds the fortune history (the list shown on the History screen) in a single **Zustand store**, instead of every screen managing its own local `useState` and re-fetching from `AsyncStorage` independently.

**What Zustand actually is:** a small state-management library. `create<State>()((set, get) => ({...}))` defines one object containing both the state fields and the functions ("actions") that update them. Calling the resulting hook (`useHistoryStore`) from any component subscribes that component to the store — when the state changes, only the components that read the changed piece of state re-render.

```ts
interface HistoryState {
  entries: FortuneEntry[];
  loadHistory: () => Promise<void>;
  addToHistory: (type: FortuneType, text: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  entries: [],

  addToHistory: async (type, text) => {
    const entry: FortuneEntry = { id: String(Date.now()), type, text, timestamp: Date.now(), favorite: false };
    const entries = [entry, ...get().entries];
    set({ entries });        // update in-memory state immediately
    await persist(entries);  // then write it to AsyncStorage
  },
  // ...
}));
```

- `set(partial)` merges the given fields into the store's state and notifies every subscribed component.
- `get()` reads the current state from inside an action, without needing to subscribe to it (used here to read `entries` before updating it).
- Persistence to `AsyncStorage` still happens exactly like before — the store isn't a replacement for storage, it's a replacement for passing state and reload-callbacks around manually. `AsyncStorage` remains the source of truth on disk; the store is the in-memory cache the UI actually reads from.

**Reading from the store in a component** uses a *selector* — a function that picks out just the slice of state that component cares about:

```ts
const entries = useHistoryStore((state) => state.entries);
const addToHistory = useHistoryStore((state) => state.addToHistory);
```

This selector pattern is why Zustand tends to cause fewer unnecessary re-renders than throwing everything in React Context: a component that only selects `entries` doesn't re-render when some unrelated piece of store state changes, because each `useHistoryStore(selector)` call subscribes independently to just that slice.

**Why this replaced the old approach:** previously, `src/app/history.tsx` called `getHistory()` inside `useFocusEffect` every time the screen gained focus, and `src/components/potion-page.tsx`, `sorting-hat-page.tsx`, and `letter-page.tsx` each called `addToHistory()` directly, with no way to tell the History screen "hey, new data is available" other than re-fetching on focus. Now, any component calling `useHistoryStore((s) => s.addToHistory)` updates the shared `entries` state immediately, and any other component subscribed to `entries` (like the History screen) re-renders with the new data automatically — no manual refetch/focus-effect coordination required between unrelated screens. `history.tsx` still calls `loadHistory()` in a `useFocusEffect` on mount/focus purely to do the initial read from `AsyncStorage` into the store; after that, updates flow through the store reactively.

## Typing a question on the Potion of Truth page

`src/components/potion-page.tsx` has a `TextInput` where you can type your yes-or-no question before shaking the phone. It's stored alongside the potion's Yes/No answer and shown as text everywhere the answer is shown — the potion page itself, the History list, the entry detail screen, and inside the shared screenshot.

**Why typing, not speech-to-text:** the first version of this feature used `expo-speech-recognition` to transcribe a spoken question live. That library has native (Swift/Kotlin) code, and this project runs in **Expo Go** — a single prebuilt app from the App Store/Play Store containing only the native modules Expo's team compiled into it ahead of time. A third-party native module like `expo-speech-recognition` was never compiled into that binary, so it fails with `Cannot find native module 'ExpoSpeechRecognition'` — no config or permission fixes that; it would require switching to a custom **development build** (`npx expo prebuild` + `npx expo run:ios`/`run:android`, or an EAS cloud build) instead of Expo Go. Since staying on Expo Go mattered more here, the feature was reworked to use a plain `TextInput` instead — pure JS/React Native, no native module, works everywhere Expo Go does.

```tsx
const [question, setQuestion] = useState("");

<TextInput
  placeholder="Ask a yes-or-no question..."
  value={question}
  onChangeText={setQuestion}
  editable={!isSwirling}
/>
```

Typing the question is optional — you can still shake without typing anything, same as before this feature existed. When a result comes back, `addToHistory("potion", answerText, question.trim() || undefined)` stores the question only if one was actually typed (empty string becomes `undefined`, so it doesn't show up as a blank quote everywhere).

**Where it's shown:** the typed question renders inside `captureArea` (the view that gets rasterized for sharing) as italic text near the vial, but the `TextInput` itself is rendered *outside* `captureArea` and hidden once a result exists — so the screenshot shows the question as static text, not an editable text box.

## Why don't `letter.ts` and `sortingHat.ts` use Zustand too?

`src/data/letter.ts` and `src/data/sortingHat.ts` are single, one-shot async functions (`getLetterText()`, `getSortingHatReading()`), each called from exactly one place (`letter-page.tsx`, `sorting-hat-page.tsx` respectively) at the moment the user triggers that page's interaction. They fetch from an API, fall back to a cached `AsyncStorage` value on failure, and return a string — called, awaited, used immediately, done.

**The distinction that decides when to reach for a store:** `use-history-store.ts` needed Zustand because it's *shared UI state read by multiple screens* — the History list, the entry detail screen, and all three fortune pages all need to read and react to the same `entries` array. When one screen adds an entry, the History screen needs to reflect that change without a manual refetch. That's a cross-component state-sharing problem, which is exactly what a store solves.

`letter.ts`/`sortingHat.ts` have no such problem: nothing else in the app needs to read "the current sorting hat reading" as shared, reactive state. The `AsyncStorage` write in each (`lastLetter`, `lastSortingHatReading`) isn't state in the React sense either — it's a fallback cache for the offline-retry path only, read once, synchronously, inside the same function that wrote it.

Rule of thumb: reach for a store when **multiple components need to read and react to the same changing data**. A single async helper called from one place, with no cross-component subscribers, doesn't need one — wrapping it in a store would just add indirection without solving any actual problem.

## Does this project follow the course conventions?

The course reference material lives at [devinekask/creative-development-f26 (react-native folder)](https://github.com/devinekask/creative-development-f26/tree/main/react-native), which walks through building a "plant-based-barista" app. Checked against that:

**Zustand — matches exactly.** The course README has its own "Central data store using Zustand" section, teaching: `npm install zustand`, create `src/hooks/use-order-store.ts`, define a state interface, then `create<State>()((set) => ({...}))` with action methods that call `set`. `src/hooks/use-history-store.ts` in this project uses that identical shape — same pattern, just for fortune history instead of coffee orders.

**`.env` / `EXPO_PUBLIC_*` — a deviation, but a reasonable one.** The course's reference project never fetches from an external API — its data (`coffees.ts`) is static and bundled locally with `require()`, so the course material never needed environment variables and doesn't demonstrate them anywhere. This app fetches from two live third-party APIs (`hp-api.onrender.com`, a GitHub-hosted quotes JSON file), which the course's own example never had to handle. Moving those URLs into `.env`/`EXPO_PUBLIC_*` isn't copied from the course — it's Expo's own documented convention for exposing env vars to a client bundle (see the `.env.example` Q&A above). Worth knowing if asked about it directly: this pattern comes from Expo's docs, not the course reference repo, because the course's static-data example simply never encountered this problem.

**Expo Router (`useLocalSearchParams`, dynamic `[id].tsx` routes) — matches.** The course teaches exactly this pattern for its own dynamic detail screen (`const { id } = useLocalSearchParams(); const coffee = coffees.find(...)`). `src/app/entry/[id].tsx` follows the same shape, with a typed generic (`useLocalSearchParams<{ id: string }>()`) — a small improvement over the course's own untyped example, which even has a type error at that exact line.

**Folder structure — matches exactly**, including the `use-<domain>-store.ts` naming convention for store files: `src/app` (routes), `src/components`, `src/data` (plain typed data modules), `src/hooks` (Zustand stores), `src/constants`.

**TypeScript/ESLint config — matches.** Strict mode via `expo/tsconfig.base`, `@/*` path aliases, and the default `eslint-config-expo` flat config, unmodified — same as what the course scaffolds.

**Bottom line:** everything lines up with the course's demonstrated conventions except the `.env` setup, and that's not a mistake — it's a necessary extension because this app does something (live API fetching) the course's own example never needed to do.

## Error handling: what was missing and what got fixed

A review pass found four spots where an async call could fail (or throw) with nothing catching it — meaning either a crash with no recovery, or a silent no-op with no feedback to the user. Each is explained below.

### 1. `use-history-store.ts` had no error handling at all

`loadHistory`, `persist` (used by `addToHistory`/`toggleFavorite`), and `clearHistory` all touch `AsyncStorage` and/or `JSON.parse`, and none of them were wrapped in a `try`/`catch`.

- `JSON.parse(raw)` in `loadHistory` throws on any corrupted or malformed stored value — a single bad write (e.g. an interrupted save) would crash the History screen every time it loaded, with no way to recover short of clearing app storage manually.
- `AsyncStorage.setItem`/`removeItem` can reject (storage full, native module error). Since nothing awaited these with a `.catch`, a failure became an **unhandled promise rejection** — invisible to the user, and in stricter runtimes, potentially fatal.

**The fix:** each function now wraps its `AsyncStorage`/`JSON.parse` work in `try`/`catch`:

```ts
loadHistory: async () => {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    set({ entries: raw ? JSON.parse(raw) : [], error: null });
  } catch {
    set({ entries: [], error: "Your history couldn't be loaded." });
  }
},
```

On failure, `loadHistory` now falls back to an empty list instead of crashing, and sets a new `error` field on the store (available for a screen to read and show a message, if you want to surface it in the UI later). `persist` and `clearHistory` fail silently on write errors — the in-memory state is already correct for the current session, so the user isn't blocked; the only cost is that the change won't survive a restart if the write truly failed.

### 2. `share-button.tsx`'s `handleShare` had no error handling

```ts
const handleShare = useCallback(async () => {
  if (!target.current) return;
  const uri = await captureRef(target, { quality: 1, format: "png", result: "tmpfile" });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share this fortune" });
  }
}, [target]);
```

This was passed straight to `<Pressable onPress={handleShare}>`. `Pressable` doesn't await or catch async handlers — it just calls the function and ignores the returned promise. So if `captureRef` threw (e.g. the view hadn't finished laying out yet) or `Sharing.shareAsync` rejected, that became another unhandled promise rejection, and the user would tap "Share this fortune" and see... nothing happen, with no explanation.

**The fix:** wrapped the body in `try`/`catch`, and added an explicit branch for the "sharing isn't available on this device" case, both now surfaced via `Alert`:

```ts
try {
  const uri = await captureRef(target, { quality: 1, format: "png", result: "tmpfile" });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share this fortune" });
  } else {
    Alert.alert("Sharing isn't available", "This device can't open the share sheet.");
  }
} catch {
  Alert.alert("Couldn't share", "Something went wrong while preparing your fortune.");
}
```

### 3. No top-level error boundary

Nothing in the app caught render-time errors. If any component threw while rendering — say, a corrupted history entry produced a value that broke a child component's render — the entire app would crash to a red screen with no recovery path, since Expo Router doesn't provide this for free.

**The fix:** added `src/components/error-boundary.tsx`, a small class component (error boundaries have to be classes — there's no hook equivalent for `componentDidCatch`/`getDerivedStateFromError`):

```tsx
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <View style={styles.container}><Text style={styles.text}>Something went wrong.{"\n"}Please restart the app.</Text></View>;
    }
    return this.props.children;
  }
}
```

It's wrapped around the whole app in `src/app/_layout.tsx`:

```tsx
<ErrorBoundary>
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack>{/* ... */}</Stack>
  </GestureHandlerRootView>
</ErrorBoundary>
```

**Important limitation:** an error boundary only catches errors thrown *during render*. It does **not** catch errors in event handlers, `async` functions, or `setTimeout` callbacks — that's exactly why fixes #1, #2, and #4 each needed their own `try`/`catch` rather than relying on this boundary to catch everything. Think of it as the last line of defense for render bugs specifically, not a general-purpose safety net.

### 4. `sorting-hat-page.tsx`'s biometric auth chain had no error handling

```ts
const hasHardware = await LocalAuthentication.hasHardwareAsync();
if (!hasHardware) { setStatusMessage("..."); return; }

const isEnrolled = await LocalAuthentication.isEnrolledAsync();
if (!isEnrolled) { setStatusMessage("..."); return; }

const auth = await LocalAuthentication.authenticateAsync({ promptMessage: "..." });
if (!auth.success) { setStatusMessage("..."); return; }
```

This handles the *expected* failure paths well (no sensor, nothing enrolled, auth rejected all resolve normally with `false`/`success: false`). What it didn't handle is these native calls actually **throwing** instead of resolving — which is a known behavior on some Android OEM skins where the biometric native module errors out rather than returning a clean result.

**The fix:** wrapped the whole chain in `try`/`catch` with a generic fallback message:

```ts
try {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) { setStatusMessage("This device has no fingerprint or Face ID sensor."); return; }
  // ...
} catch {
  setStatusMessage("Something went wrong. Try again.");
  return;
}
```

Same `setStatusMessage` pattern already used for the expected failure cases, so the user always ends up with a visible message instead of the "press the hat, nothing happens" experience a silent throw would otherwise produce.

### What's still (deliberately) unguarded

The `setTimeout` callback in `beginReading` (`sorting-hat-page.tsx`) that calls `getSortingHatReading()` and `addToHistory()` after the reveal delay isn't wrapped in its own `try`/`catch`. This was left as-is because both of those functions already have their own internal fallbacks (`getSortingHatReading` falls back to a cached/random reading; `addToHistory`'s `persist` now fails silently per fix #1), so there's no remaining failure mode inside that callback that would throw uncaught.

## Removing unnecessary `useEffect`s

Feedback received: *"Avoid useEffects where possible. If the inside of a useEffect only manages state / data changes based upon other data changes, look into moving that logic directly into the data-setters of your store or in the event handlers that changed the initial data."*

A `useEffect` runs **after** React has rendered. An effect that only says "when X changes, set Y" makes React render twice (once with the old Y, then again with the new one), and it splits one cause (the user swiped away) from its result (the page resets). The rule of thumb from React's docs (*You Might Not Need an Effect*):

- **Effects are for syncing with things outside React**: sensors, keyboard events, timers, the native splash screen, audio, speech.
- **State that changes because of other data belongs where that data changed**: in the event handler, or in the store's setter.

**What was removed:**

- `entry/[id].tsx`: a `useEffect` that called `loadHistory()` on mount, plus the `useFocusEffect` in `history.tsx` that did the same. Loading now happens once, inside the store itself.
- The "reset when `isActive` becomes false" effect in `potion-page.tsx`, `sorting-hat-page.tsx` and `letter-page.tsx`. The reset now happens in the pager's swipe handler, by giving the page a new `key`.

**What stayed, and why:** every remaining effect talks to something outside React. That covers hiding the splash screen (`_layout.tsx`), the keyboard and accelerometer listeners (`potion-page.tsx`), the three idle animations (timers and UI-thread animations), and a cleanup-only effect on each page that cancels pending timers and speech when the page unmounts.

### Step 1: the history store loads itself

```ts
// bottom of use-history-store.ts
const historyLoaded = loadHistory();

addToHistory: async (type, text, question) => {
  await historyLoaded;
  const entries = [entry, ...get().entries];
  // ...
```

**Q: Before this change, what happened to your saved history if you opened the app and did a potion reading without ever visiting the History screen? Why?**

The history was only loaded when the History or Entry screen opened, so on a fresh app start `entries` in memory was still `[]`. `addToHistory` then built `[newEntry, ...[]]`, a list with one item, and `persist()` wrote that list to AsyncStorage, **replacing** everything saved before. Opening History afterwards loaded storage correctly, but by then storage only held that one fortune.

**Q: `loadHistory()` is called at the bottom of the store file, not in a `useEffect` in `_layout.tsx`. What's the advantage?**

- No screen has to remember to load the data. It doesn't matter which screen opens first: the pager, History, or a link straight to `entry/[id]`.
- The setters have a promise to wait for (`await historyLoaded`), so a fortune added before loading finished can't overwrite the saved history. A `useEffect` in `_layout.tsx` only runs *after* the first render, and it gives the setters nothing to `await`.
- Logic about data lives in the store, which is exactly what the feedback asked for.

**Q: Why could the `useFocusEffect` in `history.tsx` be removed without the list going out of date?**

Every change to the history (`addToHistory`, `toggleFavorite`, `clearHistory`) goes through the store. The Zustand store is one shared object in memory, and `set(...)` makes every component that reads `entries` re-render automatically. Reading storage again each time the screen came into focus gave you nothing new.

### Step 2: resetting a page with `key` from the swipe handler

```tsx
const [pageState, setPageState] = useState({ activeRealIndex: 0, resetKeys: [0, 0, 0] });

// in updateActiveRealIndex (called from onMomentumEnd):
setPageState((prev) => {
  if (prev.activeRealIndex === realIndex) return prev;
  return {
    activeRealIndex: realIndex,
    resetKeys: prev.resetKeys.map((key, i) => (i === prev.activeRealIndex ? key + 1 : key)),
  };
});

<PotionPage key={resetKeys[0]} isActive={activeRealIndex === 0} />
```

React uses `key` to decide whether a component is *the same one as last render*. If the key is the same, it keeps its state. If the key is new, React throws the old component away and mounts a fresh one, so every `useState` starts from its initial value again.

**Q: You're on Potion, swipe to the Hat, then back to Potion. Which `resetKeys` counters changed, and why is Potion empty again?**

Both went up once. The first swipe bumped Potion's counter (the page you left), and the swipe back bumped the Hat's. Potion is empty because its new `key` made React mount a fresh copy.

**Q: What would go wrong with `key={activeRealIndex}` on all three pages instead of a separate counter per page?**

Every swipe would change the key of *all three* pages, so all of them would remount each time. That includes the page you're arriving on (flicker, images reloading) and pages you never touched. A separate counter per page means only the page you left gets reset.

**Q: Why is `activeRealIndex` combined with `resetKeys` in one state object?**

The new counters depend on the *old* active page. With a functional update (`prev => ...`), the handler always reads the latest value and needs no dependencies. That matters because it's passed through `runOnJS` from a Reanimated worklet, which could otherwise hold on to an outdated copy.

### Step 3: a cleanup-only effect instead of a reset effect

```ts
useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }
  };
}, []);
```

**Q: Why was it dangerous to test after step 2, before step 3?**

A page that gets thrown away still has timers and sound running outside React, and React can't stop those. The potion reveal timer would still fire and call `addToHistory`, so a "ghost" fortune would appear in History, and the Hat could keep talking. The cleanup that stops them on unmount was still missing.

**Q: Why is a cleanup-only effect fine when the reset effect wasn't?**

The reset effect changed *React state* in response to a prop, which is the pattern the feedback is about. The cleanup only stops *things outside React* (timers, speech). Effects exist for that kind of work.

**Q: Why does `isMountedRef` start as `false` and get set to `true` inside the effect?**

In development, React mounts, unmounts and mounts components again on purpose, to catch bugs. If the effect didn't set the ref back to `true`, it would stay `false` after that fake unmount.

**Q: Why check `isMountedRef` *after* an `await`, not before?**

Before the `await` you know the page is still there. The swipe can only happen *during* the wait. `getLetterText()` and `getSortingHatReading()` both `fetch` over the network, so that wait can take seconds.

**Q: Why doesn't the cleanup call `player.pause()`?**

The Expo docs say `useAudioPlayer` "creates an `AudioPlayer` instance that automatically releases when the component unmounts", and calling native methods on a released shared object throws an error. The cleanup only cancels the timers that would otherwise call the player later.

## Shaking on the History screen saved a hidden potion fortune

Testing the `useEffect` changes on the emulator turned up a bug that already existed: shaking the phone while on the History screen saved a Potion of Truth fortune you never got to see.

The fix in `pager.tsx`:

```tsx
import { useIsFocused } from "expo-router";

const isFocused = useIsFocused();

<PotionPage key={resetKeys[0]} isActive={isFocused && activeRealIndex === 0} />
```

`useIsFocused()` returns `true` while the pager is the screen you're looking at, and `false` once another screen (History, or a single fortune) is pushed on top. When it changes, the pager re-renders automatically. A page now only counts as active when it's the selected page **and** the pager is visible. The pages already switch off the accelerometer, gestures and idle animations when `isActive` is false, so nothing inside them had to change.

**Q: Why did the Potion keep listening on the History screen, even though you couldn't see it?**

When you navigate to History with Expo Router's `Stack`, History is pushed **on top of** the pager. The pager isn't unmounted, it just sits underneath, so every component in it (including the Potion page) stays alive. `isActive` only looked at `activeRealIndex`, and that still pointed at the Potion, so the page thought it was active. Its accelerometer listener stayed subscribed, and a shake started a reading that got saved to history off-screen.

**Q: Why doesn't opening History reset the Potion's answer, while swiping to another page does?**

A page is only reset when its `key` changes, and the key is only bumped in the pager's swipe handler (`updateActiveRealIndex`). Opening History doesn't go through that handler. Only `isFocused` changes, which turns `isActive` false but leaves the key the same. React keeps the same component with the same state, so your answer is still there when you come back. That's on purpose: going to History and back feels like "looking away", not like starting over.

**Q: Why is `isFocused && activeRealIndex === 0` directly in the JSX better than a `useEffect` that sets an `isPagerVisible` state when focus changes?**

`isActive` can be **calculated during render** from values React already has, so there's no reason to store it in extra state. An effect would run *after* the render: React would first render with the old, wrong value (the Potion still active), and then render a second time after the effect set the new state. That's one wasted render and a short moment where the value is out of date. Calculating it directly means it's always correct, with less code, which is the same idea as the feedback: *"If the inside of a useEffect only manages state based upon other data changes, move that logic somewhere else."*

## Putting the app on an Android phone (local builds, no EAS)

Everything is built on this Mac with Gradle. No EAS and no Expo account are involved.

1. **Install the dev client:** `npx expo install expo-dev-client`. This adds the launcher screen and dev menu that turn a normal debug build into a *development build*.
2. **Regenerate the native project:** `npx expo prebuild --clean --platform android`. `android/` is gitignored because Expo generates it from `app.json` (Continuous Native Generation). `--clean` deletes it and creates it again, so the new native module (`expo-dev-client`) gets linked in.
3. **Build both APKs:** in `android/`, run `./gradlew app:assembleDebug app:assembleRelease`.
   - `android/app/build/outputs/apk/debug/app-debug.apk`: the **development build**. It loads JavaScript from Metro (`npx expo start`), so fast refresh works, but the laptop has to be running.
   - `android/app/build/outputs/apk/release/app-release.apk`: the **standalone build**. The JavaScript bundle is embedded in the APK, so it runs without a laptop.
4. **Install on the phone:** turn on *Developer options → USB debugging*, plug the phone in, then run `adb install -r <path-to-apk>`. Shortcut: `npx expo run:android --device` (dev build) or `npx expo run:android --device --variant release` (standalone) builds and installs in one command.

**Q: What's the difference between Expo Go, a development build and a release build?**

Expo Go is one app made by Expo, with a fixed set of native modules built in. Your project is just JavaScript that Expo Go loads. A development build is *your own* native app, with your name, icon, package ID and exactly the native modules you use, plus the dev client so it can still load JS from Metro with fast refresh. A release build is also your own app, but the JS is bundled and minified inside the APK and there's no dev menu, so it works anywhere without Metro running.

**Q: Why can the release APK be installed without creating a signing key?**

Android refuses to install an APK that isn't signed. The `android/app/build.gradle` generated by prebuild signs the `release` build type with `signingConfigs.debug`, the public `debug.keystore` (password `android`). That's fine for sideloading onto your own phone, but the Play Store would reject it. For the store you'd create an upload key with `keytool`, add it to the signing config and run `./gradlew app:bundleRelease` to get an `.aab`.

**Q: When do I have to rebuild the APK, and when is a JS change enough?**

With the development build, you only rebuild when *native* things change: adding or updating a library with native code, editing `app.json` (permissions, icon, plugins), or upgrading the Expo SDK. For those, run `npx expo prebuild --clean` again and rebuild. Any change to `.tsx`/`.ts` files is picked up by Metro instantly. The release APK is different: its JS is frozen inside the APK, so *every* change, even JS-only, needs a new `assembleRelease` and a reinstall.

## Building only for `arm64-v8a`

By default, a React Native Android build compiles its C++ code four times, once for each CPU type (ABI):

| ABI | Used by |
|---|---|
| `arm64-v8a` | Almost every Android phone since about 2017 (including my OnePlus), and the Android emulator on Apple Silicon Macs |
| `armeabi-v7a` | Old or very cheap 32-bit phones |
| `x86_64` | Emulators on Intel/AMD computers, some Chromebooks |
| `x86` | Old emulators, practically dead |

I only need `arm64-v8a`, so I set it through the `expo-build-properties` config plugin in `app.json`:

```json
[
  "expo-build-properties",
  {
    "android": {
      "buildArchs": ["arm64-v8a"]
    }
  }
]
```

After `npx expo prebuild --clean`, the generated `android/gradle.properties` contains `reactNativeArchitectures=arm64-v8a`, and Gradle skips the other three.

**Q: Why put this in `app.json` instead of editing `android/gradle.properties` directly?**

`android/` is gitignored and generated by `npx expo prebuild` (Continuous Native Generation). A hand edit there gets wiped the next time I run `prebuild --clean`, and nobody cloning the repo would get it. A config plugin in `app.json` is the source of truth: prebuild reads it and writes the right line into `gradle.properties` every time.

**Q: What would happen if I installed this APK on a phone with a different CPU type?**

It would install, but it would crash on launch with an `UnsatisfiedLinkError`, because the phone would look for native libraries in `lib/armeabi-v7a/` (for example) and find nothing. That's fine for a personal sideloaded app. For a Play Store release you'd upload an `.aab` with all ABIs, and Google Play sends each phone only the one it needs.

**Q: Why can the debug and release APKs not be on the phone at the same time?**

Android identifies an app by its package ID, and both builds use `com.ambervanh.assignmentreactnative`. Installing one replaces the other. To switch, run `adb install -r` with the other APK. To have both at once you'd need a separate package ID for debug (for example with an `applicationIdSuffix ".dev"`), which I didn't set up.

## Day-to-day workflow: development build vs. standalone app

Only one of the two can be installed at a time, because they share the package ID `com.ambervanh.assignmentreactnative`. To install either one, the phone has to be plugged in with USB mode set to **Bestandsoverdracht** (not USB-tethering), and USB debugging has to be on.

**While coding (fast refresh):**

```bash
npx expo run:android --device   # first time only: builds + installs the dev build
npx expo start                  # after that: just this
```

Open the app on the phone. Every save shows up instantly. The laptop has to be running Metro for this.

**When I want the standalone version back:**

```bash
npx expo run:android --device --variant release
```

The JavaScript is baked into this version, so **every change needs this command again** before it shows up in the standalone app.

**When I add a library with native code or change `app.json`:** run `npx expo prebuild --clean` first, then one of the commands above.
