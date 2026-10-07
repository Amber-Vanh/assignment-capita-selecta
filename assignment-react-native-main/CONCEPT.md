# Fortune Teller — Wizarding Edition

A candlelit start screen leads into a looping, three-page Expo (React Native) app where each page answers a question through a different magical object, a different gesture, and a different Expo SDK feature — plus a Pensieve screen (called "History" in the UI) that keeps a record of every fortune told, lets you revisit any past one, and share it.

## Requirements covered

- **Expo SDK components:** `expo-sensors` (Accelerometer), `expo-local-authentication`, `expo-haptics`, `expo-speech`, `expo-audio`, `expo-font`, `expo-sharing`, `react-native-reanimated`'s native-thread animation
- **Third-party libraries:** `react-native-gesture-handler`, `react-native-reanimated`, `@react-native-async-storage/async-storage`, `react-native-view-shot`
- **Native-only features:** shake detection, fingerprint/biometric authentication, haptics, gesture-driven animation, press-and-hold, native image sharing — none of these work in a web browser
- **External data source:** both the Sorting Hat's reading and the Sealed Letter's text are fetched from public APIs, not hardcoded
- **Multi-screen:** a start screen, 3 fortune-telling pages, a History screen, and a per-entry detail/share screen, reached independently of the looping pager

## App structure

```
App
 ├─ Start screen                  (gesture-handler + reanimated)
 │   └─ hold the candle to light it, then enter the pager
 ├─ Main Pager                    (looping horizontal ScrollView, paging)
 │   ├─ Page 1 · Potion of Truth     — shake
 │   ├─ Page 2 · The Sorting Hat     — tap the screen, press your fingerprint
 │   └─ Page 3 · The Sealed Letter   — double-tap to break the seal
 │   (swiping past Letter continues into Potion, and vice versa)
 ├─ History screen                (opened via corner wax-seal icon, not swiped to)
 └─ Entry detail screen           (opened by tapping a History entry)
     └─ recreates that fortune's reveal moment + a share button
```

The pager is reached from the start screen by holding a finger on an unlit candle image until it visibly lights (a cross-fade to a lit-candle image timed to the hold), at which point the screen fades to gold and swaps to the pager. A small wax-seal icon fixed in the corner of all three pager pages opens History, pushed as its own screen rather than a fourth pager stop.

## Start screen

A title card that sets the tone before any fortune is asked, and turns "enter the app" into its own small gesture-driven ritual rather than a generic button — consistent with every other page in the app responding to a physical action instead of a tap.

