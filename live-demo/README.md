# Lit

[Lit](https://lit.dev) is a small library for building **Web Components**. These are custom HTML elements such as `<task-board>` that work in every modern browser. You can drop them into any page, with or without a framework.

In this demo we'll turn a boring, static HTML page into an interactive one by adding a single Lit component. Along the way we'll look at what Lit re-renders and how Shadow DOM protects a component from the page's CSS.

See also: https://lit.dev/docs/

> ℹ️ This demo was written for **Lit 3**. Lit is loaded straight from its official CDN bundle, so there's no bundler, no TypeScript and no build step.

## Prerequisites

- A working Node.js installation. In Devine, we manage our Node.js installations with [nvm](https://github.com/nvm-sh/nvm). Check that it works:

  ```bash
  node --version
  ```

- A modern browser with DevTools (Chrome, Edge, Firefox or Safari).

## Getting Started

Every step of the demo lives in its own folder, so you can always look back at how the page looked at that point:

```
├── live-demo
│   ├── package.json
│   ├── step1-static
│   │   ├── index.html
│   ├── step2-enhanced
│   │   ├── index.html
│   │   ├── task-board.js
│   ├── step3-devtools
│   │   ├── index.html
│   │   ├── task-board.js
│   ├── step4-chaos
│   │   ├── index.html
│   │   ├── task-board.js
```

Start a local server from the `live-demo` folder:

```bash
npm run dev
```

Then open a step in the browser:

- http://localhost:3000/step1-static/
- http://localhost:3000/step2-enhanced/
- http://localhost:3000/step3-devtools/
- http://localhost:3000/step4-chaos/

You can also serve a single step on its own:

```bash
cd step2-enhanced
npx serve
```

> ⚠️ Don't double-click `index.html` to open it. Browsers block ES modules on `file://` URLs, so you always need a (local) server.

## Step 1: A static page

We start from a plain HTML page. Create `step1-static/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Tasks</title>
  </head>
  <body>
    <h1>My Tasks</h1>
    <p>This page currently does nothing.</p>
  </body>
</html>
```

**What happens:** nothing. You see a title and a sentence, with no JavaScript and no interaction. That's our starting point.

## Step 2: Add a Lit component

We'll add a `<task-board>` component that shows a list of tasks and a button to shuffle them.

### Create the component

Create a new file `step2-enhanced/task-board.js`. First, import Lit from the CDN:

```js
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
```

- `LitElement` is the base class for every Lit component.
- `html` is a tagged template literal we use to write the component's markup.
- `css` is a tagged template literal we use to write the component's styles.

Create a class that extends `LitElement`, and register it as a custom element:

```js
class TaskBoard extends LitElement {
}

customElements.define('task-board', TaskBoard);
```

> ℹ️ The name of a custom element **must contain a dash** (`task-board`, not `taskboard`). That's how the browser tells custom elements apart from native HTML elements.

### Add state

Our component needs to remember two things: the list of tasks and how many times it has updated. Declare them as reactive properties and give them a starting value in the constructor:

```diff
class TaskBoard extends LitElement {
+  static properties = {
+    _tasks: { state: true },
+    _count: { state: true },
+  };
+
+  constructor() {
+    super();
+    this._tasks = [
+      { id: 1, text: 'Research Lit' },
+      { id: 2, text: 'Build demo' },
+      { id: 3, text: 'Rehearse talk' },
+    ];
+    this._count = 0;
+  }
}
```

`state: true` marks these as **internal state**: they belong to the component and aren't set from outside as HTML attributes. Whenever you assign a new value to one of them, Lit automatically re-renders the component.

### Render the markup

Add a `render()` method. It returns an `html` template that describes what the component looks like:

```diff
+  render() {
+    return html`
+      <p>Updates: ${this._count}</p>
+      <button @click=${this._shuffle}>Shuffle tasks</button>
+      ${this._tasks.map((task) => html`<div class="task">${task.text}</div>`)}
+    `;
+  }
```

A couple of things to note:

- `${...}` inserts a value into the template, just like a normal JavaScript template string.
- `@click=${this._shuffle}` adds an event listener. The `@` prefix is Lit's syntax for events.
- We use `.map()` to turn the array of tasks into a list of `<div>`s.

### Handle the click

Add the `_shuffle` method that the button calls:

```diff
+  _shuffle() {
+    this._tasks = [...this._tasks].sort(() => Math.random() - 0.5);
+    this._count++;
+  }
```

Notice that we create a **new array** (`[...this._tasks]`) instead of sorting the existing one in place. Lit compares the old and new value to decide whether something changed. If you mutate the same array, the reference stays the same and Lit won't notice.

### Style the component

Add a `static styles` block with the `css` tag:

```diff
class TaskBoard extends LitElement {
+  static styles = css`
+    :host {
+      all: initial;
+      display: block;
+      font-family: sans-serif;
+      max-width: 320px;
+    }
+
+    .task {
+      background: #e0e7ff;
+      border-radius: 8px;
+      padding: 8px 12px;
+      margin: 8px 0;
+    }
+  `;
```

- `:host` targets the `<task-board>` element itself.
- These styles are **scoped** to the component. The `.task` class here can't clash with a `.task` class somewhere else on the page.

### Use it in the page

Copy `index.html` from step 1 into `step2-enhanced`. Then add **one script import** and **one custom tag**:

```diff
  <head>
    <meta charset="UTF-8" />
    <title>My Tasks</title>
+    <script type="module" src="./task-board.js"></script>
  </head>
  <body>
    <h1>My Tasks</h1>
    <p>This page currently does nothing.</p>
+    <task-board></task-board>
  </body>
```

**What happens:** the browser loads `task-board.js`, which registers `<task-board>` as a new HTML element. From then on, the browser treats `<task-board>` like any other tag. The component appears with three tasks. Click "Shuffle tasks": the order changes and the counter goes up. No build step was needed.

## Step 3: What does Lit re-render?

Copy both files from step 2 into `step3-devtools`. The code stays the same. In this step we only **look** at what happens in the browser.

1. Open the page and open **DevTools** (Elements tab).
2. Find `<task-board>` and expand the `#shadow-root` underneath it. That's where the component's markup lives.
3. Click "Shuffle tasks" a few times and watch the Elements panel.

**What happens:** only the `<p>` with the counter and the task `<div>`s flash. Nothing else in the tree changes: not the `<h1>`, not the `<p>` outside the component, not even the `<button>`.

Lit doesn't rebuild the whole component on every update. When `render()` runs, Lit remembers where the dynamic `${...}` parts of the template are. On the next update it only touches those parts. There's no virtual DOM diff of the full tree like in React.

> 💡 In Chrome you can make this even clearer: open the DevTools menu (⋮) → More tools → **Rendering**, and enable **Paint flashing**. Repainted areas light up green.

## Step 4: Shadow DOM vs aggressive CSS

Copy both files from step 2 into `step4-chaos`. `task-board.js` stays **exactly the same**.

Add some deliberately terrible global CSS to the `<head>` of `index.html`:

```diff
  <head>
    <meta charset="UTF-8" />
    <title>My Tasks</title>
    <script type="module" src="./task-board.js"></script>
+    <style>
+      *:not(task-board) {
+        color: red !important;
+        font-size: 48px !important;
+        font-family: 'Comic Sans MS', 'Comic Sans', cursive !important;
+        border: 6px dashed magenta !important;
+        background: yellow !important;
+      }
+    </style>
  </head>
```

**What happens:** the rest of the page is wrecked: red, huge, Comic Sans, yellow background and magenta borders everywhere. But the inside of `<task-board>` looks exactly like it did in step 2, even though we used `*` and `!important`.

That's **Shadow DOM** at work. Everything inside the `#shadow-root` is isolated from the page's selectors. Page CSS can't reach in, and the component's CSS can't leak out.

### Why `*:not(task-board)`?

The `<task-board>` element itself (the "host") still belongs to the page, so page CSS is allowed to style its outer box, for example with a border around it. Excluding it keeps the demo focused on what matters: the component's internals.

### Why `all: initial` on `:host`?

Shadow DOM blocks **selectors** from the page, but **inherited** properties (`color`, `font-size`, `font-family`, ...) still flow into the component from its parent. Try removing `all: initial` from `task-board.js`: the tasks will turn red and huge.

`all: initial` resets those inherited values, so the page's styles really can't reach the inside of the component.

## Notes

### Why no `@customElement` or `@state` decorators?

In the Lit docs you'll often see code like this:

```ts
@customElement('task-board')
class TaskBoard extends LitElement {
  @state() _tasks = [];
}
```

Decorators need a build step (TypeScript or Babel), because browsers can't run them yet. Without a build step, you use the plain JavaScript equivalents:

| With decorators (build step) | Plain JavaScript (no build step)                  |
| ---------------------------- | ------------------------------------------------- |
| `@customElement('task-board')` | `customElements.define('task-board', TaskBoard)` |
| `@state() _tasks`            | `static properties = { _tasks: { state: true } }` |

They do exactly the same thing.

### Dependencies

`lit` and `@lit-labs/motion` are listed in `package.json` for later steps. The current steps load Lit from the CDN, so you don't need to run `npm install` yet.
