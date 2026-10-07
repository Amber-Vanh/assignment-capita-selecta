import { html, nothing } from "lit";
import { LightElement } from "../base.js";
import { formatDuration, formatDate } from "../utils.js";

class CpFeedItem extends LightElement {
  static properties = { session: { attribute: false } };

  render() {
    const { session } = this;
    const { user, category } = session;
    return html`
      <a
        href="/sessions/${session.id}"
        class="feed-item"
        data-testid="feed-item-${session.id}"
      >
        <div class="feed-item__header">
          <div class="feed-item__avatar">${user.avatar}</div>
          <div class="feed-item__meta">
            <div class="feed-item__user-name" data-testid="feed-user-${session.id}">
              ${user.name}
            </div>
            <div class="feed-item__date">${formatDate(session.date)}</div>
          </div>
          <span class="feed-item__category-badge" data-testid="feed-category-${session.id}">
            ${category.emoji} ${category.name}
          </span>
        </div>
        <div class="feed-item__duration">
          ${formatDuration(session.duration)}
          <span class="feed-item__duration-label">of glorious laziness</span>
        </div>
        ${session.notes
          ? html`<div class="feed-item__notes">${session.notes}</div>`
          : nothing}
      </a>
    `;
  }
}

customElements.define("cp-feed-item", CpFeedItem);
