# Fortune Teller: React Native (Expo) vs Lit

A comparison based on the React Native app in `assignment-react-native-original` and the complete Lit port in this folder.

## What was built

All screens of the app are ported.

| Screen / feature | React Native | Lit port |
|---|---|---|
| Start screen: hold the candle 1.4s, gold fade | `index.tsx` | `start-screen.js` |
| Looping pager with stub pages and silent re-anchor | `pager.tsx` | `fortune-pager.js` |
| Card-fan page indicator | `card-fan-indicator.tsx` | `card-fan-indicator.js` |
| Potion of Truth: shake, swirl, sound, question, share | `potion-page.tsx` | `potion-page.js` |
| Sorting Hat: biometric read, API reading, speech | `sorting-hat-page.tsx` | `sorting-hat-page.js` |
| Sealed Letter: double-tap, seal crack, unfold, API quote | `letter-page.tsx` | `letter-page.js` |
| History grouped by day, clear | `history.tsx` | `history-screen.js` |
| Entry detail and share | `entry/[id].tsx` | `entry-detail.js` |
| Store, router, data fetching | zustand, expo-router, `data/*.ts` | `history-store.js`, `fortune-app.js`, `fortune-data.js` |

Not ported: `error-boundary.tsx`. Lit has no equivalent, and a web component that throws simply fails to render.

Run it with:

```bash
cd assignment-react-native-lit
npm install
npm run dev        # http://localhost:5173, also exposed on your LAN
```

On a desktop you can swipe with a trackpad, drag with the mouse, or use the ← → keys.

## What was tested

I tested in desktop Chrome and drove the app through its real UI and DOM events.

| Checked | Result |
|---|---|
| `vite build` | Passes. The whole app is 72 KB of JS, 23 KB gzipped (includes Lit and `html-to-image`). |
| Start screen | Hold starts the glow, completion fades to gold and replaces the route with `#/pager`. |
| Pager | Five slides measured at exactly one page width each. Arrow keys move one page. Jumping onto the end stub re-anchors to the real Potion page with no visible seam, and the Letter page it left is reset (its `resetKey` is bumped). |
| Card fan | The active card follows the page, and the glyph changes while scrolling. |
| Potion | Click fallback runs the swirl, shows "Yes." with its badge, and saves to History. |
| Letter | Double-tap cracks the seal, fetches a real quote from the API, crossfades to the open letter, and replaces the hint with a share button. |
| Sorting Hat | With biometrics forced to "unavailable", the status message and the skip button appear. After skipping, the hat thinks and shows a real reading fetched from the character API. |
| History | Entries are grouped under "Today", each with its type icon. Tapping one opens the entry detail. |
| Entry detail | The saved Hat reading is recreated on the parchment page. |

