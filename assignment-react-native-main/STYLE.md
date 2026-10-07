# Visual Style Guide — Fortune Teller

A wizarding-inspired look built from warm candlelit color, worn materials, and full hand-drawn objects rather than flat icons.

## Mood

Warm, dim, and a little theatrical — like a study lit by a single candle at night. Nothing feels like a modern app; every screen should feel like it was made of paper, wax, wood, and cloth. The three fortune pages — and the start screen before them — share this world; the History screen (in-world: the Pensieve) deliberately steps outside it into something cooler and more spectral, because remembering a fortune is a different feeling than asking for one.

## Color palette

| Name | Hex | Use |
|---|---|---|
| Parchment | `#EDE1C0` | Card backgrounds, anything meant to be read |
| Old Ink | `#241A10` | Primary text on parchment |
| Study Wood | `#3A2A19` | Screen backgrounds behind the parchment (start screen, Potion, Sorting Hat) |
| Candlelight Gold | `#B8892B` | Interactive elements, glows, anything "magical" happening — used at full opacity for titles/hints, and as a translucent overlay (`#B8892Bc4`) for the start screen's title color and its hold-to-enter transition flash |
| Potion Crimson | `#7C2F2F` | Reserved only for the Potion's "No" |
| Potion Emerald | `#2F5D46` | Reserved only for the Potion's "Yes" |
| Pensieve Silver-Blue | `#C7D4DE` | Used only on the History screen, nowhere else |
| Spectral Navy | `#141B22` | History screen background — the "stepping outside the candlelit world" color |

Gold is the one color allowed to mean "something magical is happening" anywhere in the app. Crimson and emerald never appear outside the Potion's result. Keeping the History screen's silver-blue-on-navy off every other screen is what makes it read as a separate space the moment it opens.

## Typography

Google Fonts, loaded once via `expo-font` in the root layout:

- **ClimateCrisis** — every page title (start screen, Potion, Sorting Hat, Letter, History). An engraved, formal display face, used only for titles, never for body or result text.
- **BebasNeue** — the reveal moment's result text: the Potion's "Yes."/"No." badge and the Sorting Hat's spoken reading, shown inside a parchment badge. Condensed and bold, so a short line reads as a verdict.
- **HomemadeApple** — the Sealed Letter's body text only, inside the open letter. A handwritten script, used exactly once per session — nowhere else in the app.
- **System font, small-caps-style styling** — hint/instruction text ("Hold your finger to the candle to light it", "Shake the phone", etc.) uses the system font with uppercase + wide letter-spacing rather than a dedicated face, to keep those short instructional lines visually distinct from titles and reveals.

## Materials

Every surface aims to feel like a real material, not a flat color:

- **Parchment** — a mottled paper texture image (`parchment.png`), used for the Potion/Sorting Hat result badges and every History entry card, not a flat fill.
- **Study wood** — the dark background color behind the start screen, Potion, and Sorting Hat pages.
- **Wax** — a wax-seal image used for the corner button that opens History from any pager page.

## The objects

Each fortune has its own hand-drawn object, plus a lit/unlit candle pair for the start screen:

- **A candle, unlit and lit** — the start screen's own object. Holding a finger on it cross-fades from `candle-unlit.png` to `candle-lit.png` over the hold, so the light itself is the progress indicator.
- **A stoppered glass vial** (Potion of Truth) — wobbles and scales while "swirling" for about a second when shaken before settling into a red or green variant of the same vial artwork.
- **A tall, worn conical hat** (The Sorting Hat) — its brim lifts and gently pulsates while it "thinks," before the reading is revealed.
- **A dark envelope with a wax-sealed close** (The Sealed Letter) — cracks and fades out as a separate open-letter image fades and scales in.

## Motion & sound, in one line each

- **Start screen:** the candle cross-fades from unlit to lit over roughly 1.4 seconds of holding; releasing early fades the lit layer back out instead of completing. A light haptic marks the start of the hold, a success haptic marks completion, then the screen fades under a gold overlay into the pager.
- **Potion:** wobbles and scales for a little over a second, then settles — never an instant color-snap; a haptic impact lands on the shake trigger, a success/warning haptic lands on the settle.
- **Sorting Hat:** the brim lifts, pulsates gently while "thinking," then the reading is both shown and spoken aloud — the pause before the reveal is what sells it.
- **Letter:** a paper-unfold sound plays the instant the seal cracks on the second tap; the letter's unfold animation only begins once that sound finishes playing, never at the same time.

## Components

- **The corner History button** is a wax-seal image, not a drawn shape — sized to be clearly tappable, no background fill or shadow behind it so the seal's own transparent edges read cleanly against each page's background.
- **Revealed fortunes** (Potion result, Sorting Hat reading) sit inside a parchment-textured badge, rotated slightly off-axis, with a drop shadow beneath — never a plain flat box.
- **History entries** are parchment-textured cards in a day-grouped list ("Today" / "Yesterday" / full date headers), each stamped with a small icon for its source (potion / hat / letter) and a timestamp in small-caps styling.
- **The start screen's hold target** is the candle image itself — there is no separate button; the object you touch is the control, matching how every other page in the app is triggered by acting on the object directly (shaking the potion, pressing the hat, tapping the letter) rather than a generic UI control.
