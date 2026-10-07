import { html } from "lit";
import { LightElement } from "../base.js";
import { createSession } from "../services/sessions.js";
import { getCurrentUserId } from "../services/auth.js";
import { navigate, back } from "../navigation.js";

class PageTrack extends LightElement {
  static properties = { data: { attribute: false } };

  async #onSubmit(e) {
    e.preventDefault();
    const { categoryId, date, duration, notes } = Object.fromEntries(
      new FormData(e.currentTarget),
    );
    await createSession({
      userId: await getCurrentUserId(),
      categoryId,
      date,
      duration: Number(duration),
      notes,
    });
    navigate("/");
  }

  render() {
    const { categories } = this.data;
    // default date = today
    const today = new Date().toISOString().slice(0, 10);

    return html`
      <div class="form-page">
        <h2 class="form-page__title">Log a Session</h2>
        <form class="session-form" @submit=${this.#onSubmit}>
          <div class="form-group">
            <label for="categoryId">Category</label>
            <select id="categoryId" name="categoryId" class="form-select" required>
              ${categories.map(
                (cat) => html`<option value=${cat.id}>${cat.emoji} ${cat.name}</option>`,
              )}
            </select>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input id="date" name="date" type="date" .value=${today} required />
          </div>
          <div class="form-group">
            <label for="duration">Duration (minutes)</label>
            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              placeholder="e.g. 90"
              required
            />
          </div>
          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="What did you watch / play / do?"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn--primary">Log it</button>
            <button type="button" class="btn btn--ghost" @click=${back}>Cancel</button>
          </div>
        </form>
      </div>
    `;
  }
}

customElements.define("page-track", PageTrack);
