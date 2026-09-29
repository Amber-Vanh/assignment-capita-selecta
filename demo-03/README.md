# Lit – Build a Kanban board

In [demo 02](../demo-02/README.md) we built one small component. Real apps are made of **many components that have to work together**. In this exercise we build a Kanban board (like Trello) with three Lit components that pass data down and send events up:

```
<kanban-board>          owns all the data (the "state")
└── <kanban-column>     one per column: To do, Doing, Done
    └── <kanban-card>   one per task
```

By the end you can move cards with buttons **and** with drag and drop, add new cards, sort a column and reload the page without losing anything.

This exercise is harder than demo 02. Take your time with each step, and read the explanation before you copy code. Most of the difficult parts are not about syntax. They are about **where data lives** and **how it travels through Shadow DOM**.

The solutions for every step are in the `step…` folders of this demo. Compare your code with them when you're stuck.

See also: https://lit.dev/docs/

> ℹ️ This exercise was written for **Lit 3**. Just like demo 02, Lit is loaded straight from its CDN, so there's no bundler, no TypeScript and no build step. This time we use the `lit-all` bundle, because we also need Lit's **directives** (`repeat` and `classMap`).

Read through these pages of the Lit docs before you start (or keep them open next to this guide):

- [Reactive properties](https://lit.dev/docs/components/properties/)
- [Expressions](https://lit.dev/docs/templates/expressions/) (attribute, property, boolean and event bindings)
- [Lists](https://lit.dev/docs/templates/lists/) (`map` vs `repeat`)
- [Events](https://lit.dev/docs/components/events/)
- [Lifecycle](https://lit.dev/docs/components/lifecycle/)

## Table of contents

- [What you'll learn](#what-youll-learn)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Step 1: A card](#step-1-a-card)
- [Step 2: A column](#step-2-a-column)
- [Step 3: The board](#step-3-the-board)
- [Step 4: Events up](#step-4-events-up)
- [Step 5: Drag and drop](#step-5-drag-and-drop)
- [Step 6: Adding cards](#step-6-adding-cards)
- [Step 7: Saving the board](#step-7-saving-the-board)
- [Going further](#going-further)
- [Cheat sheet: Lit bindings](#cheat-sheet-lit-bindings)

## What you'll learn

- The difference between **public properties** (data from the parent) and **internal state** (data that belongs to the component).
- The difference between **attribute bindings** (`priority=${…}`) and **property bindings** (`.card=${…}`).
- Styling a component from the outside with `:host([attribute])`.
- Why `repeat` with a key is sometimes **required** instead of `.map()`.
- **Data down, events up**: one component owns the state, the others ask it to change things.
- How `CustomEvent`s cross Shadow DOM boundaries (`bubbles` and `composed`).
- Native HTML drag and drop inside Shadow DOM.
- Forms inside a component.
- The Lit lifecycle: saving state in `updated()`.

## Prerequisites

- You finished [demo 02](../demo-02/README.md), or you know how `LitElement`, `static properties`, `render()` and `html` work.
- A working Node.js installation. Check that it works:

  ```bash
  node --version
  ```

- Chrome (or another modern browser) with DevTools.

## Getting started

We build the board step by step. Every step gets its own folder, so you can always look back. At the end, your project looks like this:

```
├── kanban
│   ├── package.json
│   ├── step1-card
│   │   ├── index.html
│   │   ├── kanban-card.js
│   ├── step2-column
│   │   ├── index.html
│   │   ├── kanban-card.js
│   │   ├── kanban-column.js
│   ├── step3-board
│   │   ├── board-data.js
│   │   ├── index.html
│   │   ├── kanban-board.js
│   │   ├── kanban-card.js
│   │   ├── kanban-column.js
│   ├── step4-events
│   ├── step5-drag-drop
│   ├── step6-add-cards
│   ├── step7-persist
```

From step 3 onwards, every folder contains the same five files. You **copy the previous folder** and change it.

### Create the project

```bash
mkdir kanban
cd kanban
npm init -y
```

Open `package.json` and make the same two changes as in demo 02:

```diff
  "scripts": {
-    "test": "echo \"Error: no test specified\" && exit 1"
+    "dev": "npx serve ."
  },
  ...
-  "type": "commonjs"
+  "type": "module"
```

### Start the server

```bash
npm run dev
```

Leave this terminal running and open http://localhost:3000. Every step folder shows up there. `serve` doesn't reload the page for you, so refresh the browser after every change.

> ⚠️ Don't double-click `index.html`. Browsers block ES modules on `file://` URLs, so you always need a (local) server.

## Step 1: A card

We start with the smallest piece: one card.

### Create the component

Create `step1-card/kanban-card.js`:

```js
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';

class KanbanCard extends LitElement {
  static properties = {
    card: { type: Object },
    priority: { type: String },
    _expanded: { state: true },
  };

  constructor() {
    super();
    this._expanded = false;
  }

  render() {
    if (!this.card) return nothing;

    return html`
      <article>
        <header>
          <h3>${this.card.title}</h3>
          <button @click=${this._toggle} aria-expanded=${this._expanded}>
            ${this._expanded ? '−' : '+'}
          </button>
        </header>
        ${this._expanded ? html`<p>${this.card.description}</p>` : nothing}
      </article>
    `;
  }

  _toggle() {
    this._expanded = !this._expanded;
  }
}

customElements.define('kanban-card', KanbanCard);
```

Our card has **three** reactive properties, and they are not all the same kind:

- `card` is a **public property**. The parent gives the card its data. It's an object (`{ id, title, description, priority }`), so it has to be set with JavaScript.
- `priority` is also a **public property**, but a simple string. We'll set it as an HTML **attribute** (`<kanban-card priority="high">`) so we can use it in CSS.
- `_expanded` is **internal state** (`state: true`). Nobody outside the card needs to know whether it's open. The underscore is a naming convention for "private".

A few more things to note:

- `nothing` is a special Lit value that renders… nothing. We use it for the closed description, and as a guard: `card` is `undefined` until the parent sets it, and without the guard `this.card.title` would crash on the first render.
- `aria-expanded=${this._expanded}` tells screen readers whether the card is open.

### Style it with `:host([priority])`

Add a `static styles` block at the top of the class:

```diff
class KanbanCard extends LitElement {
  static properties = { ... };

+  static styles = css`
+    :host {
+      display: block;
+      font-family: system-ui, sans-serif;
+      --accent: #94a3b8;
+    }
+
+    :host([priority='high']) {
+      --accent: #ef4444;
+    }
+
+    :host([priority='medium']) {
+      --accent: #f59e0b;
+    }
+
+    :host([priority='low']) {
+      --accent: #22c55e;
+    }
+
+    article {
+      background: white;
+      border-left: 6px solid var(--accent);
+      border-radius: 8px;
+      box-shadow: 0 1px 3px rgb(0 0 0 / 0.15);
+      padding: 8px 12px;
+    }
+
+    header {
+      display: flex;
+      align-items: center;
+      justify-content: space-between;
+      gap: 8px;
+    }
+
+    h3 {
+      font-size: 1rem;
+      margin: 0;
+    }
+
+    p {
+      color: #475569;
+      font-size: 0.875rem;
+      margin: 8px 0 0;
+    }
+  `;
```

`:host([priority='high'])` means: "the `<kanban-card>` element itself, **when it has** `priority="high"`". We don't switch colors in JavaScript. We only change a CSS custom property (`--accent`), and the border picks it up.

### Use it in the page

Create `step1-card/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Kanban – step 1</title>
    <script type="module" src="./kanban-card.js"></script>
    <style>
      body {
        background: #f1f5f9;
        font-family: system-ui, sans-serif;
        max-width: 320px;
        margin: 32px auto;
      }
    </style>
  </head>
  <body>
    <h1>Step 1: a card</h1>
    <kanban-card priority="high"></kanban-card>

    <script type="module">
      document.querySelector('kanban-card').card = {
        id: 1,
        title: 'Research Lit',
        description: 'Read the Lit docs about reactive properties.',
        priority: 'high',
      };
    </script>
  </body>
</html>
```

Notice the two different ways we give data to the card:

| What       | How                                  | Why                                          |
| ---------- | ------------------------------------ | -------------------------------------------- |
| `priority` | HTML attribute: `priority="high"`    | It's a short string, and CSS can select on it |
| `card`     | JavaScript property: `el.card = {…}` | It's an object. Attributes are always strings |

**What happens:** you see a white card with a red border on the left. Click `+`: the description appears and the button changes to `−`.

**Try it yourself:** change `priority="high"` to `low` or `medium` in the HTML. Then, in the DevTools **Elements** panel, edit the attribute on the live `<kanban-card>`. The color changes right away, because Lit watches the attribute and `:host([priority])` reacts to it.

## Step 2: A column

A column shows a title, the number of cards and a list of `<kanban-card>`s. It also gets a button that sorts the cards by priority. That button hides one of the most common Lit bugs, so we'll run into it on purpose.

Copy `kanban-card.js` into a new folder `step2-column`.

### Create the column (with `.map()`)

Create `step2-column/kanban-column.js`. For now, we render the list with `.map()`, just like in demo 02:

```js
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
import './kanban-card.js';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

class KanbanColumn extends LitElement {
  static properties = {
    column: { type: Object },
    cards: { type: Array },
    _sorted: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
    }

    section {
      background: #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      min-height: 200px;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 12px;
    }

    h2 {
      font-size: 1.125rem;
      margin: 0;
    }

    .count {
      background: #cbd5e1;
      border-radius: 999px;
      font-size: 0.75rem;
      padding: 2px 8px;
    }

    .cards {
      display: grid;
      gap: 8px;
    }

    .empty {
      color: #64748b;
      font-style: italic;
      text-align: center;
    }
  `;

  constructor() {
    super();
    this.cards = [];
    this._sorted = false;
  }

  get _visibleCards() {
    if (!this._sorted) return this.cards;
    return [...this.cards].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }

  render() {
    if (!this.column) return nothing;

    return html`
      <section>
        <header>
          <h2>${this.column.title} <span class="count">${this.cards.length}</span></h2>
          <button @click=${this._toggleSort}>
            ${this._sorted ? 'Original order' : 'Sort by priority'}
          </button>
        </header>
        <div class="cards">
          ${this.cards.length === 0
            ? html`<p class="empty">No cards yet</p>`
            : this._visibleCards.map(
                (card) => html`<kanban-card .card=${card} priority=${card.priority}></kanban-card>`
              )}
        </div>
      </section>
    `;
  }

  _toggleSort() {
    this._sorted = !this._sorted;
  }
}

customElements.define('kanban-column', KanbanColumn);
```

Some important details:

- `import './kanban-card.js'` makes sure `<kanban-card>` is defined before the column uses it. Each component imports the components it renders.
- `_visibleCards` is a **getter**: a value that's calculated from `cards` and `_sorted` every time you read it. We don't store the sorted list separately, so it can never get out of sync.
- We sort a **copy** (`[...this.cards]`). `.sort()` changes the array in place, and that array belongs to the parent.
- Look at the two bindings on `<kanban-card>`:
  - `.card=${card}` with a **dot**: a **property binding**. Lit sets `element.card = card`, so the real object is passed.
  - `priority=${card.priority}` without a dot: an **attribute binding**. Lit calls `setAttribute('priority', …)`, so our `:host([priority])` CSS works.

> ⚠️ Forgetting the dot is a classic mistake. `card=${card}` would turn the object into the string `"[object Object]"`.

### Use it in the page

Create `step2-column/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Kanban – step 2</title>
    <script type="module" src="./kanban-column.js"></script>
    <style>
      body {
        background: #f1f5f9;
        font-family: system-ui, sans-serif;
        max-width: 320px;
        margin: 32px auto;
      }
    </style>
  </head>
  <body>
    <h1>Step 2: a column</h1>
    <kanban-column></kanban-column>

    <script type="module">
      const column = document.querySelector('kanban-column');
      column.column = { id: 'todo', title: 'To do' };
      column.cards = [
        { id: 1, title: 'Research Lit', description: 'Read the Lit docs about reactive properties.', priority: 'low' },
        { id: 2, title: 'Build demo', description: 'Make a Kanban board with Web Components.', priority: 'medium' },
        { id: 3, title: 'Rehearse talk', description: 'Practise the presentation twice.', priority: 'high' },
      ];
    </script>
  </body>
</html>
```

### Find the bug

1. Open the page. You see three cards: green, orange, red.
2. Click `+` on **Research Lit** (the first card) to expand it.
3. Click **Sort by priority**.

**What happens:** the order changes to *Rehearse talk, Build demo, Research Lit*… but now **Rehearse talk** is expanded, not Research Lit! 🐛

Why? With `.map()`, Lit reuses DOM elements **by position**. The first `<kanban-card>` element stays the first element. It just gets a new `.card` object. Its **internal state** (`_expanded = true`) belongs to the element, not to the data, so it stays at position 1.

This isn't a problem as long as a component has no state of its own (like the `<div>`s in demo 02). It **is** a problem as soon as the list items have internal state, focus, a text input or an animation.

### Fix it with `repeat`

The `repeat` directive takes a **key function**. Lit uses that key to recognize each item, and **moves** the existing element when the order changes.

```diff
- import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
+ import { LitElement, html, css, nothing, repeat } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
```

```diff
          ${this.cards.length === 0
            ? html`<p class="empty">No cards yet</p>`
-            : this._visibleCards.map(
-                (card) => html`<kanban-card .card=${card} priority=${card.priority}></kanban-card>`
-              )}
+            : repeat(
+                this._visibleCards,
+                (card) => card.id,
+                (card) => html`<kanban-card .card=${card} priority=${card.priority}></kanban-card>`
+              )}
```

The three arguments are: the list, a function that returns a **unique key** for each item, and the template for each item.

**What happens:** repeat the three clicks. Research Lit moves to the bottom **and stays expanded**. 🎉

> 💡 Want to see it with your own eyes? Open DevTools, select the first `<kanban-card>` in the Elements panel and click **Sort by priority**. With `.map()` the selection stays at the top. With `repeat` the selected element moves to the bottom.

## Step 3: The board

Now we need a component that holds **all** the data and renders three columns.

Copy the `step2-column` folder to `step3-board`.

### Store the data flat

Create `step3-board/board-data.js`:

```js
export const initialBoard = {
  columnOrder: ['todo', 'doing', 'done'],
  columns: {
    todo: { id: 'todo', title: 'To do', cardIds: [1, 2, 3] },
    doing: { id: 'doing', title: 'Doing', cardIds: [4] },
    done: { id: 'done', title: 'Done', cardIds: [] },
  },
  cards: {
    1: { id: 1, title: 'Research Lit', description: 'Read the Lit docs about reactive properties.', priority: 'low' },
    2: { id: 2, title: 'Build demo', description: 'Make a Kanban board with Web Components.', priority: 'medium' },
    3: { id: 3, title: 'Rehearse talk', description: 'Practise the presentation twice.', priority: 'high' },
    4: { id: 4, title: 'Write README', description: 'Explain every step of the exercise.', priority: 'medium' },
  },
};
```

This is the same **normalized** structure as the company data in [demo 01](../README.md#1-the-data-is-stored-flat-normalized-state). Cards are **not** nested inside columns. Every card exists once, in `cards`, and columns only keep a list of `cardIds`. Moving a card then means changing two `cardIds` arrays. We never have to copy or delete the card itself.

### Create the board

Create `step3-board/kanban-board.js`:

```js
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
import { initialBoard } from './board-data.js';
import './kanban-column.js';

class KanbanBoard extends LitElement {
  static properties = {
    _board: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      align-items: start;
    }
  `;

  constructor() {
    super();
    this._board = initialBoard;
  }

  render() {
    const { columnOrder, columns, cards } = this._board;

    return html`
      <div class="board">
        ${columnOrder.map((columnId) => {
          const column = columns[columnId];
          return html`
            <kanban-column
              .column=${column}
              .cards=${column.cardIds.map((cardId) => cards[cardId])}
            ></kanban-column>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('kanban-board', KanbanBoard);
```

- The whole board is **one** piece of state: `_board`. This is the **single source of truth**. Columns and cards only receive pieces of it.
- For each column, we look up the real card objects (`cards[cardId]`) and pass them down with `.cards=${…}`.
- Here `.map()` is fine: the columns never change order, and they're always the same three.

### Use it in the page

Replace the contents of `step3-board/index.html`. The page now only needs the board:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Kanban – step 3</title>
    <script type="module" src="./kanban-board.js"></script>
    <style>
      body {
        background: #f1f5f9;
        font-family: system-ui, sans-serif;
        max-width: 960px;
        margin: 32px auto;
        padding: 0 16px;
      }
    </style>
  </head>
  <body>
    <h1>My Kanban board</h1>
    <kanban-board></kanban-board>
  </body>
</html>
```

**What happens:** three columns side by side, with the counts **3**, **1** and **0**. The *Done* column shows "No cards yet". On a narrow screen the columns stack.

In the Elements panel, notice the **nested shadow roots**: `<kanban-board>` → `#shadow-root` → `<kanban-column>` → `#shadow-root` → `<kanban-card>` → `#shadow-root`. This will matter in the next step.

## Step 4: Events up

We want to move a card to the next or previous column. The buttons live in `<kanban-card>`, but the data lives in `<kanban-board>`, two levels higher.

A card **must not** change the board's data itself. Instead:

- **data goes down** through properties (board → column → card),
- **events go up** (card → column → board), and the board decides what changes.

Copy the `step3-board` folder to `step4-events` (and update the `<title>`).

### Dispatch an event from the card

In `kanban-card.js`, add two buttons and a `_move` method:

```diff
      <article>
        <header>
          <h3>${this.card.title}</h3>
-          <button @click=${this._toggle} aria-expanded=${this._expanded}>
-            ${this._expanded ? '−' : '+'}
-          </button>
+          <div class="actions">
+            <button @click=${() => this._move(-1)} aria-label="Move left">←</button>
+            <button @click=${this._toggle} aria-expanded=${this._expanded}>
+              ${this._expanded ? '−' : '+'}
+            </button>
+            <button @click=${() => this._move(1)} aria-label="Move right">→</button>
+          </div>
        </header>
```

```diff
  _toggle() {
    this._expanded = !this._expanded;
  }
+
+  _move(direction) {
+    this.dispatchEvent(
+      new CustomEvent('card-move', {
+        detail: { cardId: this.card.id, direction },
+        bubbles: true,
+        composed: true,
+      })
+    );
+  }
```

And a bit of CSS for the buttons:

```diff
+    .actions {
+      display: flex;
+      gap: 4px;
+    }
+
    p {
```

- `detail` is the data that travels along with the event. The card only says **which card** and **which direction**. It doesn't know which columns exist.
- `() => this._move(-1)` is an arrow function, because we want to pass an argument. For `_toggle`, we can pass the method directly.

The two options are the important part:

| Option           | Meaning                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| `bubbles: true`  | The event travels **up** the DOM tree, to the parents                          |
| `composed: true` | The event is allowed to **leave the shadow root** it was dispatched in         |

Our card lives inside the **column's** shadow root, and the column lives inside the **board's** shadow root. Without `composed: true` the event bubbles up to the edge of the column's shadow root… and stops there.

### Handle the event in the board

In `kanban-board.js`, listen for the event on the wrapper `<div>`:

```diff
-      <div class="board">
+      <div class="board" @card-move=${this._onCardMove}>
```

Then add two methods below `render()`:

```js
  _onCardMove(e) {
    const { cardId, direction } = e.detail;
    const { columnOrder, columns } = this._board;
    const fromIndex = columnOrder.findIndex((columnId) => columns[columnId].cardIds.includes(cardId));
    const toColumnId = columnOrder[fromIndex + direction];
    if (toColumnId) this._moveCard(cardId, toColumnId);
  }

  _moveCard(cardId, toColumnId) {
    const { columns } = this._board;
    const fromColumn = Object.values(columns).find((column) => column.cardIds.includes(cardId));
    if (!fromColumn || fromColumn.id === toColumnId) return;
    const toColumn = columns[toColumnId];

    this._board = {
      ...this._board,
      columns: {
        ...columns,
        [fromColumn.id]: { ...fromColumn, cardIds: fromColumn.cardIds.filter((id) => id !== cardId) },
        [toColumn.id]: { ...toColumn, cardIds: [...toColumn.cardIds, cardId] },
      },
    };
  }
```

- `_onCardMove` finds the index of the current column and adds the direction (`-1` or `+1`). If there's no column there (moving left from *To do*), `toColumnId` is `undefined` and nothing happens.
- `_moveCard` is kept separate, because we'll reuse it for drag and drop in the next step.
- We **never mutate** the board. We build a new `_board` object with the spread operator (`...`). Only the two changed columns get new objects. Everything else is reused.

> ⚠️ Why so much spreading? Lit checks whether a property changed with `===`. If you do `this._board.columns.todo.cardIds.push(5)`, `_board` is still the same object, so Lit **doesn't re-render**. It's the same rule as in demo 02's `_shuffle`, but now the change is deeper inside the object.

**What happens:** click `→` on *Research Lit*: it jumps to *Doing* and the counts become **2**, **2** and **0**. Click `←` on a card in *To do*: nothing happens.

**Try it yourself:** remove `composed: true` from `_move` and click `→` again. Nothing happens, and there's no error in the console either. The event never reaches the board. Put it back afterwards.

## Step 5: Drag and drop

Buttons work, but on a Kanban board you want to **drag** cards. We use the browser's native [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API), so we don't need a library.

The plan:

1. The **card** is draggable. When a drag starts, it stores its own `id`.
2. The **column** is a drop zone. It lights up when you drag over it. On drop, it reads the `id` and tells the board.
3. The **board** moves the card with the `_moveCard` we already have.

Copy `step4-events` to `step5-drag-drop`.

### Make the card draggable

In `kanban-card.js`:

```diff
-      <article>
+      <article draggable="true" @dragstart=${this._onDragStart}>
```

```diff
+  _onDragStart(e) {
+    e.dataTransfer.setData('text/plain', String(this.card.id));
+    e.dataTransfer.effectAllowed = 'move';
+  }
```

`dataTransfer` is the "suitcase" of a drag operation. It can only hold **strings**, so we store the id as text and turn it back into a number on drop.

And a visual hint in the CSS:

```diff
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.15);
+      cursor: grab;
      padding: 8px 12px;
```

### Turn the column into a drop zone

In `kanban-column.js`, import `classMap` and add a new piece of state:

```diff
- import { LitElement, html, css, nothing, repeat } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
+ import { LitElement, html, css, nothing, repeat, classMap } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
```

```diff
    _sorted: { state: true },
+    _dragDepth: { state: true },
  };
```

```diff
    this._sorted = false;
+    this._dragDepth = 0;
  }
```

Listen for the four drag events on the `<section>`, and add a class while something is dragged over it:

```diff
-      <section>
+      <section
+        class=${classMap({ 'drag-over': this._dragDepth > 0 })}
+        @dragenter=${this._onDragEnter}
+        @dragover=${this._onDragOver}
+        @dragleave=${this._onDragLeave}
+        @drop=${this._onDrop}
+      >
```

`classMap` takes an object: every key whose value is `true` is added as a class, every key whose value is `false` is removed.

Add the handlers:

```js
  _onDragEnter(e) {
    e.preventDefault();
    this._dragDepth++;
  }

  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  _onDragLeave() {
    this._dragDepth--;
  }

  _onDrop(e) {
    e.preventDefault();
    this._dragDepth = 0;
    const cardId = Number(e.dataTransfer.getData('text/plain'));
    this.dispatchEvent(
      new CustomEvent('card-drop', {
        detail: { cardId, columnId: this.column.id },
        bubbles: true,
      })
    );
  }
```

And the styles for the highlight:

```diff
    section {
      background: #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      min-height: 200px;
+      outline: 3px dashed transparent;
+      transition: background 0.15s, outline-color 0.15s;
    }
+
+    section.drag-over {
+      background: #dbeafe;
+      outline-color: #3b82f6;
+    }
```

There are three tricky parts here:

> ⚠️ **`preventDefault()` in `dragover`**: by default, elements **refuse** drops. If you forget `e.preventDefault()` in `dragover`, the `drop` event simply never fires.

> ⚠️ **Why a counter instead of `true`/`false`?** `dragenter` and `dragleave` also fire when you move over a **child** of the column (a card, the header, …). Moving from the column onto a card fires `dragenter` (card) and then `dragleave` (column). With a boolean, the highlight would flicker off. With a counter we count "how deep" we are. It's only `0` when the pointer has really left the column.

> ℹ️ **Why no `composed: true` this time?** `card-drop` is dispatched on the `<kanban-column>` element itself. That element lives in the **board's** shadow root, the same shadow root as the `<div class="board">` that listens. The event never has to leave a shadow root, so `bubbles: true` is enough. Only use `composed` when you need it. It makes your event part of the "public API" of the page.

### Handle the drop in the board

In `kanban-board.js`:

```diff
-      <div class="board" @card-move=${this._onCardMove}>
+      <div class="board" @card-move=${this._onCardMove} @card-drop=${this._onCardDrop}>
```

```diff
+  _onCardDrop(e) {
+    const { cardId, columnId } = e.detail;
+    this._moveCard(cardId, columnId);
+  }
```

That's all. `_moveCard` already ignores drops into the column the card came from.

**What happens:** drag *Rehearse talk* to *Done*. While you drag, the column under the pointer turns blue with a dashed outline. When you drop, the card lands at the bottom of *Done* and the counts update. The arrow buttons still work too.

## Step 6: Adding cards

Every column gets a small form to add a new card.

Copy `step5-drag-drop` to `step6-add-cards`.

### Add a form to the column

In `kanban-column.js`, add the form right after `<div class="cards">…</div>`:

```diff
        </div>
+        <form @submit=${this._onSubmit}>
+          <input name="title" placeholder="New card…" required />
+          <select name="priority">
+            <option value="low">Low</option>
+            <option value="medium" selected>Medium</option>
+            <option value="high">High</option>
+          </select>
+          <button>Add</button>
+        </form>
      </section>
```

```js
  _onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    this.dispatchEvent(
      new CustomEvent('card-add', {
        detail: {
          columnId: this.column.id,
          title: data.get('title').trim(),
          priority: data.get('priority'),
        },
        bubbles: true,
      })
    );
    form.reset();
  }
```

```diff
+    form {
+      display: flex;
+      gap: 4px;
+      margin-top: 12px;
+    }
+
+    input {
+      flex: 1;
+      min-width: 0;
+    }
+
    .empty {
```

- `e.preventDefault()` stops the browser from submitting the form and reloading the page.
- `new FormData(form)` reads all fields by their `name`. That works inside Shadow DOM too, so we don't need a `querySelector` for every field.
- The column **still doesn't create the card itself**. It only asks the board: "please add this card to my column".

### Create the card in the board

```diff
-      <div class="board" @card-move=${this._onCardMove} @card-drop=${this._onCardDrop}>
+      <div
+        class="board"
+        @card-move=${this._onCardMove}
+        @card-drop=${this._onCardDrop}
+        @card-add=${this._onCardAdd}
+      >
```

```js
  _onCardAdd(e) {
    const { columnId, title, priority } = e.detail;
    if (!title) return;
    const { columns, cards } = this._board;
    const id = Math.max(0, ...Object.keys(cards).map(Number)) + 1;
    const column = columns[columnId];

    this._board = {
      ...this._board,
      cards: { ...cards, [id]: { id, title, description: '', priority } },
      columns: { ...columns, [columnId]: { ...column, cardIds: [...column.cardIds, id] } },
    };
  }
```

- The new id is "the highest id so far + 1".
- Adding a card changes **two** parts of the state: the card goes into `cards`, and its id goes into the column's `cardIds`. Both get new objects, so Lit sees the change.
- `if (!title) return;` protects against a title that only had spaces: `required` accepts `"   "`, but `.trim()` turns it into `""`.

**What happens:** type "Ship it" in the *Done* column, choose **High** and press Enter. A red card appears at the bottom of *Done*, the counter goes up and the form is empty again. The new card can be dragged, moved and sorted like the others.

## Step 7: Saving the board

Refresh the page… and all your changes are gone. Let's save the board in `localStorage`.

Copy `step6-add-cards` to `step7-persist`.

### When should we save?

We could call a `save()` function in `_moveCard`, `_onCardAdd`, and so on. But then we'd have to remember to call it in **every** method that changes the board, forever.

Lit has a better place for this: the **lifecycle**. After every render, Lit calls `updated(changedProperties)`. `changedProperties` is a `Map` with the properties that changed in this update. So we can say: "whenever `_board` changed, save it". It doesn't matter **why** it changed.

```
property changes → willUpdate() → render() → updated()
                                              ↑ we save here
```

### Load and save

In `kanban-board.js`, add a helper above the class:

```js
const STORAGE_KEY = 'kanban-board';

function loadBoard() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
```

Use it in the constructor, and save in `updated()`:

```diff
  constructor() {
    super();
-    this._board = initialBoard;
+    this._board = loadBoard() ?? initialBoard;
  }
+
+  updated(changedProperties) {
+    if (changedProperties.has('_board')) {
+      try {
+        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._board));
+      } catch {
+        // Storage can be full or blocked (private mode): the board still works, it just isn't saved.
+      }
+    }
+  }
```

- `??` means: "if `loadBoard()` returns `null`, use `initialBoard`".
- `localStorage` only stores strings, so we use `JSON.stringify` and `JSON.parse`.
- The `try/catch` blocks are not optional. `localStorage` can throw in private windows or when it's full, and the board should keep working anyway.

> ℹ️ After `JSON.stringify`, the keys of `cards` become strings (`"1"` instead of `1`). That's fine: JavaScript always turns object keys into strings anyway, so `cards[1]` and `cards["1"]` are the same thing.

### Add a reset button

While testing, you'll want to start over. Add a button above the board:

```diff
    return html`
+      <button class="reset" @click=${this._reset}>Reset board</button>
      <div
        class="board"
```

```diff
+  _reset() {
+    this._board = initialBoard;
+  }
```

```diff
+    .reset {
+      margin-bottom: 16px;
+    }
```

We don't have to clear `localStorage`. Setting `_board` triggers an update, and `updated()` saves the fresh board for us.

**What happens:** move some cards and add a new one, then refresh. Everything is still there. Click **Reset board** and refresh again: the original four cards are back.

> 💡 You can see the saved data in DevTools → **Application** → **Local Storage** → `http://localhost:3000`.

🎉 You've built a complete Kanban board with three cooperating Web Components.

## Going further

Finished early? Try one or more of these. There are no solutions for them.

### Disable the arrows at the edges

The `←` button in *To do* and the `→` button in *Done* don't do anything. Disable them with a **boolean attribute binding**: `?disabled=${…}` adds the attribute when the value is `true` and removes it when it's `false`.

The problem: the card doesn't know whether its column is the first or the last one. You'll have to pass that information down from the board, through the column, to the card. Notice how annoying that is…

### Use `@lit/context` instead of passing everything down

…which is exactly the problem [`@lit/context`](https://lit.dev/docs/data/context/) solves. With context, the board can **provide** data, and any component deeper down can **consume** it without the column in between having to pass it on. You'll need to switch to a Vite setup with `npm install lit @lit/context` for this, like in [demo 01 – Lit](../demo-01-Lit).

### Animate the cards

When a card moves, it jumps. The [`@lit-labs/motion`](https://www.npmjs.com/package/@lit-labs/motion) package has an `animate()` directive that smoothly animates elements from their old position to their new one (the "FLIP" technique). Combined with `repeat`, sorting a column becomes a nice animation. This also needs a Vite setup.

### Drop between cards

Right now a dropped card always lands at the **bottom** of a column. Can you make it land where you drop it? Tip: in `_onDrop`, compare `e.clientY` with the position of each card (`getBoundingClientRect()`), and pass an `index` in the event's `detail`.

### More ideas

- A 🗑 button that deletes a card (don't forget to remove its id from the column **and** the card from `cards`).
- Edit the description of a card when you double-click it.
- Make a card slightly transparent while it's being dragged.

## Cheat sheet: Lit bindings

| Syntax                  | Kind      | What Lit does                                   | Used for                          |
| ----------------------- | --------- | ----------------------------------------------- | --------------------------------- |
| `${value}`              | child     | Renders text or a template                      | Content                           |
| `name=${value}`         | attribute | `setAttribute('name', value)`                   | Strings, CSS hooks, `aria-*`      |
| `.name=${value}`        | property  | `element.name = value`                          | Objects, arrays, numbers          |
| `?name=${value}`        | boolean   | Adds the attribute if `true`, removes it if not | `disabled`, `hidden`, `required`  |
| `@name=${handler}`      | event     | `addEventListener('name', handler)`             | `click`, `submit`, custom events  |

| Tool                         | When                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| `static properties = { x: {} }` | Public data that the parent sets                                   |
| `{ state: true }`            | Private data of the component itself                                  |
| `.map()`                     | Lists where the items have **no** internal state                      |
| `repeat(items, key, tpl)`    | Lists that change order **and** whose items have state or focus       |
| `classMap({ a: bool })`      | Toggling CSS classes                                                  |
| `nothing`                    | Render nothing                                                        |
| `bubbles: true`              | Parents should hear the event                                         |
| `composed: true`             | The event has to leave the shadow root it was dispatched in           |
| `updated(changed)`           | Side effects **after** a render: saving, measuring, focusing          |