**Not tested** (needs a real device or a user interaction I can't automate):

- The real WebAuthn prompt, since I forced it to "unavailable" to avoid a passkey dialog.
- `DeviceMotionEvent` shake and the iOS permission prompt.
- `navigator.vibrate`, audible speech and sound.
- The Web Share sheet and the `html-to-image` capture.
- Touch swipe with a real finger. The browser tab was hidden, which throttles smooth scrolling, so I tested the loop with instant jumps rather than a human drag.

Bugs I hit while testing, both in my port rather than in either framework:

1. Flex slides ignored `flex-basis: 100%` and grew to 720px, because the Letter's 1.5×-width envelope forced a larger `min-content`. Fixed with `min-width: 0` and `overflow: hidden`.
2. The page titles used RN's fixed 44px font and nearly touched both edges at 480px, and would wrap on a 390px phone. The CSS now scales with `--w`.

## Concept mapping

| React Native / Expo | Lit / web | Notes |
|---|---|---|
| `useState`, `useRef` | `static properties` with `{ state: true }`, and `#private` fields | Fields that don't affect rendering (timeouts, listeners) are plain private fields. |
| `useEffect` and cleanup | `connectedCallback`, `disconnectedCallback`, `updated(changed)` | Cleanup logic is in one place. |
| `useCallback`, `useMemo`, `exhaustive-deps` | Not needed | Methods are stable, getters are recomputed on render. |
| `isMountedRef` guards | `this.isConnected` | |
| `key={resetKey}` remount trick | `keyed(resetKey, template)` | Same idea: a new key throws the old element away. |
| `useIsFocused()` | The router passes a `focused` property | The pager stays mounted under History, with `visibility: hidden` so its scroll position survives. |
| zustand + `AsyncStorage` | `EventTarget` store + `localStorage` | `localStorage` is synchronous, so the `historyLoaded` promise guard disappears. |
| expo-router `Stack`, `/entry/[id]` | Hash router in `fortune-app.js` | Lit has no router. `@lit-labs/router` or Vaadin Router would be the library route. |
| `StyleSheet`, `Dimensions` | CSS in `static styles`, `--w`, `%`, `dvh` | `Dimensions.get("window")` becomes a CSS variable. |
| reanimated shared values, `withTiming`, `withRepeat`, `withSpring` | CSS transitions and keyframes, plus `element.animate()` | Spring physics becomes an overshoot easing curve. |
| reanimated `interpolate` for the card fan | Same function written in 8 lines of JS, applied inline | Per-scroll-event re-render. CSS scroll-driven animations would avoid it but have uneven support. |
| `useAnimatedScrollHandler` `onMomentumEnd` + `scrollTo(…, false)` | `scrollend` + `scrollTo({ behavior: "instant" })` | A debounced `scroll` fallback exists for browsers without `scrollend`. |
| `Gesture.LongPress().minDuration(1400)` | `pointerdown` + `setTimeout`, and a CSS transition as long as the hold | Releasing early reverses the transition on its own. |
| `Gesture.Tap().numberOfTaps(2)` | `dblclick` with `touch-action: manipulation` | |
| `expo-sensors` Accelerometer | `DeviceMotionEvent` | Same thresholds, but converted from m/s² to g. iOS needs a permission tap. |
| `expo-local-authentication` | WebAuthn platform authenticator | See below. |
| `expo-haptics` | `navigator.vibrate` | Android Chrome only. |
| `expo-speech` | `speechSynthesis` | |
| `expo-audio` | `new Audio()` | |
| `react-native-view-shot` + `expo-sharing` | `html-to-image` + Web Share API | Falls back to a download on desktop. |
| `expo-font` + splash gating | `@font-face` | |
| `PageTitle`, `PageHint`, `RevealBadge`, `ShareButton` components | Shared CSS classes in `page-styles.js` | |
| `PageStub` components (static copy of each page) | The real page element again, `inert`, with `active = false` | The stub can't drift out of sync with the page it imitates. |

## Where Lit is better

1. **Less ceremony.** Of the 2,471 RN lines I counted (all of `src/`, including components not ported), the Lit port is 1,725 lines, about 30% fewer. That includes about 215 lines of glue that RN gets from Expo packages (shake, share, haptics, speech, biometrics, data, colors). The saving comes from no hooks, no worklet and `runOnJS` plumbing, no separate stub components, and no `StyleSheet` boilerplate. It is one sample from one developer, so treat it as indicative.
2. **No hook rules.** The RN version needs about a dozen `eslint-disable` comments for `exhaustive-deps` and `immutability`. The Lit version has none, and lifecycle is three named callbacks.
3. **Stubs come for free.** The looping trick in RN needs a hand-written `PageStub` per page with duplicated sizes and strings. In Lit the stub is the same element, so a layout change can't make them differ.
4. **Small and instant.** 23 KB gzipped for the whole app, no native build, no dev client, no store review. You share a URL.
5. **CSS does the animation work.** Transitions and keyframes handle swirl, idle breathing, crack, unfold and pop. `prefers-reduced-motion` is one rule in `page-styles.js`, and the RN app doesn't handle it.

## Where React Native is better

1. **Native-only features are real.** CONCEPT.md requires them. In a browser:
   - **Haptics** collapse to `navigator.vibrate(ms)`: no impact or notification styles, Android Chrome only.
   - **Biometrics** have no `hasHardware`/`isEnrolled`/`authenticate` equivalents. The port uses WebAuthn: the first read creates a device-bound passkey, later reads ask it for an assertion. It proves "a user verified on this device", which is close to the original idea, but it needs HTTPS and a passkey is created on first use. Each failure message of the RN version is not separately reproducible.
   - **Sensors** need a permission tap on iOS and HTTPS everywhere, and laptops have none. The port adds a click fallback for desktop testing.
   - **Share** uses a DOM-to-image redraw, which is an approximation of what `captureRef` captures exactly. File sharing works on mobile browsers, and desktop falls back to a download.
2. **Gesture and animation performance.** Reanimated and gesture-handler run on the UI thread. In the browser, transforms and opacity are compositor-friendly, but the card fan re-renders on the main thread per scroll event.
3. **Real mobile toolchain.** Permissions, icons, splash, deep links and store builds are all in `app.json`. On the web you assemble these yourself (manifest, service worker, HTTPS).
4. **Navigation.** The native stack gives swipe-back, focus semantics and a back stack. Here the hash router and `history.back()` cover the basics only.
5. **Virtualized lists.** History uses plain DOM rows. That is fine for dozens of entries, but `FlatList` would handle thousands.

## Behaviours that differ in the port

- Desktop users can drag the pager with the mouse (the port adds this) and use ← →. RN only has touch.
- Tapping the Hat page on a machine without a platform authenticator shows the same status message as RN, plus a "Read me anyway" button the original doesn't have.
- The pager title font scales down on narrow screens, while RN uses a fixed 44.
- History entries are links (`#/entry/<id>`), so the browser's back button and deep links work.
- Idle animations (hat bow, envelope strain) run only on the active page and stop when `active` becomes false, same as RN's `isActive`.

## Middle path: Lit inside Capacitor

If the native features matter, run this Lit app inside a **Capacitor** shell. `@capacitor/haptics`, a biometric plugin, `@capacitor/share` and native audio replace the web fallbacks, and the UI code stays Lit. Only `lib/haptics.js`, `lib/biometric.js`, `lib/shake.js` and `lib/share.js` would need touching, since those four files are the entire native boundary.

## Recommendation

| If the goal is… | Choose |
|---|---|
| Meeting the assignment as written (native-only features, Expo SDK) | React Native |
| Demonstrating the framework difference, as in demo-01 | The Lit port (this folder) |
| Shipping to phones without an app store | Lit as a PWA, accepting weaker haptics and biometrics |
| Both the Lit developer experience and real native APIs | Lit + Capacitor |

## Suggested next steps

1. Open it on a real phone through an HTTPS tunnel (`npx localtunnel --port 5173`) and check shake, vibration, passkey, share and the touch swipe. Those are the untested items above.
2. Add a service worker and manifest if you want it installable.
3. Decide whether to keep the desktop-only extras (mouse drag, fallback buttons) or hide them behind `?debug`.
