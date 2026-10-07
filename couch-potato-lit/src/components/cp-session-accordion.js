import { html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { LightElement } from "../base.js";
import { formatDuration, formatDate } from "../utils.js";
import { CalendarDays, Clock, FileText, ChevronDown, ChevronUp } from "../icons.js";

class CpSessionAccordion extends LightElement {
  static properties = {
    sessions: { attribute: false },
    currentUserId: {},
    expandedId: { state: true },
  };

  constructor() {
    super();
    this.expandedId = null;
  }

  #toggle(id) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  #detail(session) {
    return html`
      <div class="session-accordion__detail" data-testid="session-detail-${session.id}">
        <div class="session-detail__duration">${formatDuration(session.duration)}</div>
        <div class="session-detail__row">
          ${CalendarDays(16)}<span>${formatDate(session.date)}</span>
        </div>
        <div class="session-detail__row">
          ${Clock(16)}<span>${session.duration} minutes</span>
        </div>
        ${session.notes
          ? html`<div class="session-detail__row">
              ${FileText(16)}<span>${session.notes}</span>
            </div>`
          : nothing}
        ${session.userId === this.currentUserId
          ? html`<div class="session-detail__actions">
              <a href="/sessions/${session.id}/edit" class="btn btn--ghost">Edit</a>
            </div>`
          : nothing}
      </div>
    `;
  }

  render() {
    if (!this.sessions || this.sessions.length === 0) return nothing;

    return html`
      <ul class="session-list" data-testid="session-list">
        ${repeat(
          this.sessions,
          (s) => s.id,
          (session) => {
            const isOpen = this.expandedId === session.id;
            return html`
              <li class="session-accordion__item">
                <button
                  type="button"
                  class="session-item session-accordion__summary ${isOpen ? "active" : ""}"
                  data-testid="session-item-${session.id}"
                  aria-expanded=${isOpen}
                  @click=${() => this.#toggle(session.id)}
                >
                  <span class="session-item__date">${formatDate(session.date)}</span>
                  <span class="session-item__right">
                    <span class="session-item__duration">${formatDuration(session.duration)}</span>
                    ${isOpen ? ChevronUp(16) : ChevronDown(16)}
                  </span>
                </button>
                ${isOpen ? this.#detail(session) : nothing}
              </li>
            `;
          },
        )}
      </ul>
    `;
  }
}

customElements.define("cp-session-accordion", CpSessionAccordion);
