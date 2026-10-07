import { LitElement, html, css } from "lit";
import { palette } from "../lib/colors.js";
import { historyStore } from "../lib/history-store.js";
import { routeBack } from "../lib/page-styles.js";

const ICONS = { potion: "/img/potion-of-truth.png", hat: "/img/sorting-hat.png", letter: "/img/letter-closed.png" };

const dayLabel = (ts) => {
  const d = new Date(ts).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  if (d === today) return "Today";
  if (d === today - 86_400_000) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
};

// Port of history.tsx. useFocusEffect + useMemo + FlatList -> a store
// subscription and a getter; the browser's own list rendering is fine for this size.
export class HistoryScreen extends LitElement {
  static properties = { entries: { state: true } };

  constructor() {
    super();
    this.entries = historyStore.entries;
    this._onChange = () => (this.entries = historyStore.entries);
  }

  connectedCallback() {
    super.connectedCallback();
    // "focus" = the element being connected: the router creates a fresh one each visit
    this.entries = historyStore.entries;
    historyStore.addEventListener("change", this._onChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    historyStore.removeEventListener("change", this._onChange);
  }

  // recomputed per render; cheap, so no useMemo equivalent is needed
  get #groups() {
    const groups = new Map();
    for (const e of this.entries) {
      const label = dayLabel(e.timestamp);
      groups.set(label, [...(groups.get(label) ?? []), e]);
    }
    return [...groups];
  }

  #clear() {
    if (confirm("Clear the whole history?")) historyStore.clearHistory();
  }

  render() {
    return html`
      <header>
        <button class="back" @click=${() => routeBack("#/pager")} aria-label="Back"><img src="/img/broom.png" alt="" /></button>
        <h1>History</h1>
        ${this.entries.length ? html`<button @click=${this.#clear}>Clear</button>` : null}
      </header>
      ${this.entries.length === 0
        ? html`<div class="empty">
            <img src="/img/basin.png" alt="" />
            <p>Nothing here yet — try one of the three on the other side</p>
          </div>`
        : this.#groups.map(
            ([label, items]) => html`
              <h2>${label}</h2>
              ${items.map(
                (e) => html`<a class="entry" href="#/entry/${e.id}">
                  <img class="icon" src=${ICONS[e.type]} alt="" />
                  <span class="type">${e.type}</span>
                  <p>${e.text}</p>
                  ${e.question ? html`<small>“${e.question}”</small>` : null}
                  <time>${new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                </a>`,
              )}
            `,
          )}
    `;
  }

  static styles = [
    palette,
    css`
      :host { display: block; height: 100%; overflow-y: auto; background: var(--spectral-navy); color: var(--pensieve-silver-blue); padding: 0 20px 40px; }
      header { display: flex; align-items: center; gap: 12px; padding-top: 56px; }
      header img { height: 40px; display: block; }
      button.back { padding: 8px; border: 0; }
      h1 { flex: 1; margin: 0; font: 28px "ClimateCrisis", serif; }
      h2 { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; margin: 28px 0 8px; }
      button { color: inherit; background: none; border: 1px solid currentColor; border-radius: 8px; padding: 6px 12px; cursor: pointer; }
      a.entry { display: block; text-decoration: none; position: relative; padding: 20px 32px 20px 72px; margin-bottom: 10px; border-radius: 6px; color: var(--old-ink); background: url("/img/parchment.png") center / 100% 100%; }
      a.entry p { margin: 0; font: 20px "BebasNeue", sans-serif; letter-spacing: 1px; }
      a.entry small { font-family: "HomemadeApple", cursive; }
      .icon { position: absolute; left: 28px; top: 50%; width: 32px; height: 32px; margin-top: -16px; object-fit: contain; }
      .type { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.6; }
      time { position: absolute; top: 18px; right: 30px; font-size: 11px; opacity: 0.6; }
      .empty { text-align: center; margin-top: 80px; opacity: 0.8; }
      .empty img { width: 70%; }
    `,
  ];
}
customElements.define("history-screen", HistoryScreen);
