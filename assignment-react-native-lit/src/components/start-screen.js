import { LitElement, html, css } from "lit";
import { palette } from "../lib/colors.js";
import { haptics } from "../lib/haptics.js";

const HOLD_DURATION_MS = 1400;
const FADE_MS = 500;

// Port of app/index.tsx. gesture-handler's Gesture.LongPress().minDuration(1400) becomes a
// timer started on pointerdown. The glow is a CSS transition whose duration IS the hold
// duration, so releasing early simply reverses it (a faster transition back).
export class StartScreen extends LitElement {
  static properties = {
    pressing: { state: true },
    entering: { state: true },
  };

  #holdTimer = null;

  constructor() {
    super();
    this.pressing = false;
    this.entering = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.#holdTimer);
  }

  #down(event) {
    if (this.entering) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    this.pressing = true;
    haptics.impact("light");
    this.#holdTimer = setTimeout(() => this.#complete(), HOLD_DURATION_MS);
  }

  #release() {
    if (this.entering) return;
    clearTimeout(this.#holdTimer);
    this.pressing = false;
  }

  #complete() {
    this.entering = true;
    haptics.success();
    // fade to gold, then replace (not push) so Back never returns to the start screen
    setTimeout(() => location.replace("#/pager"), FADE_MS);
  }

  render() {
    return html`
      <div class="content ${this.entering ? "out" : ""}">
        <header>
          <h1>Fortune Teller</h1>
          <p class="subtitle">Wizarding Edition</p>
        </header>
        <div
          class="candle-area ${this.pressing ? "pressing" : ""}"
          @pointerdown=${this.#down}
          @pointerup=${this.#release}
          @pointercancel=${this.#release}
          @contextmenu=${(e) => e.preventDefault()}
        >
          <img src="/img/candle-unlit.png" alt="Unlit candle" draggable="false" />
          <img class="lit" src="/img/candle-lit.png" alt="" draggable="false" />
        </div>
        <p class="hint">Hold your finger to the candle to light it</p>
      </div>
      <div class="flash ${this.entering ? "on" : ""}"></div>
    `;
  }

  static styles = [
    palette,
    css`
      :host {
        display: block;
        position: relative;
        height: 100%;
        overflow: hidden;
        background: var(--study-wood);
        --gold-translucent: #b8892bc4;
      }
      .content {
        height: 100%;
        display: grid;
        place-items: center;
        transition: opacity ${FADE_MS}ms linear;
      }
      .content.out { opacity: 0; }
      header { position: absolute; top: 96px; left: 0; right: 0; text-align: center; }
      h1 { margin: 0; font: normal min(44px, calc(var(--w, 100vw) * 0.09))/52px "ClimateCrisis", serif; color: var(--gold-translucent); }
      .subtitle {
        margin: 8px 0 0;
        color: var(--parchment);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 3px;
        text-transform: uppercase;
      }
      .candle-area {
        position: relative;
        width: calc(var(--w, 100vw) * 0.8);
        aspect-ratio: 736 / 1308;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        cursor: pointer;
      }
      .candle-area img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
      .lit {
        opacity: 0;
        transition: opacity 300ms linear; /* released early: fade back down */
      }
      .pressing .lit {
        opacity: 1;
        transition: opacity ${HOLD_DURATION_MS}ms cubic-bezier(0.5, 1, 0.89, 1); /* Easing.out(quad) */
      }
      .hint {
        position: absolute; bottom: 48px; left: 0; right: 0; margin: 0; padding: 0 40px;
        color: var(--gold-translucent); font-size: 13px; font-weight: 500;
        letter-spacing: 1.5px; text-align: center; text-transform: uppercase;
      }
      .flash {
        position: absolute; inset: 0; background: var(--gold-translucent);
        opacity: 0; pointer-events: none; transition: opacity ${FADE_MS}ms linear;
      }
      .flash.on { opacity: 1; }
    `,
  ];
}
customElements.define("start-screen", StartScreen);
