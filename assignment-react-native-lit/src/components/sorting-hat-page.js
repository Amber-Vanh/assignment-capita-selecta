import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { palette } from "../lib/colors.js";
import { pageStyles } from "../lib/page-styles.js";
import { haptics } from "../lib/haptics.js";
import { historyStore } from "../lib/history-store.js";
import { verifyUser } from "../lib/biometric.js";
import { speak, stopSpeaking } from "../lib/speech.js";
import { getSortingHatReading } from "../lib/fortune-data.js";
import { scheduleIdle } from "../lib/idle.js";
import { shareElement } from "../lib/share.js";

// Port of sorting-hat-page.tsx.
export class SortingHatPage extends LitElement {
  static properties = {
    active: { type: Boolean },
    reading: { state: true },
    isThinking: { state: true },
    statusMessage: { state: true },
    canSkipBiometrics: { state: true },
  };

  #readingTimeout = null;
  #stopIdle = null;
  #wrap = createRef();
  #capture = createRef();

  constructor() {
    super();
    this.active = false;
    this.reading = null;
    this.isThinking = false;
    this.statusMessage = null;
    this.canSkipBiometrics = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.#readingTimeout);
    this.#stopIdle?.();
    stopSpeaking();
  }

  updated() {
    // idle bow: re-evaluated after every render, started/stopped by the same condition
    const isIdle = this.active && !this.isThinking && !this.reading;
    if (isIdle && !this.#stopIdle) {
      this.#stopIdle = scheduleIdle(() => this.#bow(), 4000, 5000);
    } else if (!isIdle && this.#stopIdle) {
      this.#stopIdle();
      this.#stopIdle = null;
    }
  }

  #bow() {
    this.#wrap.value?.animate(
      [
        { transform: "translateY(0) rotate(0) scaleY(1)", offset: 0 },
        { transform: "translateY(6px) rotate(4deg) scaleY(0.96)", offset: 0.33 },
        { transform: "translateY(6px) rotate(4deg) scaleY(0.96)", offset: 0.57 },
        { transform: "translateY(0) rotate(0) scaleY(1)", offset: 1 },
      ],
      { duration: 2100, easing: "ease-in-out" },
    );
  }

  async #beginReading(event, skipBiometrics = false) {
    // a tap on the share button must not start a new reading
    if (event?.composedPath().some((el) => el.tagName === "BUTTON") && !skipBiometrics) return;
    if (this.isThinking || !this.active) return;
    this.statusMessage = null;

    if (!skipBiometrics) {
      const result = await verifyUser();
      if (!result.ok) {
        this.statusMessage = result.message;
        this.canSkipBiometrics = !!result.unavailable;
        return;
      }
    }
    if (!this.isConnected) return;

    this.canSkipBiometrics = false;
    this.isThinking = true;
    this.reading = null;
    haptics.impact("light");

    this.#readingTimeout = setTimeout(async () => {
      const pick = await getSortingHatReading();
      if (!this.isConnected) return;
      haptics.success();
      this.reading = pick;
      this.isThinking = false;
      speak(pick);
      historyStore.addToHistory("hat", pick);
    }, 1600);
  }

  async #share() {
    try {
      await shareElement(this.#capture.value);
    } catch {
      this.statusMessage = "Couldn't share your fortune.";
    }
  }

  render() {
    return html`
      <div class="page" @click=${this.#beginReading}>
        <div class="capture" ${ref(this.#capture)}>
          <h1 class="title">The Sorting Hat</h1>
          <div class="hat-area">
            <div class="wrap ${this.isThinking ? "thinking" : ""}" ${ref(this.#wrap)}>
              <img class="hat ${this.isThinking || this.reading ? "lifted" : ""}" src="/img/sorting-hat.png" alt="The Sorting Hat" />
            </div>
          </div>
          ${this.reading ? html`<div class="reveal badge"><span>${this.reading}</span></div>` : null}
        </div>
        ${this.reading
          ? html`<button class="share" @click=${this.#share}>Share this fortune</button>`
          : html`<p class="hint">
                ${this.isThinking ? "The Hat is thinking..." : (this.statusMessage ?? "Tap the screen to let the Sorting Hat read you.")}
              </p>
              ${this.canSkipBiometrics && !this.isThinking
                ? html`<button class="skip" @click=${(e) => (e.stopPropagation(), this.#beginReading(null, true))}>
                    Read me anyway
                  </button>`
                : null}`}
      </div>
    `;
  }

  static styles = [
    palette,
    pageStyles,
    css`
      :host { background: var(--parchment); color: var(--study-wood); }
      .page { height: 100%; cursor: pointer; }
      .capture { background: var(--parchment); }
      .hat-area { flex: 1; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 50px; }
      .wrap { transform-origin: 50% 80%; }
      .wrap.thinking { animation: pulsate 1s ease-in-out infinite; }
      @keyframes pulsate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.04); }
      }
      .hat {
        display: block;
        width: calc(var(--w, 100vw) * 1.4);
        aspect-ratio: 1;
        object-fit: contain;
        transform-origin: 50% 80%;
        transition: transform 0.9s cubic-bezier(0.33, 1, 0.68, 1); /* brim lift */
      }
      .hat.lifted { transform: scaleY(1.06); }
      .badge {
        position: absolute;
        top: 65%;
        left: 32px;
        right: 32px;
        padding: 20px 28px;
        transform: rotate(-5deg);
        animation: appear 0.4s ease-out both;
      }
      .badge span { font: 18px/1.3 "BebasNeue", sans-serif; letter-spacing: 1px; text-align: center; color: var(--old-ink); }
      @keyframes appear { from { opacity: 0; } }
      button.skip {
        position: absolute; bottom: 20px; right: 12px; padding: 8px 12px;
        font: 600 10px system-ui, sans-serif; letter-spacing: 1px; text-transform: uppercase;
        color: inherit; background: none; border: 1px solid currentColor; border-radius: 8px; opacity: 0.7;
      }
    `,
  ];
}
customElements.define("sorting-hat-page", SortingHatPage);
