# Fortune Teller – Wizarding Edition (Lit)

A Lit port of the React Native (Expo) app **Fortune Teller – Wizarding Edition**. It has the same look, screens and behaviour, but it is built with web components and runs in the browser instead of as a native app.

- Original: `assignment-react-native-main` (Expo SDK 57, React Native 0.86, React 19)
- This version: Lit 3 + Vite, plain JavaScript, no React

For the side-by-side analysis, see [COMPARISON.md](COMPARISON.md).

## Table of contents

- [Is this still an app, or only a website?](#is-this-still-an-app-or-only-a-website)
- [Run it](#run-it)
- [What the app does](#what-the-app-does)
- [Project structure](#project-structure)
- [The big differences from the React Native version](#the-big-differences-from-the-react-native-version)
- [What I changed while porting](#what-i-changed-while-porting)
- [Bugs found and fixed along the way](#bugs-found-and-fixed-along-the-way)
- [Known limitations](#known-limitations)
- [Turning it into a real app](#turning-it-into-a-real-app)

## Is this still an app, or only a website?

**It is a website (a web app).** There are no React Native components left.

| | React Native version | Lit version |
|---|---|---|
| Runs as | A native iOS / Android app (installed on the device) | A web page that opens in a browser |
| Built with | React components compiled to native views | Web components (custom elements) drawn by the browser |
| UI elements | `View`, `Text`, `Pressable`, `ScrollView`, `Image`… | `div`, `img`, `button`, `h1`… (plain HTML) |
| Distributed via | App store / Expo dev client | A URL |
| Needs installing | Yes | No |

I checked this: the code imports nothing from React, React Native or Expo. `package.json` has two runtime dependencies, `lit` and `html-to-image`, and the build tool, `vite`.

On a phone it *looks* like an app, because it fills the screen and is built for portrait. But it is still a web page. It is not a native app, and it can't use native-only features beyond what browsers expose (see [Known limitations](#known-limitations)). It can become an installable app, see [Turning it into a real app](#turning-it-into-a-real-app).

## Run it

```bash
cd assignment-lit
npm install
npm run dev        # http://localhost:5173, also shown on your LAN address
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Opening it on a phone: sensors (shake), passkeys (the Sorting Hat) and sharing only work on **HTTPS** (or `localhost`). Use a tunnel such as `npx localtunnel --port 5173` to test on a real device.

On a desktop you can move between pages by swiping on a trackpad, dragging with the mouse, pressing ← →, or clicking the small cards at the bottom.

## What the app does

1. **Start screen.** Hold your finger on the unlit candle for 1.4 seconds. It cross-fades to a lit candle, then the screen fades to gold and opens the pager. Letting go early fades the flame back down.
2. **Three looping pages.** Swipe left and right. Past the last page you continue into the first, with no jump.
   - **Potion of Truth.** Type a yes/no question and shake the phone. The vial swirls, then settles green (yes) or red (no).
   - **The Sorting Hat.** Tap the screen. The Hat checks your fingerprint or face, fetches a house and patronus from the Harry Potter API, and reads it aloud.
   - **The Sealed Letter.** Double-tap the envelope. The seal cracks, a Harry Potter quote is fetched, and the letter unfolds. Double-tap again to reseal.
3. **Card-fan indicator.** The three little cards at the bottom show which page you are on. Click a side card to go to that page.
4. **History.** The wax seal in the corner opens a list of every fortune, grouped by day. It is stored in `localStorage`.
5. **Entry detail.** Tapping an entry recreates how that fortune looked, with a **Share this fortune** button.

## Project structure

```
assignment-lit/
├── index.html              entry page, loads the fonts and <fortune-app>
├── vite.config.js          dev server settings
├── public/
│   ├── img/                all images (vial, hat, letter, candle, parchment, wax seal…)
│   ├── fonts/              ClimateCrisis, BebasNeue, HomemadeApple
│   └── sounds/             potion-swirl.mp3, paper-unfold.mp3
└── src/
    ├── main.js             imports <fortune-app>
    ├── components/         one file per screen or widget (web components)
    │   ├── fortune-app.js        hash router: #/, #/pager, #/history, #/entry/<id>
    │   ├── start-screen.js       hold-the-candle screen
    │   ├── fortune-pager.js      looping scroll-snap pager
    │   ├── card-fan-indicator.js page indicator, clickable
    │   ├── potion-page.js
    │   ├── sorting-hat-page.js
    │   ├── letter-page.js
    │   ├── history-screen.js
    │   └── entry-detail.js
    └── lib/                    everything that talks to the browser / data
        ├── history-store.js    the fortune log (EventTarget + localStorage)
        ├── fortune-data.js     fetches readings and quotes, with cache and fallback
        ├── shake.js            DeviceMotion shake detection
        ├── biometric.js        WebAuthn "fingerprint read"
        ├── haptics.js          navigator.vibrate
        ├── speech.js           speechSynthesis
        ├── share.js            html-to-image + Web Share API
        ├── idle.js             randomised idle-animation scheduler
        ├── page-styles.js      shared CSS: title, hint, badge, share button
        └── colors.js           the colour palette as CSS variables
```

The four files that touch device features (`shake.js`, `biometric.js`, `haptics.js`, `share.js`) are the entire "native boundary". That matters if you ever wrap the app in Capacitor.

## The big differences from the React Native version

### 1. A different kind of component

React components are functions that re-run on every render and use hooks for state. Lit components are classes that extend `LitElement`, and they are real browser elements (`<potion-page>`).

```js
// React Native
const [result, setResult] = useState(null);
useEffect(() => { /* start listening */ return () => { /* clean up */ }; }, [isActive]);

// Lit
static properties = { result: { state: true } };
connectedCallback() { /* start */ }
disconnectedCallback() { /* clean up */ }
updated(changed) { if (changed.has("active")) { /* react to it */ } }
```

There are no dependency arrays, no `useCallback`, no `useMemo`, and no `eslint-disable exhaustive-deps` comments. The RN source has 13 of those.

### 2. CSS instead of StyleSheet and Reanimated

All styling is real CSS inside each component's shadow DOM. Animations that used Reanimated shared values are now CSS transitions and keyframes, plus `element.animate()` for the random idle movements. The spring on the potion badge became an overshoot easing curve.

### 3. Browser APIs instead of Expo packages

| Feature | React Native (Expo) | Lit (browser) |
|---|---|---|
| Shake | `expo-sensors` Accelerometer | `DeviceMotionEvent` |
| Fingerprint / Face ID | `expo-local-authentication` | WebAuthn platform authenticator |
| Haptics | `expo-haptics` | `navigator.vibrate` |
| Speech | `expo-speech` | `speechSynthesis` |
| Sounds | `expo-audio` | `new Audio()` |
| Share as image | `react-native-view-shot` + `expo-sharing` | `html-to-image` + Web Share API |
| Storage | `AsyncStorage` | `localStorage` |
| Fonts | `expo-font` | `@font-face` |
| Gestures | `react-native-gesture-handler` | Pointer Events, `dblclick` |
| Navigation | `expo-router` | A small hash router |
| Global state | `zustand` | An `EventTarget` store |
| Looping pager | Reanimated `ScrollView` + `scrollTo` | CSS scroll-snap + `scrollend` |

### 4. Pages that can't drift out of sync

The looping pager needs a copy of the last page before the first page, and of the first page after the last. In React Native these were separate hand-written `PageStub` components with duplicated sizes and text. Here the stub is simply the same page element again, marked `inert`, so it can never look different from the real page.

### 5. Size and delivery

The whole app is about 73 KB of JavaScript (23 KB gzipped), including Lit. There is nothing to install, and you share it with a link.

### 6. Less code

| | Lines |
|---|---|
| React Native (all of `src/`) | 2,471 |
| Lit (`src/`) | about 1,750 |

Roughly 30% fewer lines, even though the Lit version includes about 215 lines of glue for browser APIs that Expo packages handle for you. This is one sample, so it is a rough indicator rather than a rule.

## What I changed while porting

Mostly I kept behaviour and visuals the same. These are the intentional differences:

- **Router.** The native stack became hash routes (`#/pager`, `#/history`, `#/entry/<id>`). Fortunes are real links, so the browser's back button and deep links work. The pager stays mounted under History (hidden with `visibility`, not removed), so you return to the page you left.
- **Fingerprint read.** WebAuthn has no "just scan my finger" call. The first read creates a passkey bound to the device. Later reads ask that passkey to verify you. Nothing is checked server-side; it only proves you unlocked your device.
- **Desktop-friendly extras** that the original doesn't have:
  - mouse dragging and ← → keys for the pager
  - a **Shake with a click** button on the Potion page (laptops have no accelerometer)
  - a **Read me anyway** button on the Hat page when the device has no fingerprint sensor
  - clickable cards in the page indicator
- **Responsive titles.** The RN titles use a fixed 44px. In the browser they scale down on narrow screens so they don't overflow or wrap.
- **Reduced motion.** `prefers-reduced-motion` turns off animations. The RN app doesn't handle this.
- **Letter text size.** React Native's `adjustsFontSizeToFit` has no CSS equivalent, so the font size is picked from the length of the quote.
- **Idle animations** (hat bow, envelope strain, potion breathing) run only on the page you are looking at.

## Bugs found and fixed along the way

All of these were bugs in my port, not in either framework.

| Problem | Cause | Fix |
|---|---|---|
| Pages were 720px wide instead of 480px, so scrolling got stuck mid-way | The Letter's oversized envelope forced the flex slide wider than its `flex-basis` | `min-width: 0` and `overflow: hidden` on each slide |
| Page titles nearly touched both edges | Fixed 44px font, same as RN | Font size scales with the page width |
| Card-fan button covered the "no sensor" buttons | Overlapping absolute positions | Moved and shortened the buttons |
| Sorting Hat sat on the left, not centred | It is 1.4× the page width inside a grid container. The grid track grew to fit it and pinned it to the left | Switched to flexbox, which centres an overflowing item evenly |
| Open letter overlapped the title | The letter had a fixed size and ignored the screen height | Its size is now limited by the space between the title and the share button |
| History text clipped by the ragged parchment edge | No padding on the cards | More horizontal padding |

## Known limitations

These come from the browser, not from my code:

- **Haptics.** `navigator.vibrate` takes only a duration. It works on Android Chrome and does nothing on iOS Safari. There are no separate "impact" and "success" styles.
- **Shake.** Needs HTTPS. On iOS the user must tap **Enable shake** first to grant permission. Desktop browsers have no sensor.
- **Fingerprint.** Needs HTTPS and a device with a platform authenticator (Touch ID, Face ID, Windows Hello, Android fingerprint).
- **Share.** The image is redrawn from the page with `html-to-image`, so it can differ slightly from what you see. Mobile browsers open the share sheet. Desktop browsers usually download a PNG instead.
- **Speech.** The Hat's voice depends on the voices installed on the device.
- **Not tested on a real phone.** Everything was checked in desktop Chrome. The real WebAuthn prompt, shake, vibration, audible speech, the share sheet and touch swiping on a phone are untested.

## Turning it into a real app

If you want it to behave like an installed app:

1. **PWA (easiest).** Add a web app manifest and a service worker. Users can then "Add to Home Screen" and it runs full-screen and offline. It is still a web app, so the limitations above still apply.
2. **Capacitor (closest to the original).** Wrap this Lit app in a native shell. Real haptics, biometrics and sharing come from native plugins, and only the four files in `src/lib/` (`haptics.js`, `biometric.js`, `shake.js`, `share.js`) need to change. The UI stays Lit. The result would be a real installable iOS/Android app, but the screens would still be web components inside a web view, not React Native components.
