import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { palette } from "../lib/colors.js";
import { haptics } from "../lib/haptics.js";
import { historyStore } from "../lib/history-store.js";
import { requestMotionPermission, shakeSupported, startShakeDetection } from "../lib/shake.js";
import { shareElement } from "../lib/share.js";
import { pageStyles } from "../lib/page-styles.js";

const SWIRL_MS = 1320; // 6 turns x 220ms, same as the reanimated withRepeat
const SWIRL_SOUND = new URL("/sounds/potion-swirl.mp3", import.meta.url).href;

// Port of src/components/potion-page.tsx (372 lines of TSX).
// No hooks, no dependency arrays: state is class fields, lifecycle is callbacks.
export class PotionPage extends LitElement {
  static properties = {
    active: { type: Boolean }, // replaces the `isActive` prop
    result: { state: true }, // "yes" | "no" | null
    isSwirling: { state: true },
    question: { state: true },
    needsPermission: { state: true },
    shareStatus: { state: true },
  };

  #stopShake = null;
  #revealTimeout = null;
  #captureRef = createRef();
  #sound = new Audio(SWIRL_SOUND); // "preload": the element starts fetching immediately

  constructor() {
    super();
    this.active = true;
    this.result = null;
    this.isSwirling = false;
    this.question = "";
    this.needsPermission = false;
    this.shareStatus = "";
    this.#sound.preload = "auto";
  }

  // --- lifecycle: one place for everything the RN version spreads over 4 useEffects ---

  connectedCallback() {
    super.connectedCallback();
    // iOS: motion data needs a permission tap first.
    this.needsPermission = typeof window.DeviceMotionEvent?.requestPermission === "function";
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // replaces the isMountedRef + cleanup effect
    this.#stopShake?.();
    clearTimeout(this.#revealTimeout);
    this.#sound.pause();
  }

  updated(changed) {
    // runs after render, only when `active` actually changed: no deps array to get wrong
    if (changed.has("active")) this.#syncShakeListener();
  }

  #syncShakeListener() {
    this.#stopShake?.();
    this.#stopShake = null;
    if (this.active && !this.needsPermission && shakeSupported()) {
      this.#stopShake = startShakeDetection(() => this.#activate());
    }
  }

