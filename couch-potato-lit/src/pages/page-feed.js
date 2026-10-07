import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { LightElement } from "../base.js";
import { Rss } from "../icons.js";
import "../components/cp-feed-item.js";
import "../components/cp-empty-state.js";

class PageFeed extends LightElement {
  static properties = { data: { attribute: false } };

  render() {
    const { feedSessions } = this.data;

    if (feedSessions.length === 0) {
      return html`<cp-empty-state
        .icon=${Rss(44)}
        title="Nothing here yet"
        message="Follow friends to see their lazy sessions."
        test-id="empty-feed"
      ></cp-empty-state>`;
    }

    return html`
      <div class="feed" data-testid="feed">
        ${repeat(
          feedSessions,
          (s) => s.id,
          (s) => html`<cp-feed-item .session=${s}></cp-feed-item>`,
        )}
      </div>
    `;
  }
}

customElements.define("page-feed", PageFeed);
