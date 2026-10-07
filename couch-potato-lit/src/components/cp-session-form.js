import { html } from "lit";
import { LightElement } from "../base.js";
import { back } from "../navigation.js";

// Light-DOM form that fires `session-submit` with the form values instead of
// posting to a route action. The page decides what to do with them.
class CpSessionForm extends LightElement {
  static properties = {
    session: { attribute: false },
    submitLabel: { attribute: "submit-label" },
  };

  constructor() {
    super();
    this.submitLabel = "Save";
  }

  #onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    this.dispatchEvent(
      new CustomEvent("session-submit", {
        detail: Object.fromEntries(formData),
        bubbles: true,
      }),
    );
  }

  render() {
    const s = this.session;
    return html`
      <form class="session-form" @submit=${this.#onSubmit}>
        <div class="form-group">
          <label for="date">Date</label>
          <input type="date" id="date" name="date" required .value=${s?.date ?? ""} />
        </div>
        <div class="form-group">
          <label for="duration">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            required
            min="1"
            .value=${String(s?.duration ?? "")}
          />
        </div>
        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea id="notes" name="notes" rows="4" .value=${s?.notes ?? ""}></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">${this.submitLabel}</button>
          <button type="button" class="btn btn--ghost" @click=${back}>Cancel</button>
        </div>
      </form>
    `;
  }
}

customElements.define("cp-session-form", CpSessionForm);
