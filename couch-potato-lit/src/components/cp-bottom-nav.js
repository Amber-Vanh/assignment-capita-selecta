import { html } from "lit";
import { LightElement } from "../base.js";
import { Rss, Plus, Users } from "../icons.js";

class CpBottomNav extends LightElement {
  static properties = { path: {} };

  #item(href, label, icon, testId, extraClass = "") {
    const active = href === "/" ? this.path === "/" : this.path?.startsWith(href);
    return html`
      <a
        href=${href}
        class="bottom-nav__item ${extraClass} ${active ? "active" : ""}"
        data-testid=${testId}
      >
        ${icon}
        <span>${label}</span>
      </a>
    `;
  }

  render() {
    return html`
      <nav class="bottom-nav" data-testid="bottom-nav">
        ${this.#item("/", "Feed", Rss(22), "nav-feed")}
        ${this.#item("/track", "Track", Plus(26), "nav-track", "bottom-nav__item--track")}
        ${this.#item("/friends", "Friends", Users(22), "nav-friends")}
      </nav>
    `;
  }
}

customElements.define("cp-bottom-nav", CpBottomNav);