| | |
|---|---|
| Trigger | Press and hold a finger on the candle |
| Detect | `react-native-gesture-handler` — `Gesture.LongPress()` with a ~1.4s minimum duration |
| Animation | `react-native-reanimated` — an unlit candle image cross-fades to a lit candle image as the hold progresses; releasing early fades it back down instead of completing |
| Feedback | A light haptic tick when the hold begins, a success haptic when it completes |
| Transition | On completion, the screen fades out under a solid Candlelight Gold overlay before the pager screen replaces it (`router.replace`, so the start screen isn't left in the navigation history) |

## The looping pager

Swiping isn't limited to bouncing between the first and last page — the three fortune pages are arranged as a continuous loop. Swiping right past the Sealed Letter carries on into the Potion of Truth, and swiping left past the Potion carries on into the Letter, with no snap or jump.

This is built with two invisible, non-interactive "stub" slots at either end of the scroll view (a static visual stand-in — background color, title, hero image — for the page on the other side of the loop). Dragging past a real page's edge physically scrolls into the adjacent stub; the instant native scroll momentum settles there, the scroll position is silently re-anchored to the real page underneath, with no animation and no visible seam. The stub is never something you can stop on or interact with — by the time you could tap or shake anything, you're looking at the real, fully interactive page.

Each real page also resets its own state (result badge, reading, open letter) the moment it's swiped away from — including via the loop — so arriving at a page always shows it fresh, matching what its stub already looked like while you were dragging through it.

### Card-fan page indicator

Instead of dots, a small fanned stack of three parchment cards sits fixed above the bottom of the screen, styled like a spread of tarot cards. The three fan positions (left/middle/right) stay fixed; what changes as you swipe is which page's card currently occupies the front-and-center slot, tracked live off scroll position. The active card is enlarged, upright, and gold-glowing with a dark-ink glyph of that page's object; the two side cards sit rotated ±12°, dimmed, and nearly glyph-less, reading as "not yet drawn."

## Pages

Each page is a different magical object with its own way of being triggered, its own SDK doing the sensing, and its own kind of feedback. Once a page reveals its fortune, the hint text at the bottom is replaced by a **Share this fortune** button (see [Sharing a fortune](#sharing-a-fortune)).

### Page 1 — Potion of Truth

A vial that answers yes-or-no questions. Shake it, and the liquid inside swirls and settles on a color: green for yes, red for no.

| | |
|---|---|
| Trigger | Shake the phone |
| Detect | `expo-sensors` Accelerometer — a shake is only counted after 3 threshold-crossings land within a 1-second window, so a single bump or picking up the phone doesn't false-trigger it |
| Animation | `react-native-reanimated` — the vial wobbles and scales while swirling, then settles; the result badge pops in with a spring |
| Feedback | Haptic impact when the shake triggers, a swirling-liquid sound effect (`expo-audio`), then a success/warning haptic notification when the result lands |
| Data | Random yes/no locally — a fixed 50/50 outcome, by design (see [Scope notes](#scope-notes)) |

### Page 2 — The Sorting Hat

Tap anywhere on the screen, as if the Hat were reading your mind, and it reveals something about your fate.

| | |
|---|---|
| Trigger | Tap anywhere on the page — triggers a fingerprint / biometric prompt |
| Detect | `expo-local-authentication` — `hasHardwareAsync()` / `isEnrolledAsync()` / `authenticateAsync()`, each failure mode shown as its own status message instead of failing silently |
| Animation | `react-native-reanimated` — the Hat's brim lifts, then pulsates gently while "thinking" |
| Feedback | A haptic pulse once authentication resolves, then the Hat speaks its reading aloud via `expo-speech` (slowed rate, lowered pitch) |
| Data | Fetched from the Harry Potter character API — a random sorted character's house and patronus, worked into a reading; falls back to a small local pool if the request fails |

This is the app's strongest native-only moment: biometric hardware has no equivalent in a browser, and using it to "read" the user rather than to log in is a genuinely different use of the API than its usual purpose. Having the Hat actually speak the result — rather than just displaying text — is also the one place in the app where a fortune is *heard*, not just seen or felt, which sets this page apart from the Potion (visual + haptic + sound) and the Letter (visual + sound effect).

### Page 3 — The Sealed Letter

An envelope with a wax seal. Double-tap it, and the seal cracks open to reveal the letter inside.

| | |
|---|---|
| Trigger | Double-tap the envelope; double-tap the open letter again to reseal it |
| Detect | `react-native-gesture-handler` — `Gesture.Tap().numberOfTaps(2)` over the whole stage |
| Animation | `react-native-reanimated` — the seal cracks, then (after the unfold sound finishes) the letter scales and fades in as it unfolds |
| Feedback | A paper-unfold sound via `expo-audio`, preloaded at module scope to remove playback-start latency |
| Data | Fetched from a public Harry Potter quotes API, cached offline via AsyncStorage |

## History screen

A fourth screen, separate from the fortune-telling pager, that lists every fortune the app has given — every potion color, every Sorting Hat reading, every letter — grouped by day, most recent first. Framed as a Pensieve rather than a plain list: a place to go back and relive what's already happened, distinct from the pager's job of *producing* a new fortune. The screen's own title reads "History"; "Pensieve" is the in-world name for the same idea.

### Why it's a separate screen

The pager is about asking; the Pensieve is about remembering. It's reached via a small wax-seal icon fixed across all three pager pages, and tapping it pushes the Pensieve as its own screen rather than a fourth pager stop — keeping the carousel to exactly three objects, three gestures.

### What it stores

```javascript
{
  id: '1758286800000',            // timestamp used as unique id
  type: 'potion' | 'hat' | 'letter',
  text: 'Yes.' | 'Like Harry Potter, you belong in Gryffindor...' | '"..." — Albus Dumbledore',
  timestamp: 1758286800000,
  favorite: false
}
```

### Technical implementation

- **Storage:** `@react-native-async-storage/async-storage` — the same library used for offline letter- and reading-caching, doing double duty as a lightweight local database. Entries are stored as one JSON array under a single key (`fortuneHistory`).
- **List rendering:** a plain `FlatList` grouped by day ("Today" / "Yesterday" / full weekday date), each entry a parchment-textured card tagged with a small icon for its source (potion / hat / letter) and a timestamp.
- **Tapping an entry** pushes an entry detail screen (`/entry/[id]`) — see [Entry detail & sharing](#entry-detail--sharing).
- **Empty state:** before any fortune has been given, the screen shows a short prompt ("Nothing here yet — try one of the three on the other side") instead of a blank screen.
- **Clearing:** a "Clear History" action (with confirmation) wipes the stored array.
- **Back navigation:** a broom icon in place of a plain arrow, styled to its own natural aspect ratio.

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'fortuneHistory';

async function addToHistory(type, text) {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  const history = raw ? JSON.parse(raw) : [];
  history.unshift({
    id: String(Date.now()),
    type,
    text,
    timestamp: Date.now(),
    favorite: false,
  });
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

async function getHistory() {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}
```

Each page calls `addToHistory(type, text)` right after its own reveal completes — the potion settling on a color, the Hat's reading appearing, the letter unfolding — no change to how each page generates its fortune, just one extra call at the end.

> **Note:** the data layer still has a `favorite` field and a `toggleFavorite` helper, but there is no favorites UI (no star, no All/Favorites filter) in the History screen — it was removed to keep the list simple. The field is left in place rather than migrated out.

```javascript
import * as Speech from 'expo-speech';

function announceReading(text) {
  Speech.speak(text, {
    rate: 0.85,   // slightly slower, more "wise old Hat" than default TTS pacing
    pitch: 0.7,   // lowered, so the Hat reads as a deeper, more masculine voice
  });
}
```

## Entry detail & sharing

Tapping any entry in History pushes a full-screen detail view that recreates how that fortune actually looked at the moment it was revealed — not just its saved text.

- **Potion entries** show the correct colored vial (green/red, inferred from the saved text) with its result badge, styled exactly like the live Potion page.
- **Sorting Hat entries** show the hat with the saved reading in its rotated parchment badge.
- **Letter entries** show the open letter with the saved quote laid over it in the same handwritten font.

### Sharing a fortune

Both the entry detail screen and each live page (once revealed) offer a **Share this fortune** button. It:

1. Captures the on-screen reveal (title + object + result — not the button itself) as a PNG via `react-native-view-shot`'s `captureRef`.
2. Hands that image to `expo-sharing`'s `shareAsync`, which opens the device's native share sheet (Messages, WhatsApp, email, save-to-Photos, etc.).

On each live page, the share button only appears once there's something to share — it replaces the hint text in the same spot, so a page always shows either "how to trigger this" or "share what just happened," never both. The button's border/text color always matches that page's own title color (Candlelight Gold on Potion, Study Wood on Sorting Hat, Parchment on Letter) rather than a fixed palette, since STYLE.md reserves Pensieve Silver-Blue for the History screen alone.

## External data sources

Two of the three pages pull from real, public APIs rather than hardcoded arrays. Both follow the same fetch → cache-in-AsyncStorage → fallback-on-failure pattern.

### The Sorting Hat — character API

**Request:**
```
GET https://hp-api.onrender.com/api/characters
```

Returns an array of ~437 characters with `house` and `patronus` fields, among others. A random character with a known house is picked, and the reading is built from their name, house, and patronus (when present):

> "Like Harry Potter, you belong in Gryffindor. Your patronus would be a stag."

If the request fails, the last successful reading is read back from AsyncStorage; if there's no cache yet either, a small local pool of generic house lines is used instead.

### The Sealed Letter — quotes API

**Request:**
```
GET https://raw.githubusercontent.com/SyntaxOutlaw/HarryPotterAPI/main/app/data/quotes.json
```

Returns an array of 117 real book quotes with `quote`, `speaker`, `story`, and `source` fields. A random quote is picked and formatted as:

> "It does not do to dwell on dreams and forget to live." — Albus Dumbledore

If the request fails, the last successful letter text is read back from AsyncStorage; if there's no cache yet either, a placeholder line is shown ("The owl has not yet arrived. Try again later.").

**The Potion's** yes/no stays local on purpose: it's meant to feel instantaneous and tied to a physical action (a shake), not something worth a network round-trip.

## Feature map

| Feature | Expo SDK | Third-party library | Native-only |
|---|---|---|---|
| Hold-to-light candle, enter app | expo-haptics | gesture-handler, reanimated | Yes |
| Looping swipe between pages | — | reanimated (`useAnimatedRef`, `scrollTo`) | Yes |
| Card-fan page indicator | — | reanimated | No |
| Potion shake detection | expo-sensors, expo-haptics | — | Yes |
| Potion color-swirl animation + sound | expo-audio | reanimated | Yes |
| Sorting Hat tap-to-trigger fingerprint read | expo-local-authentication, expo-haptics, expo-speech | — | Yes |
| Sorting Hat reveal animation | — | reanimated | Yes |
| Letter double-tap | expo-audio | gesture-handler | Yes |
| Letter seal-crack + unfold animation | — | reanimated | Yes |
| Share a fortune (live page or History) | expo-sharing | react-native-view-shot | Yes |
| Custom fonts (titles, reveal text, letter text) | expo-font | — | No |
| Offline reading/letter cache | — | async-storage | No |
| History (Pensieve) log + entry detail screen | — | async-storage | No |

## Data flow

**On launch:**
load custom fonts via `expo-font` → hide splash screen once ready

**Hold the candle (Start screen):**
long-press begins → haptic tick → candle cross-fades from unlit to lit over the hold → hold completes → success haptic → screen fades to gold → navigate to the pager (start screen removed from history)

**Shake (Potion of Truth):**
accelerometer threshold crossed 3 times within 1s → haptic impact → swirl sound plays → liquid swirl/wobble animation → settle on red or green → success/warning haptic → append to History → hint swaps for a Share button

**Tap the screen (The Sorting Hat):**
hardware/enrollment checked → `authenticateAsync()` resolves → haptic pulse → Hat-brim lift + pulsate animation → reading fetched from the character API (or fallback) → reading spoken aloud via `expo-speech` → append to History → hint swaps for a Share button

**Double-tap (The Sealed Letter):**
seal cracks → paper-unfold sound plays → letter unfolds once the sound finishes → quote fetched from the quotes API (or cached/fallback) → shown in the letter → append to History → hint swaps for a Share button → double-tap again to reseal

**Swipe past the first/last page:**
drag continues into an invisible stub of the page on the other side of the loop → native scroll momentum settles on the stub → scroll position silently re-anchors to the real page → real page is fully interactive with no leftover state from before

**Open History (any pager page, via corner wax-seal icon):**
read `fortuneHistory` from AsyncStorage → group entries by day → render as a `FlatList`

**Tap a History entry:**
look up that entry's saved type/text → render a recreation of its original reveal moment → offer a Share button that captures and shares that recreation as an image
