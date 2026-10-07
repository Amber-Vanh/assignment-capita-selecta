import { LitElement, html, css } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { palette } from "../lib/colors.js";

const SIDE_OFFSET_X = 22;
const SIDE_OFFSET_Y = 6;
const SIDE_ROTATION_DEG = 12;
const ACTIVE_SCALE = 1.13;
const ICONS = ["/img/potion-of-truth.png", "/img/sorting-hat.png", "/img/letter-closed.png"];

// reanimated's interpolate(..., Extrapolation.CLAMP)
function interpolate(x, input, output) {
  if (x <= input[0]) return output[0];
  if (x >= input.at(-1)) return output.at(-1);
  const i = input.findIndex((v, idx) => x >= v && x <= input[idx + 1]);
  const t = (x - input[i]) / (input[i + 1] - input[i]);
  return output[i] + t * (output[i + 1] - output[i]);
}

function shortestSignedDistance(raw, count) {
  let d = raw % count;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

// Port of card-fan-indicator.tsx. No worklets: the pager sets `scrollX` on every scroll
// event and Lit re-renders, computing each card's style inline.
export class CardFanIndicator extends LitElement {
  static properties = {
    scrollX: { type: Number },
    pageWidth: { type: Number },
    indexOffset: { type: Number },
  };

  constructor() {
    super();
    this.scrollX = 0;
    this.pageWidth = 1;
    this.indexOffset = 0;
  }

  #distance(index) {
    return shortestSignedDistance(index - (this.scrollX / this.pageWidth - this.indexOffset), ICONS.length);
  }

  // tell the pager how many pages to move; the signed distance respects the loop,
  // so from the first page the "left" card is the last page (-1), not +2
  #select(index) {
    const offset = Math.round(this.#distance(index));
    if (offset !== 0) this.dispatchEvent(new CustomEvent("select-page", { detail: { offset }, bubbles: true, composed: true }));
  }

  #cardStyle(index) {
    const s = this.#distance(index);
    const abs = Math.abs(s);
    const x = interpolate(s, [-1, 0, 1], [-SIDE_OFFSET_X, 0, SIDE_OFFSET_X]);
    const y = interpolate(s, [-1, 0, 1], [SIDE_OFFSET_Y, 0, SIDE_OFFSET_Y]);
    const rot = interpolate(s, [-1, 0, 1], [-SIDE_ROTATION_DEG, 0, SIDE_ROTATION_DEG]);
    const scale = interpolate(abs, [0, 1], [ACTIVE_SCALE, 1]);
    const glow = interpolate(abs, [0, 0.4], [1, 0]);
    return {
      card: {
        opacity: interpolate(abs, [0, 0.5, 1], [1, 0.7, 0.7]),
        zIndex: Math.round(interpolate(abs, [0, 1], [10, 1])),
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
        boxShadow: `0 0 6px rgb(184 137 43 / ${glow * 0.9})`,
      },
      glyph: { opacity: interpolate(abs, [0, 0.4, 1], [1, 0.15, 0.15]) },
    };
  }

  render() {
    return ICONS.map((icon, index) => {
      const style = this.#cardStyle(index);
      return html`<button class="card" aria-label="Go to page ${index + 1}" @click=${() => this.#select(index)} style=${styleMap(style.card)}>
        <div class="glyph" style=${styleMap({ ...style.glyph, "--icon": `url(${icon})` })}></div>
      </button>`;
    });
  }

  static styles = [
    palette,
    css`
      :host {
        position: absolute;
        bottom: 24px;
        left: 0;
        right: 0;
        height: 50px;
        display: grid;
        place-items: center;
        pointer-events: none; /* the strip itself never blocks the page underneath... */
      }
      .card {
        pointer-events: auto; /* ...only the cards are clickable */
        cursor: pointer;
        padding: 0;
        font: inherit;
        grid-area: 1 / 1;
        width: 30px;
        height: 44px;
        border-radius: 4px;
        border: 1px solid var(--old-ink);
        background: var(--parchment);
        display: grid;
        place-items: center;
      }
      /* expo-image's tintColor: paint the ink colour through the icon's alpha channel */
      .glyph {
        width: 16.5px;
        height: 16.5px;
        background: var(--old-ink);
        -webkit-mask: var(--icon) center / contain no-repeat;
        mask: var(--icon) center / contain no-repeat;
      }
    `,
  ];
}
customElements.define("card-fan-indicator", CardFanIndicator);
