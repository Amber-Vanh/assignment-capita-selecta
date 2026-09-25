# Lit live demo

A 4-step live demo for a 10-minute presentation about [Lit](https://lit.dev). Each step is its own folder, so you can show how the page progresses one step at a time.

Everything runs as plain ES modules in the browser. There's no bundler, no TypeScript and no build step: Lit is loaded straight from its official CDN bundle.

## Run it

From this `demo/` folder:

```bash
npm run dev
```

Then open a step in the browser:

- http://localhost:3000/step1-static/
- http://localhost:3000/step2-enhanced/
- http://localhost:3000/step3-devtools/
- http://localhost:3000/step4-chaos/

Or run one step on its own:

```bash
cd step2-enhanced
npx serve
```

Use a server instead of double-clicking `index.html`: browsers block ES modules on `file://` URLs.

## Presentation order

1. **Step 1 – `step1-static`:** show the static page. It's plain, boring HTML that does nothing.
2. **Step 2 – `step2-enhanced`:** show the same page after adding **one script import** and **one custom tag** (`<task-board>`). The component appears and is fully interactive, with no build step required.
3. **Step 3 – `step3-devtools`:** open DevTools, expand the `#shadow-root` under `<task-board>` and click "Shuffle tasks". Point out that only the updated DOM nodes (the counter and the task divs) flash/repaint, and nothing else in the tree re-renders.
4. **Step 4 – `step4-chaos`:** show the aggressive global CSS wrecking the rest of the page, while the component's internals stay completely untouched. `task-board.js` is exactly the same as in step 2.

## Notes for questions

- **Why no `@customElement` / `@state` decorators?** Decorators need a build step (TypeScript or Babel), because browsers can't run them yet. Without a build step you use the plain JavaScript equivalents:
  - `customElements.define('task-board', TaskBoard)` instead of `@customElement('task-board')`;
  - `static properties = { _tasks: { state: true } }` instead of `@state() _tasks`.

  They do exactly the same thing.
- **Why `all: initial` on `:host`?** Shadow DOM blocks *selectors* from the page, but *inherited* properties (color, font-size, font-family) still flow into the component from its parent. `all: initial` resets them, so the page's styles really can't reach the inside of the component.
- **Why `*:not(task-board)` in step 4?** The `<task-board>` element itself (the "host") still belongs to the page, so page CSS is allowed to style its outer box, such as a border around it. Excluding it keeps the demo focused on what matters: the component's internals.
- `lit` and `@lit-labs/motion` are listed in `package.json` for later steps. The current steps load Lit from the CDN, so an `npm install` isn't needed yet.
