# React Router vs Lit

How each React / React Router concept maps to this Lit version.

| Concept | React Router version | Lit version |
|---|---|---|
| Component | Function returning JSX | Class extending `LitElement`, `render()` returns `html` |
| Registering | Import and use | `customElements.define("cp-feed-item", ...)`, used as a tag |
| Props | Function arguments | Reactive properties (`static properties`), set with `.prop=${value}` |
| State | `useState` | Reactive property with `{ state: true }` |
| Styling | Global `app.css` | Same file; works because components use light DOM |
| Routes | `routes.js` with `layout`, `index`, `route` | Array of `{ path, enter, render }` in `cp-app.js` |
| Layout route + `<Outlet />` | `AppLayout` | `cp-app` renders header, `routes.outlet()` and nav itself |
| Loader | `export clientLoader` | Async function called from the route's `enter()` |
| Page data | `loaderData` prop | `data` property |
| Link | `<Link to>` | Plain `<a href>`, intercepted by the router |
| Navigate | `useNavigate()` | `navigate(path)` / `history.back()` |
| Redirect | `redirect()` from a loader or action | `redirect(path)` (replaces the history entry) |
| Form post | `<Form method="post">` + `clientAction` | `@submit` handler that calls the service |
| Fetcher | `useFetcher()` | Direct service call + `reload()` |
| Optimistic UI | `fetcher.formData` | A `pending` state flipped before the request |
| Revalidation | Automatic after an action | Manual `reload()` |
| Icons | `lucide-react` | `lucide` (DOM elements) |
| 404 | `ErrorBoundary` | Router `fallback` route |

## What is easier in Lit

- Components are real HTML elements, so they work in any page without a framework.
- Event handling, form reading and `back()` use plain browser APIs.
- The built bundle is small (about 59 kB, 19 kB gzipped).

## What is harder in Lit

- `@lit-labs/router` is much smaller than React Router. It has no loaders, actions, fetchers or automatic revalidation, so I wrote those parts by hand (`enter()`, `reload()`, `pending` state).
- It does not push history entries on `goto()`, so `navigation.js` does that.
- URL patterns need the `urlpattern-polyfill` package in browsers without `URLPattern`.
- Without shadow DOM there are no style or slot encapsulation benefits. I chose that on purpose to reuse `app.css`.

## Differences in behaviour

- The React project is an unfinished assignment (several things are left broken on purpose). This port implements the behaviour described in its README, and the reused tests confirm it.
- The active tab in the bottom nav is highlighted (the React version used `<Link end>`, which never sets `active`).
- Server rendering is not used; this is a client-only app.
