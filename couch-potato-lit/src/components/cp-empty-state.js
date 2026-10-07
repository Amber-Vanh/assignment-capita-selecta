import { html, nothing } from "lit";
import { LightElement } from "../base.js";

class CpEmptyState extends LightElement {
  static properties = {
    icon: { attribute: false },
    title: {},
    message: {},
    testId: { attribute: "test-id" },
  };

  render() {
    return html`
      <div class="empty-state" data-testid=${this.testId ?? nothing}>
        ${this.icon ? html`<div class="empty-state__icon">${this.icon}</div>` : nothing}
        <p class="empty-state__title">${this.title}</p>
        ${this.message ? html`<p class="empty-state__message">${this.message}</p>` : nothing}
      </div>
    `;
  }
}

customElements.define("cp-empty-state", CpEmptyState);
