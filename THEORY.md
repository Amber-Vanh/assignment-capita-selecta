# Theory – Lit

Website: [lit.dev](https://lit.dev/) · Docs: [lit.dev/docs](https://lit.dev/docs/) · Cheat sheet: [lit.dev/articles/lit-cheat-sheet](https://lit.dev/articles/lit-cheat-sheet/) · Playground: [lit.dev/playground](https://lit.dev/playground/)

## Table of contents

- [1. What is Lit?](#1-what-is-lit)
- [2. Simple, fast, web components](#2-simple-fast-web-components)
  - [Simple](#simple)
  - [Fast](#fast)
  - [Web components](#web-components)
- [3. Implementation](#3-implementation)
  - [Custom elements](#custom-elements)
  - [Scoped styles](#scoped-styles)
  - [Reactive properties](#reactive-properties)
  - [Declarative templates](#declarative-templates)
- [4. Build anything](#4-build-anything)
- [5. Brands that use Lit](#5-brands-that-use-lit)
- [6. Documentation](#6-documentation)
  - [Install](#install)
  - [Summary of the docs](#summary-of-the-docs)
- [7. Lit cheat sheet](#7-lit-cheat-sheet)
- [8. Core functions](#8-core-functions)
- [9. Compared to React and Vue](#9-compared-to-react-and-vue)
  - [Architecture](#architecture)
  - [Performance, ease of use, ecosystem and popularity](#performance-ease-of-use-ecosystem-and-popularity)
- [10. Lit playground – examples](#10-lit-playground--examples)
  - [Basics](#basics)
  - [Reactive properties and state](#reactive-properties-and-state)
  - [Conditional templates](#conditional-templates)
  - [Repeating templates](#repeating-templates)
  - [classMap and styleMap directives](#classmap-and-stylemap-directives)
  - [Slotting children and composition](#slotting-children-and-composition)
  - [Async data with @lit/task](#async-data-with-littask)
  - [Sharing state with @lit/context](#sharing-state-with-litcontext)
  - [Animation with @lit-labs/motion](#animation-with-lit-labsmotion)

---

## 1. What is Lit?

**Lit** is **simple**, **fast** and built on **web components**.

```bash
npm i lit
```

> Lit is a simple library for building lightweight web components.
> At Lit's core is a boilerplate-killing component base class that provides reactive state, scoped styles and a declarative template system that's tiny, fast and expressive.

---

## 2. Simple, fast, web components

### Simple

*Skip the boilerplate.*

- Built on top of the web components standards.
- Adds only what makes you happy and productive: reactivity, declarative templates and a handful of thoughtful features.

### Fast

*Tiny footprint, instant updates.*

- About **5 KB** (minified and compressed).
- Keeps the bundle size small and the loading time short.
- Renders fast, because Lit only touches the **dynamic parts** of the UI when it updates.

### Web components

*Interoperable and future-ready.*

- Every Lit component is a **native web component**.
- Works anywhere you use HTML, with any framework or none at all.
- Ideal for building shareable components, design systems, or maintainable, future-ready sites and apps.

---

## 3. Implementation

```ts
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('simple-greeting')
export class SimpleGreeting extends LitElement {
  static styles = css`p { color: blue }`;

  @property()
  name = 'Somebody';

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
```

### Custom elements

- Lit components are standard custom elements.
- The browser treats them like built-in elements.

### Scoped styles

- Styles are scoped by default, using **Shadow DOM**.
- This keeps CSS selectors simple.
- It also ensures your component's styles don't affect any other styles on the page.

### Reactive properties

- Used to model your component's API and internal state.
- A Lit component re-renders whenever a reactive property changes.

### Declarative templates

- Lit templates are based on **tagged template literals**.
- They are simple, expressive and fast.
- They combine HTML markup with native JavaScript expressions inline.
- There is no custom syntax to learn and no compilation is required.

---

## 4. Build anything

**Shareable components**
- Interactive content or features that drop into any site, built on any stack.
- They are web components, so they are easy to build.

**Design systems**
- Help create experiences that are excellent and on brand.
- Work across multiple frameworks: build one set of components that works for every team.

**Sites and apps**
- Progressively enhance a static site, or build an entire site.
- Because they are web components, Lit minimizes lock-in and promotes maintainability.

---

## 5. Brands that use Lit

| Company | Project |
| --- | --- |
| Adobe | Spectrum Web Components |
| Alaska Airlines | Auro Design System |
| Cisco | Momentum UI |
| Google | Many projects |
| Home Assistant | Frontend UI |
| IBM | Carbon Web Components |
| ING | Lion Web Components |
| JSTOR | Pharos Design System |
| Microsoft | PWA Starter |
| Red Hat | One Platform Components |
| SAP | UI5 Web Components |
| Shoelace | Components |
| Hilla | Hilla Framework |
| VMware | Clarity Core |
| Wired Elements | Wired Elements |

Almost all of these are **design systems or component libraries**, which illustrates the "shareable components / design systems" use case well. Big companies use Lit as the implementation layer *underneath* their design system, so the same component works whether a team builds its product page in React, Angular or plain HTML.

- **Adobe:** their official design system, "build once, use across many frameworks internally".
- **IBM Carbon:** an open-source design system, one of the most mature and widely cited web-component-based design systems in the industry.
- **Home Assistant:** an end-user *application*.
- **Hilla:** a full-stack framework that uses Lit under the hood for its UI layer.

---

## 6. Documentation

Source: [lit.dev/docs](https://lit.dev/docs/)

- The main feature is the **`LitElement` base class**, a convenient and versatile extension of the native `HTMLElement`.
- *Expressive, declarative templates* make it easy to describe how a component should be rendered.
- *Reactive properties* represent a component's public API and/or internal state. The component re-renders automatically whenever a reactive property changes.
- *Styles* are scoped by default. This keeps CSS selectors simple and makes sure a component's styling won't pollute the rest of the page.
- Works great in both vanilla JavaScript and TypeScript.

### Install

**npm**

```bash
npm i lit
```

```js
// JavaScript
import {LitElement, html} from 'lit';
```

```ts
// TypeScript (with decorators)
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
```

**Bundled (no npm, straight from a CDN)**

```js
import {LitElement, html} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
```

### Summary of the docs

#### 1. Introduction ("What is Lit?")

At Lit's core is a **boilerplate-killing component base class** that provides **reactive state, scoped styles, and a declarative template system that's tiny, fast and expressive**. Every Lit component is a **standard web component**, which means it's natively supported by browsers and usable in any HTML environment, with any framework or none at all. That makes Lit ideal for shareable component libraries and design systems, or for progressively enhancing plain HTML sites.

The docs emphasize three selling points:
- **Simple:** it adds just reactivity, declarative templates and a handful of boilerplate-reducing features on top of the Web Components standard.
- **Fast:** it keeps track of a UI's dynamic parts and updates only those when state changes, rather than rebuilding and diffing a whole virtual tree.
- **Lightweight:** around 5 KB minified and compressed.

#### 2. Getting started

You can **install Lit via npm**, or skip tooling entirely and **import it as a pre-built, single-file bundle**: a standard JavaScript module with no dependencies that any modern browser can import directly from a script tag. There are also **official TypeScript and JavaScript starter kits** for building standalone components.

#### 3. Components (the core model)

This is the main part of the docs. A component is described as a container holding state that determines what UI it displays. It can react to input and fire events like any UI component, while also being a full HTML element with standard element APIs.

**Building one involves four concepts:**
- **Defining:** a Lit component is a custom element registered with the browser (via the `@customElement` decorator, shorthand for `customElements.define`).
- **Rendering:** a `render()` method returns a template that describes the component's output.
- **Reactive properties:** hold component state. Changing a reactive property triggers the reactive update cycle and re-renders the component. Property values can optionally be read from or reflected to attributes.
- **Styles:** encapsulated CSS, scoped to just that component.

**Lifecycle:** components expose both the **native custom-element callbacks** (connected / disconnected / attribute-changed / adopted) and a **Lit-specific reactive lifecycle** on top, which batches property changes into a single update.

**Styles:** Lit uses **Shadow DOM for encapsulation**, which gives three benefits:
1. DOM APIs like `document.querySelector` can't reach into a component's shadow DOM, so external scripts can't accidentally break it.
2. You can write scoped styles that don't leak in or out.
3. Composition is cleanly separated: the component controls its shadow DOM, while consumers control its light-DOM children via standard DOM APIs.

#### 4. Templates (lit-html)

- Templates use **JavaScript tagged template literals via the `html` function**.
- Rendering and re-rendering happen asynchronously in response to batched property changes, and **only the changed parts of the DOM are re-rendered**, not the whole tree.
- You embed JavaScript expressions directly as placeholders for text content, attributes, boolean attributes, properties and event handlers.
- Bindings are **one-way (parent → child)**. A child communicates back up by **firing events**.
- There is a **library of directives**, built-in helpers such as:
  - `map`: transform an iterable;
  - `choose` / `when`: conditional rendering;
  - `repeat`: efficient keyed list rendering for stateful or expensive-to-regenerate items.

#### 5. Composition

Besides nesting components inside each other's templates, Lit documents two other code-reuse patterns:
- **Reactive controllers:** separate objects that hook into a component's update lifecycle (a "has-a" relationship).
- **Class mixins:** reusable partial component definitions that you "mix in" via inheritance (an "is-a" relationship).

#### 6. Why choose Lit / positioning

The docs are upfront that Lit's capabilities are **comparable to React or Vue**, but Lit **minimizes lock-in**: you can mix vanilla web components with Lit ones, or migrate to another library one component at a time. The Lit team is also open about its Google/Polymer background: the team helps maintain tens of thousands of components at Google and has been involved with the Web Components standards from the start.

---

## 7. Lit cheat sheet

Source: [lit.dev/articles/lit-cheat-sheet](https://lit.dev/articles/lit-cheat-sheet/)

### Component definition

- `LitElement` is the base class for all components.
- Register a component with `@customElement` or `customElements.define`.
- `render()` returns the template, written with the `html` tagged literal.
- **Rule:** tag names must contain a dash, and the same tag name can't be defined twice on one page.

### Templating

- Conditionals are plain JavaScript expressions in the template.
- Bindings:
  - `.prop=${v}` sets a property;
  - `attr=${v}` sets an attribute;
  - `?attr=${v}` sets a boolean attribute.
- Events: `@event=${handler}`.
- Lists:
  - `Array.map()` / the `map()` directive, for simple cases;
  - `repeat()`, for efficient re-renders of lists that change;
  - Lit Virtualizer, for huge lists (labs status).
- `unsafeHTML` / `unsafeStatic` render raw HTML or dynamic tag names. **XSS risk**, so use them with trusted input only.

### Styles

- Defined in `static styles` using the `css` tagged literal.
- Scoped by default, so it's safe to use generic selectors.
- `classMap` for conditional classes.
- Share styles across components via module imports.
- **CSS custom properties** pierce shadow roots, which makes them good for shared values.
- **CSS Shadow Parts** (`part="x"` + `::part(x)`) let outside code style a component's internals.
- `exportparts` forwards a part through nested shadow roots.

### Shadow DOM

- Scopes styles and DOM, blocks an external `querySelector`, and enables `<slot>` composition.
- Can be disabled via `createRenderRoot()` (rarely recommended).
- Style slotted children with `::slotted()` or custom properties.

### Properties and state

- `@property` is a public reactive property (the external API).
- `@state` is private reactive state (internal only).
- Both trigger a re-render when they change.
- Array/object mutations (`.push()`) do **not** trigger an update automatically. Use `requestUpdate()`, a new reference, or `repeat()`.
- Custom attribute converters handle attribute ↔ property conversions that aren't the default.
- Reconcile dependent properties in `willUpdate()`, `update()` or `updated()`, depending on what they depend on (other properties, the DOM, browser APIs).

### Lifecycle

- **Order:** `constructor` → `connectedCallback` → `willUpdate` → `update` → `render` → `firstUpdated` → `updated` → `disconnectedCallback`
- Native browser callbacks: `constructor`, `connectedCallback`, `disconnectedCallback`.
- Lit-only callbacks: `willUpdate`, `update`, `render`, `firstUpdated`, `updated`.
- `willUpdate` and `render` also run server-side (SSR), so there is no DOM / browser API access there.
- Avoid setting reactive properties in `updated()`, because it risks extra re-renders.
- `updateComplete` is a promise you can `await` to know when the DOM update is finished.
- The `@lit/task` package manages async operations tied to the lifecycle.

### Events

- Listeners on the host element: add them in the `constructor`. They are cleaned up automatically by garbage collection.
- Listeners on global nodes (`document` / `window`): add them in `connectedCallback` and remove them in `disconnectedCallback`.

### Data flow and DOM access

- **Down:** properties/attributes (`.name=${}`, `?flag=${}`).
- **Up:** `dispatchEvent(new CustomEvent(...))` with `detail`, `bubbles: true` and `composed: true` (so the event can cross shadow roots).
- To avoid prop drilling: `@lit/context`.
- Get element references with `@query`, `@queryAsync` or the `ref()` directive.
- Access slotted content with `@queryAssignedElements`.

### Signals (emerging, via `@lit-labs/signals`)

- The `SignalWatcher` mixin triggers Lit updates when an accessed signal changes.
- The `watch()` directive pinpoints DOM updates without a full re-render.
- `computed()` derives one signal from others.
- `effect()` runs side effects when a signal changes (experimental).
- Goal: align with the cross-framework Signals standards proposal.

---

## 8. Core functions

1. **Custom element definition.** Lit components are registered as standard custom elements (via `@customElement` / `customElements.define`), so the browser treats them like built-in HTML elements. This is the foundation: everything else builds on top of the native Web Components standard.

2. **Declarative templating (`render()` + `html`).** The `render()` method describes what the component outputs, written with the `html` tagged template literal: plain HTML markup with native JS expressions inline, no custom syntax or compiler needed. This is Lit's core rendering engine (lit-html).

3. **Reactive properties.** Properties (`@property` for the public API, `@state` for private/internal state) automatically trigger a re-render whenever their value changes. This is what makes a Lit component "reactive": you change the data, and the UI updates itself.

4. **Scoped styles (via Shadow DOM).** Styles defined in `static styles` with the `css` tagged literal are automatically scoped to the component through Shadow DOM. They can't leak out, and outside styles can't leak in. This also gives you DOM isolation (`querySelector` can't reach inside) and `<slot>`-based composition.

5. **Efficient, fine-grained updates.** Lit doesn't rebuild and diff a whole virtual DOM tree. It tracks exactly which dynamic parts of a template depend on which properties, and updates only those parts directly. This is the mechanism behind the "fast" and "5 KB" claims.

6. **The lifecycle.** A predictable sequence (`constructor` → `connectedCallback` → `willUpdate` → `update` → `render` → `firstUpdated` → `updated` → `disconnectedCallback`) that lets you hook into exactly when a component initializes, re-renders or gets removed.

---

## 9. Compared to React and Vue

Links: [react.dev](https://react.dev/) · [vuejs.org](https://vuejs.org/) · [lit.dev](https://lit.dev/)

### Architecture

| Aspect | Lit | React | Vue |
| --- | --- | --- | --- |
| **Underlying model** | Native Web Components (Custom Elements + Shadow DOM) | Virtual DOM with its own component model | Virtual DOM with its own component model |
| **Rendering approach** | No virtual DOM: tracks and updates only the dynamic parts of the template directly | Virtual DOM diffing: builds a new tree, diffs it, patches the real DOM | Virtual DOM diffing (similar to React, with compiler-level optimizations) |
| **Bundle size** | ~5 KB (minified + compressed) | ~40+ KB (React + ReactDOM) | ~30–40 KB |
| **Templating syntax** | Tagged template literals (`` html`...` ``): plain JS + HTML, no compiler needed | JSX: HTML-like syntax embedded in JS, requires a build/transpile step (Babel) | Single-File Components (`.vue`) with template/script/style blocks, or JSX; usually needs a build step |
| **State / reactivity** | Reactive properties (`@property`, `@state`); the component re-renders on change | `useState` / `useReducer` hooks; re-renders trigger a virtual DOM diff | Reactive refs / reactive objects (Composition API) or `data()` (Options API) |
| **Styling** | Scoped automatically via Shadow DOM: true CSS encapsulation | Not scoped by default: needs CSS Modules, styled-components or similar | Scoped via `<style scoped>` in SFCs (the compiler adds unique attributes) |
| **Framework lock-in** | Minimal: the output is a standard custom element, usable anywhere | High: components only run inside a React tree/runtime | High: components only run inside a Vue app instance |
| **Interoperability** | Works in any framework (React, Vue, Angular) or with no framework, since it's just HTML | Needs wrappers/adapters to be used outside React | Needs wrappers/adapters to be used outside Vue |
| **Ecosystem / tooling** | Smaller and more minimal: routing, state management etc. are bring-your-own or via labs packages | Huge ecosystem (Next.js, Redux, React Router, ...) | Large ecosystem (Nuxt, Pinia, Vue Router, ...) |
| **Build step required?** | No: works directly in the browser via `<script type="module">` | Effectively yes (JSX needs transpiling) | Optional for the Options API + templates, but typical projects use one |
| **Governance / backing** | Google (Chrome team), standards-aligned | Meta | Independent (Evan You + community) |
| **Best fit for** | Shareable component libraries, design systems, progressively enhancing existing sites | Full-scale SPAs, complex client apps with rich ecosystems | Full-scale SPAs, apps that want a gentle learning curve + strong DX |

> **Key takeaway:** Lit's developer experience (reactive state, declarative templates, component composition) is *comparable* to React and Vue, but its output is a real, portable web-standard element rather than something that only exists inside a specific framework's runtime. That is the core architectural difference, not just a stylistic one.

### Performance, ease of use, ecosystem and popularity

| Axis | Lit | React | Vue |
| --- | --- | --- | --- |
| **Performance** | No virtual DOM: updates only the exact dynamic bindings. Very fast for its scope; the tiny 5 KB footprint keeps load time low | Virtual DOM diffing. Fast in practice, especially with React 19's compiler doing automatic memoization, but inherently more overhead than Lit's direct-update model | Virtual DOM diffing with compiler-level optimizations. Generally on par with or slightly faster than React in most benchmarks |
| **Ease of use** | Low learning curve if you know HTML/CSS/JS, no build step required, but fewer opinionated conventions/guardrails than a full framework | Moderate: JSX and hooks have a learning curve, but the huge amount of tutorials/examples lowers the practical barrier | Often cited as the gentlest learning curve of the three: approachable template syntax, strong official docs, beginner-friendly Options API |
| **Ecosystem** | Small and minimal: no official router/state library; relies on labs packages (`@lit/context`, `@lit/task`) or third parties | Massive: Next.js, Redux, React Router, huge third-party component/tooling ecosystem | Large and cohesive: official Nuxt (meta-framework), Pinia (state) and Vue Router, all maintained by the core team |
| **Popularity** | ~5.7M weekly npm downloads, ~21.6K GitHub stars; niche but real production adoption (used inside Google, Adobe and others for widgets/design systems) | ~128–153M weekly npm downloads, ~245K+ GitHub stars, roughly 68% frontend framework market share: by far the dominant choice | ~11.7–13.3M weekly npm downloads, ~54K–209K GitHub stars (depends on the source), ~18% market share; especially strong in Asia (Alibaba, Xiaomi) and Europe |
| **Use case fit** | Shareable component libraries, design systems, and progressively enhancing existing sites without full framework buy-in | Full-scale SPAs and complex apps that need a rich ecosystem (dashboards, large product apps) | Full-scale SPAs where the team wants strong DX and gentler onboarding than React |

**Notes on the numbers**
- Sources disagree on Vue's GitHub star count (54K vs 209K, depending on the source and date). Double-check the exact number against the source you cite.
- Raw popularity numbers undersell Lit a bit. It is often used as an *implementation detail* inside design systems (companies building their own component library on top of Lit) rather than as a top-level app framework, so its real-world reach is larger than its npm downloads suggest.

---

## 10. Lit playground – examples

Try it at [lit.dev/playground](https://lit.dev/playground/). You can use `.ts` files there; they are compiled automatically in the browser.

### Basics

```ts
import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`p { color: blue; }`;

  @property() name = 'World';

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
```

```html
<!-- index.html -->
<script type="module" src="./my-element.js"></script>
<my-element name="Playground"></my-element>
```

- Always import from `'lit'` and `'lit/decorators.js'`.
- `@customElement('my-element')` becomes the tag `<my-element>`.

### Reactive properties and state

```ts
import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('counter-app')
export class CounterApp extends LitElement {
  static styles = css`
    button { font-size: 1.2rem; padding: 0.5rem 1rem; }
  `;

  // Public reactive property – part of the component's API
  @property({type: Number}) step = 1;

  // Private reactive state – internal only, not exposed as an attribute
  @state() private _count = 0;

  render() {
    return html`
      <p>Count: ${this._count}</p>
      <button @click=${this._increment}>+${this.step}</button>
      <button @click=${this._reset}>Reset</button>
    `;
  }

  private _increment() {
    this._count += this.step;
  }

  private _reset() {
    this._count = 0;
  }
}
```

- `static styles = css` scopes the styling to just this component (Shadow DOM).
- `@property`: a public reactive property.
- `@state`: a private reactive property.
- `render()` returns the template. Every time something changes, Lit automatically reruns `render()` and patches only the changes into the DOM. It doesn't rebuild everything.
- `@` attaches an event listener.

### Conditional templates

```ts
import {html} from 'lit';

render() {
  return html`
    ${this._loggedIn
      ? html`<p>Welcome back, ${this.username}!</p>`
      : html`<button @click=${this._login}>Log in</button>`}
  `;
}
```

- Lit has no "if/else" template syntax. You use a JavaScript ternary expression inside `${...}`.

### Repeating templates

```ts
import {html} from 'lit';
import {repeat} from 'lit/directives/repeat.js';

render() {
  return html`
    <ul>
      ${repeat(
        this.items,
        (item) => item.id,
        (item, index) => html`<li>${index}: ${item.name}</li>`
      )}
    </ul>
  `;
}
```

- `repeat()` renders each item. It is more efficient for lists that reorder often, because it **preserves element identity** across re-renders.
- The **key function** is the important part: it says "this specific DOM node belongs to this specific data item".

### classMap and styleMap directives

```ts
import {html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {styleMap} from 'lit/directives/style-map.js';

render() {
  const classes = {active: this.isActive, disabled: this.isDisabled};
  const styles = {color: this.isActive ? 'green' : 'gray'};

  return html`
    <div class=${classMap(classes)} style=${styleMap(styles)}>
      Status indicator
    </div>
  `;
}
```

- `classMap` takes an object where each key is a class name and each value is a boolean. It only applies the classes whose value is `true`.
- `styleMap` does the same for inline CSS.

### Slotting children and composition

```ts
@customElement('fancy-card')
export class FancyCard extends LitElement {
  static styles = css`
    .card { border: 2px solid purple; border-radius: 8px; padding: 1rem; }
  `;

  render() {
    return html`
      <div class="card">
        <slot name="header"></slot>
        <slot></slot>
      </div>
    `;
  }
}
```

```html
<fancy-card>
  <h2 slot="header">My Title</h2>
  <p>This gets projected into the default slot.</p>
</fancy-card>
```

- `<slot>` is a native Shadow DOM feature that acts as a placeholder.
- `<slot name="header">` is a named slot: only children with a matching `slot="header"` attribute are placed there.
- An unnamed `<slot>` is the default slot and catches everything else.
- Conceptually the equivalent of React's `props.children`, but it works without a JavaScript framework.

### Async data with @lit/task

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Task} from '@lit/task';

@customElement('pokemon-viewer')
export class PokemonViewer extends LitElement {
  @property() pokemonName = 'pikachu';

  private _fetchTask = new Task(this, {
    task: async ([name], {signal}) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {signal});
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    args: () => [this.pokemonName],
  });

  render() {
    return this._fetchTask.render({
      pending: () => html`<p>Loading...</p>`,
      complete: (pokemon) => html`<p>${pokemon.name}: ${pokemon.height}m tall</p>`,
      error: (e) => html`<p>Error: ${e}</p>`,
    });
  }
}
```

- `Task` is a **reactive controller**: a separate object plugged into the component's lifecycle.
- `args: () => [this.pokemonName]` tells the Task which reactive properties it depends on. Whenever `pokemonName` changes, the Task runs again automatically.
- `task: async ([name], {signal}) => {...}` is the async function that does the work.
- `this._fetchTask.render({...})` is the payoff: instead of manually tracking loading/error/success booleans, Task gives you a declarative three-state render helper: `pending`, `complete` and `error`.

### Sharing state with @lit/context

```js
// context.js
import {createContext} from '@lit/context';
export const themeContext = createContext('theme');
```

```ts
// theme-provider.js
import {ContextProvider} from '@lit/context';
import {themeContext} from './context.js';

@customElement('theme-provider')
export class ThemeProvider extends LitElement {
  private _provider = new ContextProvider(this, {context: themeContext, initialValue: 'dark'});

  render() {
    return html`<slot></slot>`;
  }
}
```

```ts
// themed-button.js
import {ContextConsumer} from '@lit/context';
import {themeContext} from './context.js';

@customElement('themed-button')
export class ThemedButton extends LitElement {
  private _theme = new ContextConsumer(this, {context: themeContext});

  render() {
    return html`<button class=${this._theme.value}><slot></slot></button>`;
  }
}
```

- **The problem this solves:** normally data only flows down in Lit through properties/attributes, so deeply nested components would need every ancestor in between to pass a value down manually (prop drilling).
- `createContext('theme')` creates a unique context key that any component in the tree can use to provide or consume a value.
- `ContextProvider` makes a value available to any descendant, without the components in between needing to know about it.
- `ContextConsumer` reads the value directly via `this._theme.value`.
- This is the equivalent of **React's Context API**.

### Animation with @lit-labs/motion

```ts
import {html, css, LitElement} from 'lit';
import {animate} from '@lit-labs/motion';

@customElement('animated-list')
export class AnimatedList extends LitElement {
  @state() private _items = ['A', 'B', 'C'];

  render() {
    return html`
      ${this._items.map(
        (item) => html`
          <div ${animate()} @click=${() => this._shuffle()}>${item}</div>
        `
      )}
    `;
  }

  private _shuffle() {
    this._items = [...this._items].sort(() => Math.random() - 0.5);
  }
}
```

- `${animate()}` is placed as an **element directive**. It hooks into that specific DOM node's lifecycle to detect position/size changes between renders.
- `_shuffle()` creates a new shuffled array and reassigns `_items`. Because `_items` is reactive state, this triggers a re-render.
- `animate()` then smoothly moves each `<div>` from its old position to its new one.
