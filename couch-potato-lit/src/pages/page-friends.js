import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { LightElement } from "../base.js";
import "../components/cp-user-card.js";

class PageFriends extends LightElement {
  static properties = {
    data: { attribute: false },
    query: { state: true },
  };

  constructor() {
    super();
    this.query = "";
  }

  render() {
    const { users, follows, currentUserId } = this.data;
    const { query } = this;

    const otherUsers = users.filter((u) => u.id !== currentUserId);
    const followingIds = new Set(follows.map((f) => f.followingId));

    // Searching looks through everyone; otherwise only people you follow.
    const filtered = query.trim()
      ? otherUsers.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
      : otherUsers.filter((u) => followingIds.has(u.id));

    return html`
      <div>
        <div class="page-header">
          <h2 class="page-header__title">Friends</h2>
        </div>

        <div class="friends-search">
          <input
            class="friends-search__input"
            type="search"
            placeholder="Search people…"
            .value=${query}
            @input=${(e) => (this.query = e.target.value)}
          />
        </div>

        <ul class="user-list" data-testid="friends-list">
          ${repeat(
            filtered,
            (u) => u.id,
            (user) => {
              const follow = follows.find((f) => f.followingId === user.id);
              return html`<li>
                <cp-user-card
                  .user=${user}
                  .isFollowing=${Boolean(follow)}
                  .followId=${follow?.id}
                ></cp-user-card>
              </li>`;
            },
          )}
        </ul>

        ${filtered.length === 0
          ? html`<p class="friends-empty">No results for &ldquo;${query}&rdquo;</p>`
          : ""}
      </div>
    `;
  }
}

customElements.define("page-friends", PageFriends);
