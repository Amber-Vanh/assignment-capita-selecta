import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { palette } from "../lib/colors.js";
import { pageStyles, fitFont, routeBack } from "../lib/page-styles.js";
import { historyStore } from "../lib/history-store.js";
import { shareElement } from "../lib/share.js";

// Port of app/entry/[id].tsx. `useLocalSearchParams` -> an `entryId` property set by the router.
export class EntryDetail extends LitElement {
  static properties = { entryId: { type: String }, shareError: { state: true } };

  #capture = createRef();

  constructor() {
    super();
    this.entryId = "";
    this._onChange = () => this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    historyStore.addEventListener("change", this._onChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    historyStore.removeEventListener("change", this._onChange);
  }

  async #share() {
    try {
      await shareElement(this.#capture.value);
    } catch {
      this.shareError = true;
    }
  }

  #recreation(entry) {
    if (entry.type === "potion") {
      const isYes = entry.text.trim().toLowerCase().startsWith("yes");
      return html`<div class="recreation potion">
        <h1 class="title">Potion of Truth</h1>
        <div class="vial-area">
          <img class="vial" src="/img/potion-of-truth-${isYes ? "green" : "red"}.png" alt="" />
          <div class="reveal potion-badge ${isYes ? "yes" : "no"}"><span>${entry.text}</span></div>
        </div>
        ${entry.question ? html`<p class="question">“${entry.question}”</p>` : null}
      </div>`;
    }
    if (entry.type === "hat") {
      return html`<div class="recreation hat">
        <h1 class="title">The Sorting Hat</h1>
        <div class="center"><img class="hat-img" src="/img/sorting-hat.png" alt="" /></div>
        <div class="reveal hat-badge"><span>${entry.text}</span></div>
      </div>`;
    }
    return html`<div class="recreation letter">
      <h1 class="title">The Sealed Letter</h1>
      <div class="center">
        <div class="letter-stage">
          <img src="/img/letter-open.png" alt="" />
          <div class="text"><span style="font-size:${fitFont(entry.text)}px">${entry.text}</span></div>
        </div>
      </div>
    </div>`;
  }

  render() {
    const entry = historyStore.entries.find((e) => e.id === this.entryId);
    if (!entry) {
      return html`<div class="not-found">
        <p>This fortune could not be found.</p>
        <button class="back" @click=${() => routeBack("#/history")}><img src="/img/broom.png" alt="Back" /></button>
      </div>`;
    }
    return html`
      <div class="capture" ${ref(this.#capture)}>${this.#recreation(entry)}</div>
      <button class="back" @click=${() => routeBack("#/history")}><img src="/img/broom.png" alt="Back" /></button>
      <button class="share-nav" @click=${this.#share}>${this.shareError ? "Couldn't share" : "Share this fortune"}</button>
    `;
  }

  static styles = [
    palette,
    pageStyles,
    css`
      :host { background: var(--spectral-navy); color: var(--pensieve-silver-blue); container-type: size; }
      .capture { height: 100%; }
      .recreation { position: relative; height: 100%; display: flex; flex-direction: column; align-items: center; }
      .recreation.potion { background: var(--study-wood); color: var(--candlelight-gold); }
      .recreation.hat { background: var(--parchment); color: var(--study-wood); }
      .recreation.letter { background: var(--old-ink); color: var(--parchment); }
      .title { top: 150px; }
      .center { flex: 1; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 130px; }

      .vial-area { position: relative; width: 100%; margin-top: 236px; display: grid; place-items: center; }
      .vial { width: 95%; aspect-ratio: 1; object-fit: contain; }
      .potion-badge { position: absolute; right: 16%; top: 40%; padding: 16px 24px; }
      .potion-badge.yes { --c: var(--potion-emerald); transform: rotate(6deg); }
      .potion-badge.no { --c: var(--potion-crimson); transform: rotate(-8deg); }
      .potion-badge span { font: 32px "BebasNeue", sans-serif; letter-spacing: 2px; text-transform: uppercase; color: var(--c); }
      .question { font: 22px/1.4 "HomemadeApple", cursive; text-align: center; padding: 0 40px; margin: 24px 0 0; }

      .hat-img { width: calc(var(--w, 100vw) * 1.4); aspect-ratio: 1; object-fit: contain; }
      .hat-badge { position: absolute; top: 65%; left: 32px; right: 32px; padding: 20px 28px; transform: rotate(-5deg); }
      .hat-badge span { font: 18px/1.3 "BebasNeue", sans-serif; letter-spacing: 1px; text-align: center; color: var(--old-ink); }

      .letter-stage { position: relative; width: min(calc(var(--w, 100vw) * 0.85), calc((100cqh - 360px) / 1.3)); aspect-ratio: 1 / 1.3; }
      .letter-stage img { width: 100%; height: 100%; object-fit: contain; display: block; }
      .text { position: absolute; top: 22%; bottom: 12%; left: 12%; right: 12%; display: grid; place-items: center; overflow: hidden; }
      .text span { font-family: "HomemadeApple", cursive; line-height: 1.4; text-align: center; color: var(--old-ink); }

      button.back { position: absolute; top: 60px; left: 16px; padding: 12px; background: none; border: 0; cursor: pointer; }
      button.back img { width: 99px; display: block; }
      button.share-nav {
        position: absolute; bottom: 48px; left: 24px; right: 24px; padding: 14px;
        font: 600 12px system-ui, sans-serif; letter-spacing: 1px; text-transform: uppercase;
        color: var(--pensieve-silver-blue); background: var(--spectral-navy);
        border: 1px solid currentColor; border-radius: 8px; cursor: pointer;
      }
      .not-found { height: 100%; display: grid; place-content: center; text-align: center; padding: 0 30px; }
    `,
  ];
}
customElements.define("entry-detail", EntryDetail);