  async #enableMotion() {
    const granted = await requestMotionPermission();
    this.needsPermission = !granted;
    this.#syncShakeListener();
  }

  // --- behaviour ---

  #activate() {
    if (this.isSwirling) return;
    this.isSwirling = true;
    this.result = null;
    haptics.impact("medium");
    this.#sound.currentTime = 0;
    this.#sound.play().catch(() => {}); // blocked if there was never a user gesture

    const outcome = Math.random() < 0.5 ? "yes" : "no";
    this.#revealTimeout = setTimeout(() => {
      outcome === "yes" ? haptics.success() : haptics.warning();
      this.result = outcome;
      this.isSwirling = false;
      historyStore.addToHistory("potion", outcome === "yes" ? "Yes." : "No.", this.question.trim() || undefined);
    }, SWIRL_MS);
  }

  async #share() {
    try {
      const how = await shareElement(this.#captureRef.value);
      this.shareStatus = how === "downloaded" ? "Saved as fortune.png" : "";
    } catch {
      this.shareStatus = "Couldn't share your fortune.";
    }
  }

  render() {
    const vialSrc = this.result === "yes" ? "green" : this.result === "no" ? "red" : "";
    const src = `/img/potion-of-truth${vialSrc && "-" + vialSrc}.png`;
    const q = this.question.trim();

    return html`
      <div class="capture" ${ref(this.#captureRef)}>
        <h1 class="title">Potion of Truth</h1>
        <div class="vial-area">
          <img class="vial ${this.isSwirling ? "swirling" : this.result ? "" : "idle"}" src=${src} alt="Potion vial" />
          ${this.result
            ? html`<div class="badge ${this.result}"><span>${this.result === "yes" ? "Yes." : "No."}</span></div>`
            : null}
        </div>
        ${this.result && q ? html`<p class="question">“${q}”</p>` : null}
      </div>

      ${!this.result
        ? html`<input
            placeholder="Ask a yes-or-no question..."
            maxlength="140"
            .value=${this.question}
            ?disabled=${this.isSwirling}
            @input=${(e) => (this.question = e.target.value)}
            @keydown=${(e) => e.key === "Enter" && e.target.blur()}
          />`
        : null}

      ${this.result
        ? html`<button class="outline" @click=${this.#share}>Share this fortune</button>
            <p class="status">${this.shareStatus}</p>`
        : html`<p class="hint">
              ${this.needsPermission
                ? html`<button class="outline small" @click=${this.#enableMotion}>Enable shake</button>`
                : "Ask your question and then shake the phone for your answer"}
            </p>
            <!-- laptops have no accelerometer: tap the vial instead -->
            <button class="outline small fallback" @click=${this.#activate} ?disabled=${this.isSwirling}>
              Shake with a click
            </button>`}
    `;
  }

  static styles = [
    palette,
    pageStyles,
    css`
      :host {
        background: var(--study-wood);
        color: var(--candlelight-gold);
      }
      .capture {
        background: var(--study-wood);
      }
      .vial-area {
        position: relative;
        width: 100%;
        margin-top: 190px;
        display: grid;
        place-items: center;
      }
      .vial {
        width: 95%;
        aspect-ratio: 1;
        object-fit: contain;
        transition: opacity 0.3s; /* expo-image's transition={300} */
      }

      /* reanimated withRepeat/withSequence -> CSS keyframes (compositor-friendly: only transform) */
      .idle {
        animation: breathe 4.4s ease-in-out infinite;
      }
      @keyframes breathe {
        0%, 100% { transform: rotate(0) translateY(0); }
        25% { transform: rotate(1.5deg) translateY(-3px); }
        75% { transform: rotate(-1.5deg) translateY(3px); }
      }
      .swirling {
        animation: swirl 220ms linear 6; /* 6 iterations = 1320ms */
      }
      @keyframes swirl {
        from { transform: rotate(0) scale(1); }
        50% { transform: rotate(180deg) scale(1.05); }
        to { transform: rotate(360deg) scale(1); }
      }

      .badge {
        position: absolute;
        right: 14%;
        top: 40%;
        width: 120px;
        height: 80px;
        display: grid;
        place-items: center;
        background: url("/img/parchment.png") center / 100% 100%;
        filter: drop-shadow(2px 3px 4px rgb(0 0 0 / 0.4));
        animation: pop 0.5s cubic-bezier(0.34, 1.8, 0.64, 1) both; /* spring -> overshoot easing */
      }
      .badge.yes { --c: var(--potion-emerald); transform: rotate(6deg); }
      .badge.no { --c: var(--potion-crimson); transform: rotate(-8deg); }
      .badge span {
        font: 32px "BebasNeue", sans-serif;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--c);
      }
      @keyframes pop {
        from { scale: 0; }
        to { scale: 1; }
      }

      .question {
        font: 22px/1.4 "HomemadeApple", cursive;
        text-align: center;
        padding: 0 40px;
        margin: 24px 0 0;
      }
      input {
        position: absolute;
        left: 7.5%;
        width: 85%;
        bottom: 170px;
        padding: 10px 16px;
        font-size: 16px; /* >=16px stops iOS Safari zooming on focus */
        color: var(--candlelight-gold);
        background: var(--study-wood);
        border: 1px solid var(--candlelight-gold);
        border-radius: 8px;
      }
      input::placeholder { color: #b8892b99; }

      .hint, .status {
        position: absolute;
        bottom: 88px;
        left: 0;
        right: 0;
        margin: 0;
        padding: 0 40px;
        text-align: center;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .status { bottom: 40px; font-size: 11px; }

      button.outline {
        position: absolute;
        bottom: 80px;
        left: 40px;
        right: 40px;
        padding: 14px;
        font: 600 12px system-ui, sans-serif;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--candlelight-gold);
        background: none;
        border: 1px solid var(--candlelight-gold);
        border-radius: 8px;
        cursor: pointer;
      }
      button.small { position: static; padding: 10px 16px; }
      button.fallback { position: absolute; bottom: 20px; left: auto; right: 12px; opacity: 0.7; font-size: 10px; }
      button:disabled { opacity: 0.4; }

      @media (prefers-reduced-motion: reduce) {
        .idle, .swirling { animation: none; }
      }
    `,
  ];
}
customElements.define("potion-page", PotionPage);
