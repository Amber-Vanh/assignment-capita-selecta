import { html } from "lit";
import { LightElement } from "../base.js";
import { updateSession } from "../services/sessions.js";
import { navigate } from "../navigation.js";
import "../components/cp-session-form.js";

class PageEditSession extends LightElement {
  static properties = { data: { attribute: false } };

  async #onSubmit({ detail }) {
    const { session, currentUserId } = this.data;
    await updateSession({
      id: session.id,
      date: detail.date,
      duration: Number(detail.duration),
      notes: detail.notes,
    });
    navigate(`/users/${currentUserId}`);
  }

  render() {
    return html`
      <div class="form-page">
        <h2 class="form-page__title">Edit Session</h2>
        <cp-session-form
          .session=${this.data.session}
          submit-label="Save"
          @session-submit=${this.#onSubmit}
        ></cp-session-form>
      </div>
    `;
  }
}

customElements.define("page-edit-session", PageEditSession);
