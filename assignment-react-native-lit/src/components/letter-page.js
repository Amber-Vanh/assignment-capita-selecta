import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { palette } from "../lib/colors.js";
import { pageStyles, fitFont } from "../lib/page-styles.js";
import { historyStore } from "../lib/history-store.js";
import { getLetterText } from "../lib/fortune-data.js";
import { scheduleIdle } from "../lib/idle.js";
import { shareElement } from "../lib/share.js";

const UNFOLD_SOUND_DURATION_MS = 1540;

// Port of letter-page.tsx. The three reanimated shared values (crack, unfold, idleStrain)
// become two booleans driving CSS transitions plus one Web Animations call.
export class LetterPage extends LitElement {
  static properties = {
    active: { type: Boolean },
    letter: { state: true },
    loading: { state: true },
    isOpen: { state: true },
    cracked: { state: true },
    unfolded: { state: true },
    fast: { state: true },
  };

  #soundTimeout = null;
  #unfoldTimeout = null;
  #stopIdle = null;
  #envelope = createRef();
  #capture = createRef();
  #sound = new Audio("/sounds/paper-unfold.mp3");

  constructor() {
    super();
    this.active = false;
    this.letter = null;
    this.loading = false;
    this.isOpen = false;
    this.cracked = false;
    this.unfolded = false;
    this.fast = false;
    this.#sound.preload = "auto";
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.#soundTimeout);
    clearTimeout(this.#unfoldTimeout);
    this.#stopIdle?.();
    this.#sound.pause();
  }

  updated() {
    const isIdle = this.active && !this.isOpen && !this.loading;
    if (isIdle && !this.#stopIdle) {
      this.#stopIdle = scheduleIdle(() => this.#strain(), 3000, 4000);
    } else if (!isIdle && this.#stopIdle) {
      this.#stopIdle();
      this.#stopIdle = null;
    }
  }

  #strain() {
    this.#envelope.value?.animate(
      [
        { transform: "rotate(0) translateY(0)", offset: 0 },
        { transform: "rotate(-1.2deg) translateY(-2px)", offset: 0.24 },
        { transform: "rotate(-0.36deg) translateY(-0.6px)", offset: 0.36 },
        { transform: "rotate(-1.2deg) translateY(-2px)", offset: 0.54 },
        { transform: "rotate(0) translateY(0)", offset: 1 },
      ],
      { duration: 760 },
    );
  }

  async #breakSeal() {
    if (this.loading) return;
    this.loading = true;
    this.fast = false;
    this.cracked = true;

    this.#soundTimeout = setTimeout(() => {
      this.#sound.currentTime = 0;
      this.#sound.play().catch(() => {});
    }, 500);
    // the unfold only starts once the sound has finished, never alongside it
    this.#unfoldTimeout = setTimeout(() => (this.unfolded = true), 500 + UNFOLD_SOUND_DURATION_MS);

    const text = await getLetterText();
    if (!this.isConnected) return;
    this.letter = text;
    this.isOpen = true;
    this.loading = false;
    historyStore.addToHistory("letter", text);
  }

  #reseal() {
    clearTimeout(this.#unfoldTimeout);
    this.fast = true;
    this.cracked = false;
    this.unfolded = false;
    this.isOpen = false;
    this.letter = null;
  }

  #onDoubleTap() {
    if (!this.active) return;
    this.isOpen ? this.#reseal() : this.#breakSeal();
  }

  async #share() {
    try {
      await shareElement(this.#capture.value);
    } catch {
      /* the browser shows its own error UI */
    }
  }

  render() {
    return html`
      <div class="capture" ${ref(this.#capture)}>
        <h1 class="title">The Sealed Letter</h1>
        <div class="stage ${this.fast ? "fast" : ""}" @dblclick=${this.#onDoubleTap}>
          <div class="letter-layer ${this.unfolded ? "unfolded" : ""}">
            <img src="/img/letter-open.png" alt="" />
            ${this.letter
              ? html`<div class="text"><span style="font-size:${fitFont(this.letter)}px">${this.letter}</span></div>`
              : null}
          </div>
          <div class="envelope-layer ${this.cracked ? "cracked" : ""} ${this.unfolded ? "unfolded" : ""}" ${ref(this.#envelope)}>
            <img src="/img/letter-closed.png" alt="Sealed envelope" />
          </div>
        </div>
      </div>
      ${this.isOpen
        ? html`<button class="share" @click=${this.#share}>Share this fortune</button>`
        : html`<p class="hint">${this.loading ? "The seal is cracking..." : "Double-tap the envelope to break the seal"}</p>`}
    `;
  }

  static styles = [
    palette,
    pageStyles,
    css`
      :host { background: var(--old-ink); color: var(--parchment); container-type: size; /* enables cqh below */ }
      .capture { background: var(--old-ink); justify-content: center; }
      .stage {
        position: relative;
        width: calc(var(--w, 100vw) * 1.5);
        height: calc(var(--w, 100vw) * 1.5 * 1.3);
        display: grid;
        place-items: center;
        touch-action: manipulation; /* no double-tap-to-zoom delay on touch */
        user-select: none;
        -webkit-user-select: none;
      }
      .envelope-layer {
        position: absolute;
        width: 100%;
        aspect-ratio: 1;
        transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1);
      }
      .envelope-layer.cracked { transform: scale(0.97); }
      .envelope-layer.unfolded { opacity: 0; }
      .envelope-layer img, .letter-layer img { width: 100%; height: 100%; object-fit: contain; display: block; pointer-events: none; }
      .letter-layer {
        position: absolute;
        /* never wider than 85% of the page, and never taller than the space between the
           title (~150px) and the share button (~150px) */
        width: min(calc(var(--w, 100vw) * 0.85), calc((100cqh - 300px) / 1.3));
        aspect-ratio: 1 / 1.3;
        opacity: 0;
        transform: translateY(20px) scale(0.85);
        transition: opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1), transform 0.5s cubic-bezier(0.33, 1, 0.68, 1);
      }
      .letter-layer.unfolded { opacity: 1; transform: none; }
      .fast .envelope-layer, .fast .letter-layer { transition-duration: 0.25s; }
      .text { position: absolute; top: 22%; bottom: 12%; left: 12%; right: 12%; display: grid; place-items: center; overflow: hidden; }
      .text span { font-family: "HomemadeApple", cursive; line-height: 1.4; text-align: center; color: var(--old-ink); }
    `,
  ];
}
customElements.define("letter-page", LetterPage);
