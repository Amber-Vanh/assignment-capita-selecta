import { html, nothing } from "lit";
import { LightElement } from "../base.js";
import { createFollow, deleteFollow } from "../services/follows.js";
import { getCurrentUserId } from "../services/auth.js";
import { reload } from "../navigation.js";

class CpUserCard extends LightElement {
  static properties = {
    user: { attribute: false },
    subText: { attribute: "sub-text" },
    isFollowing: { type: Boolean, attribute: "is-following" },
    followId: { attribute: "follow-id" },
    // true while a follow/unfollow request is in flight (optimistic UI)
    pending: { state: true },
  };

  constructor() {
    super();
    this.pending = null;
  }

  async #toggle() {
    const following = this.pending ?? this.isFollowing;
    // Flip the button immediately, then sync with the server.
    this.pending = !following;
    if (following) {
      await deleteFollow(this.followId);
    } else {
      await createFollow({
        followerId: await getCurrentUserId(),
        followingId: this.user.id,
      });
    }
    await reload();
    this.pending = null;
  }

  render() {
    const { user } = this;
    const following = this.pending ?? this.isFollowing;
    return html`
      <div class="user-card" data-testid="user-card-${user.id}">
        <div class="user-card__avatar">${user.avatar}</div>
        <div class="user-card__info">
          <a href="/users/${user.id}" class="user-card__name">${user.name}</a>
          ${this.subText ? html`<div class="user-card__sub">${this.subText}</div>` : nothing}
        </div>
        ${following
          ? html`<button
              type="button"
              class="btn btn--following"
              data-testid="unfollow-btn-${user.id}"
              @click=${this.#toggle}
            >
              Following
            </button>`
          : html`<button
              type="button"
              class="btn btn--follow"
              data-testid="follow-btn-${user.id}"
              @click=${this.#toggle}
            >
              Follow
            </button>`}
      </div>
    `;
  }
}

customElements.define("cp-user-card", CpUserCard);
