// The root <cp-app> registers itself here so any component can navigate or
// reload the current route's data without importing the app (no cycles).
let app = null;

export const registerApp = (instance) => {
  app = instance;
};

// Router.goto() only renders; it does not touch the history, so do that here.
export const navigate = (path) => {
  window.history.pushState({}, "", path);
  return app.routes.goto(path);
};

// Like a loader's redirect(): replaces the current entry so Back doesn't loop.
export const redirect = (path) => {
  window.history.replaceState({}, "", path);
  return app.routes.goto(path);
};
export const back = () => window.history.back();
export const reload = () => app.reload();
