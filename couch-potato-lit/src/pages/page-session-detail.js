import { html, nothing } from "lit";
import { LightElement } from "../base.js";
import { CalendarDays, Clock, FileText } from "../icons.js";
import { formatDuration, formatDate } from "../utils.js";
import { back } from "../navigation.js";

class PageSessionDetail extends LightElement {
  static properties = { data: { attribute: false } };

  render() {
    const { session, currentUserId } = this.data;
    const { user, category } = session;
    const isOwn = session.userId === currentUserId;

    return html`
      <div class="form-page">
        <div class="page-header">
          <h2 class="page-header__title">${category.emoji} ${category.name}</h2>
        </div>

        <div class="session-detail__row">
          ${CalendarDays(16)}<span>${formatDate(session.date)}</span>
        </div>
        <div class="session-detail__row">
          ${Clock(16)}
          <span>${formatDuration(session.duration)} (${session.duration} minutes)</span>
        </div>
        ${session.notes
          ? html`<div class="session-detail__row">
              ${FileText(16)}<span>${session.notes}</span>
            </div>`
          : nothing}

        <div class="session-detail__row" style="margin-top: 8px">
          <a href="/users/${user.id}" class="user-card__name">${user.avatar} ${user.name}</a>
        </div>

        <div class="session-detail__actions">
          ${isOwn
            ? html`<a href="/sessions/${session.id}/edit" class="btn btn--primary">Edit</a>`
            : nothing}
          <button type="button" class="btn btn--ghost" @click=${back}>Back</button>
        </div>
      </div>
    `;
  }
}

customElements.define("page-session-detail", PageSessionDetail);
