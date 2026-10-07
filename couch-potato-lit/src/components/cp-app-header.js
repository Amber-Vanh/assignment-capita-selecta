import { html } from "lit";
import { LightElement } from "../base.js";
import { User } from "../icons.js";

class CpAppHeader extends LightElement {
  static properties = { currentUser: { attribute: false } };

  render() {
    const user = this.currentUser;
    return html`
      <header class="app-header">
        <div class="app-header__brand">
          <a href="/" class="app-header__title">Couch Potato</a>
        </div>
        <a
          href="/users/${user?.id}"
          class="app-header__me"
          data-testid="nav-profile"
          aria-label="My profile"
        >
          ${user
            ? html`<span class="app-header__avatar">${user.avatar}</span>`
            : User(22)}
          <span>Me</span>
        </a>
      </header>
    `;
  }
}

customElements.define("cp-app-header", CpAppHeader);
