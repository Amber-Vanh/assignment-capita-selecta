import { LitElement, html, css } from "lit";
import "./start-screen.js";
import "./fortune-pager.js";
import "./history-screen.js";
import "./entry-detail.js";

// Replaces expo-router's Stack: Lit has no router, so a hash router is a few lines.
// (@lit-labs/router or Vaadin Router would be the library route.)
//   #/            start screen
//   #/pager       the three looping pages (stays mounted underneath History, like RN)
//   #/history     History
//   #/entry/<id>  one fortune
export class FortuneApp extends LitElement {
  static properties = { route: { state: true }, pagerVisited: { state: true } };

  constructor() {
    super();
    this.pagerVisited = false;
    this._onHash = () => this.#sync();
    this.#sync();
  }

  #sync() {
    this.route = location.hash.replace(/^#/, "") || "/";
    if (this.route !== "/") this.pagerVisited = true;
  }

  connectedCallback() {
    super.connectedCallback();
    addEventListener("hashchange", this._onHash);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener("hashchange", this._onHash);
  }

  render() {
    const entryId = this.route.startsWith("/entry/") ? decodeURIComponent(this.route.slice(7)) : null;
    const overlay =
      entryId !== null
        ? html`<entry-detail class="overlay" .entryId=${entryId}></entry-detail>`
        : this.route === "/history"
          ? html`<history-screen class="overlay"></history-screen>`
          : null;

    if (this.route === "/") return html`<start-screen></start-screen>`;

    // visibility (not display:none) keeps the pager's scroll position while History is open
    return html`<fortune-pager
        class=${overlay ? "hidden" : ""}
        .focused=${!overlay}
      ></fortune-pager>
      ${overlay}`;
  }

  static styles = css`
    :host { display: block; height: 100%; position: relative; overflow: hidden; }
    .hidden { visibility: hidden; }
    .overlay { position: absolute; inset: 0; z-index: 20; }
  `;
}
customElements.define("fortune-app", FortuneApp);
