import { html } from "lit";
import { keyed } from "lit/directives/keyed.js";
import { Router } from "@lit-labs/router";
import { LightElement } from "../base.js";
import { registerApp, redirect } from "../navigation.js";

import { getCurrentUserId } from "../services/auth.js";
import { getUser, getUsers } from "../services/users.js";
import { getFollows, getFollow } from "../services/follows.js";
import { getCategories } from "../services/categories.js";
import {
  getFeedSessions,
  getSession,
  getSessionWithRelations,
  getSessionsByUser,
} from "../services/sessions.js";

import "./cp-app-header.js";
import "./cp-bottom-nav.js";
import "../pages/page-feed.js";
import "../pages/page-track.js";
import "../pages/page-session-detail.js";
import "../pages/page-edit-session.js";
import "../pages/page-friends.js";
import "../pages/page-user-profile.js";

// ---- Loaders: same data as the React Router clientLoaders ----

const feedLoader = async () => {
  const currentUserId = await getCurrentUserId();
  const follows = await getFollows(currentUserId);
  const feedSessions = await getFeedSessions([
    currentUserId,
    ...follows.map((f) => f.followingId),
  ]);
  return { feedSessions };
};

const trackLoader = async () => ({ categories: await getCategories() });

const sessionDetailLoader = async ({ sessionId }) => {
  const session = await getSessionWithRelations(sessionId);
  const currentUserId = await getCurrentUserId();
  return { session, currentUserId };
};

// Only the owner may edit; anyone else is sent back to the feed.
const editSessionLoader = async ({ sessionId }) => {
  const session = await getSession(sessionId);
  const currentUserId = await getCurrentUserId();
  if (session.userId !== currentUserId) {
    redirect("/");
    return null;
  }
  return { session, currentUserId };
};

const friendsLoader = async () => {
  const currentUserId = await getCurrentUserId();
  const [users, follows] = await Promise.all([
    getUsers(),
    getFollows(currentUserId),
  ]);
  return { users, follows, currentUserId };
};

const userProfileLoader = async (params) => {
  const currentUserId = await getCurrentUserId();
  const userId = params.userId ?? currentUserId;
  const isOwnProfile = userId === currentUserId;

  const [user, follow, sessions] = await Promise.all([
    getUser(userId),
    isOwnProfile ? Promise.resolve(null) : getFollow(currentUserId, userId),
    getSessionsByUser(userId),
  ]);

  return {
    user,
    currentUserId,
    isOwnProfile,
    isFollowing: Boolean(follow),
    followId: follow?.id ?? null,
    sessions,
  };
};

class CpApp extends LightElement {
  static properties = {
    currentUser: { state: true },
    path: { state: true },
  };

  #current = null;

  constructor() {
    super();
    this.currentUser = null;
    this.path = window.location.pathname;
    registerApp(this);

    // A route is only rendered once its loader finished (enter is awaited),
    // which mirrors how React Router waits for clientLoader before rendering.
    // Every route keeps its own data, so the page that is still on screen is
    // never re-rendered with the data of the page we are navigating to.
    const route = (path, loader, render) => {
      let data = null;
      let visit = 0;
      return {
        path,
        enter: async (params) => {
          const next = await loader(params);
          if (next === null) return false;
          data = next;
          visit += 1;
          this.#current = {
            reload: async () => {
              data = await loader(params);
              this.requestUpdate();
            },
          };
          this.path = window.location.pathname;
          return true;
        },
        // keyed() gives each visit a fresh page element (resets local state)
        render: () => keyed(visit, render(data)),
      };
    };

    this.routes = new Router(this, [
      route("/", feedLoader, (d) => html`<page-feed .data=${d}></page-feed>`),
      route("/track", trackLoader, (d) => html`<page-track .data=${d}></page-track>`),
      route(
        "/sessions/:sessionId",
        sessionDetailLoader,
        (d) => html`<page-session-detail .data=${d}></page-session-detail>`,
      ),
      route(
        "/sessions/:sessionId/edit",
        editSessionLoader,
        (d) => html`<page-edit-session .data=${d}></page-edit-session>`,
      ),
      route("/friends", friendsLoader, (d) => html`<page-friends .data=${d}></page-friends>`),
      route(
        "/users/:userId",
        userProfileLoader,
        (d) => html`<page-user-profile .data=${d}></page-user-profile>`,
      ),
    ], {
      fallback: {
        render: () => html`
          <main style="padding: 2rem">
            <h1>404</h1>
            <p>The requested page could not be found.</p>
          </main>
        `,
      },
    });
  }

  async connectedCallback() {
    super.connectedCallback();
    // Same as AppLayout's loader: the header needs the logged-in user.
    this.currentUser = await getUser(await getCurrentUserId());
  }

  // Re-run the active route's loader (React Router does this after an action).
  async reload() {
    await this.#current?.reload();
  }

  render() {
    return html`
      <div class="app">
        <cp-app-header .currentUser=${this.currentUser}></cp-app-header>
        <main class="app-content">${this.routes.outlet()}</main>
        <cp-bottom-nav .path=${this.path}></cp-bottom-nav>
      </div>
    `;
  }
}

customElements.define("cp-app", CpApp);
