import { html, nothing } from "lit";
import { LightElement } from "../base.js";
import { Sofa } from "../icons.js";
import { createFollow, deleteFollow } from "../services/follows.js";
import { reload } from "../navigation.js";
import "../components/cp-session-accordion.js";
import "../components/cp-empty-state.js";

class PageUserProfile extends LightElement {
  static properties = {
    data: { attribute: false },
    // optimistic follow state while the request is in flight
    pending: { state: true },
  };

  constructor() {
    super();
    this.pending = null;
  }

  async #toggle() {
    const { user, currentUserId, isFollowing, followId } = this.data;
    const following = this.pending ?? isFollowing;
    this.pending = !following;
    if (following) {
      await deleteFollow(followId);
    } else {
      await createFollow({ followerId: currentUserId, followingId: user.id });
    }
    await reload();
    this.pending = null;
  }

  render() {
    const { user, currentUserId, isOwnProfile, isFollowing, sessions } = this.data;
    const following = this.pending ?? isFollowing;

    return html`
      <div class="user-profile" data-testid="user-profile">
        <div class="user-profile__hero">
          <div class="user-profile__avatar">${user.avatar}</div>
          <h2 class="user-profile__name" data-testid="profile-name">${user.name}</h2>
          ${isOwnProfile
            ? nothing
            : following
              ? html`<button
                  type="button"
                  class="btn btn--following"
                  data-testid="unfollow-btn"
                  @click=${this.#toggle}
                >
                  Following
                </button>`
              : html`<button
                  type="button"
                  class="btn btn--follow"
                  data-testid="follow-btn"
                  @click=${this.#toggle}
                >
                  Follow
                </button>`}
        </div>

        <p class="profile-section-title">
          ${isOwnProfile ? "Your Sessions" : "Recent Sessions"}
        </p>

        ${sessions.length === 0
          ? html`<cp-empty-state
              .icon=${Sofa(44)}
              title=${isOwnProfile ? "Nothing logged yet" : "No sessions yet"}
              message=${isOwnProfile ? "Use the Track button to log your first session." : ""}
              test-id=${isOwnProfile ? "empty-my-sessions" : "empty-user-sessions"}
            ></cp-empty-state>`
          : html`<div data-testid=${isOwnProfile ? "my-sessions" : "user-sessions"}>
              <cp-session-accordion
                .sessions=${sessions}
                .currentUserId=${currentUserId}
              ></cp-session-accordion>
            </div>`}
      </div>
    `;
  }
}

customElements.define("page-user-profile", PageUserProfile);
