# Couch Potato (Lit)

A Lit port of the React Router assignment **Couch Potato**. Same screens, same behaviour, same CSS and the same json-server backend, but built with web components instead of React and React Router.

- Original: `couch-potato-react/client` (React 19 + React Router 7)
- This version: Lit 3 + `@lit-labs/router` + Vite, plain JavaScript, no React

For the side-by-side analysis, see [COMPARISON.md](COMPARISON.md). For what each screen does and which data it needs, see the README of the original project.

## Run it

Start the API first, because the app loads its data from it.

```bash
# Terminal 1: the API (http://localhost:3000)
cd ../couch-potato-react/server
npm install    # only the first time
npm start

# Terminal 2: this app (http://localhost:5173)
cd couch-potato-lit
npm install    # only the first time
npm run dev
```

The API address comes from `.env` (`VITE_API_BASE_URL=http://localhost:3000`).
If .env is missing, copy .env.example to .env.

## Tests

The Playwright tests of the React version are reused unchanged. They mock the backend, so no API is needed.

```bash
npm run test:chrome   # Chromium only
npm run test:all      # Chromium, Firefox and WebKit
```

Result: 48 / 48 pass in Chromium.

## Project structure

```text
src/
  main.js                  entry: polyfill, CSS, root component
  app.css                  copied unchanged from the React version
  base.js                  LightElement: a LitElement without shadow DOM
  icons.js                 lucide icons as DOM elements
  navigation.js            navigate / redirect / back / reload helpers
  utils.js                 formatDuration, formatDate
  services/                the fetch wrappers, unchanged
  components/
    cp-app.js              shell + routes + loaders (was root.jsx, AppLayout, routes.js)
    cp-app-header.js       AppHeader
    cp-bottom-nav.js       BottomNav
    cp-empty-state.js      EmptyState
    cp-feed-item.js        FeedItem
    cp-session-accordion.js SessionAccordion
    cp-session-form.js     SessionForm
    cp-user-card.js        UserCard
  pages/
    page-feed.js           /
    page-track.js          /track
    page-session-detail.js /sessions/:sessionId
    page-edit-session.js   /sessions/:sessionId/edit
    page-friends.js        /friends
    page-user-profile.js   /users/:userId
```

## How it works

- **No shadow DOM.** Every component renders into itself (`createRenderRoot() { return this; }`), so the existing global `app.css` and the BEM class names work as they are.
- **Routing.** `cp-app` creates one `Router` from `@lit-labs/router`. Each route has an `enter()` that runs the loader and only lets the page render once the data is there, like `clientLoader` in React Router. Links are normal `<a href>` elements; the router intercepts the clicks, so there is no full page reload.
- **Loaders.** The loader functions live in `cp-app.js` and return the same data as the React loaders. The page gets it through its `data` property.
- **Actions.** There are no route actions. A page calls the service directly (`createSession`, `updateSession`, `createFollow`, `deleteFollow`), then navigates with `navigate()` or re-runs the loader with `reload()`.
- **Optimistic follow button.** `cp-user-card` and the profile page keep a `pending` state: the button flips straight away and the real value takes over after the reload.
- **Edit guard.** The edit loader redirects to the feed (`redirect("/")`) when `session.userId` is not the current user.
