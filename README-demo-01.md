# Assignment Capita Selecta

## Table of contents

- [Demo 01 – React (`demo-01-React`)](#demo-01--react-demo-01-react)
  - [Run it](#run-it)
  - [What happens in the demo](#what-happens-in-the-demo)
    - [1. The data is stored flat (normalized state)](#1-the-data-is-stored-flat-normalized-state)
    - [2. The state lives in `App`](#2-the-state-lives-in-app)
    - [3. The component tree and props](#3-the-component-tree-and-props)
    - [4. Local UI state in `Employee`](#4-local-ui-state-in-employee)
    - [5. Moving an employee (lifting state up)](#5-moving-an-employee-lifting-state-up)
  - [React concepts shown](#react-concepts-shown)
  - [Styling](#styling)
  - [Known limitations](#known-limitations)
- [Demo 01 – Lit (`demo-01-Lit`)](#demo-01--lit-demo-01-lit)
  - [Run it](#run-it-1)
  - [No React, but Vite](#no-react-but-vite)
  - [What happens in the demo](#what-happens-in-the-demo-1)
    - [1. Same flat data](#1-same-flat-data)
    - [2. Every component is a Web Component](#2-every-component-is-a-web-component)
    - [3. State in `<company-app>`](#3-state-in-company-app)
    - [4. Rendering with `html` templates](#4-rendering-with-html-templates)
    - [5. Local UI state in `<company-employee>`](#5-local-ui-state-in-company-employee)
    - [6. Moving an employee with events](#6-moving-an-employee-with-events)
    - [7. Styling and Shadow DOM](#7-styling-and-shadow-dom)
- [React vs Lit – the differences](#react-vs-lit--the-differences)
  - [What stays the same](#what-stays-the-same)
  - [Conclusion](#conclusion)

---

## Demo 01 – React (`demo-01-React`)

A small React app (Vite + React 19) that shows the structure of a company, **TechCorp**. The company has departments, the departments have teams, and the teams have employees. You can move an employee to a different team. The page updates right away, and next to it you can see the raw state as JSON.

### Run it

```bash
cd demo-01-React
npm install
npm run dev
```

### What happens in the demo

#### 1. The data is stored flat (normalized state)

The starting data is in [`src/company.js`](demo-01-React/src/company.js). Departments, teams and employees are **not** nested inside each other. Each one is its own lookup table, keyed by `id`, and they point to each other with ID arrays:

```js
departments: { 1: { id: 1, name: "Engineering", teamIds: [101, 102] }, ... },
teams:       { 101: { id: 101, name: "Frontend Team", employeeIds: [1001, 1002] }, ... },
employees:   { 1001: { id: 1001, name: "Alice" }, ... },
```

This means:
- every employee exists in exactly one place, so there are no duplicate copies that can get out of sync;
- you can find any team or employee directly by its ID (`teams[101]`) without searching through nested arrays;
- moving an employee only changes the `employeeIds` arrays of two teams.

#### 2. The state lives in `App`

[`src/App.jsx`](demo-01-React/src/App.jsx) puts the whole company object into state with `useState(initialCompany)`. `App` renders:
- one `Department` component for every department (`Object.values(company.departments).map(...)`);
- a `<pre>` block with `JSON.stringify(company, null, 2)`, so you can watch the state change live.

#### 3. The component tree and props

```
App
└── Department        (one per department)
    └── Team          (one per teamId in the department)
        └── Employee  (one per employeeId in the team)
            └── TeamSelector (dropdown, only shown in edit mode)
```

- **Department** loops over its `teamIds` and looks up each team with `allTeams[teamId]`. It spreads the team into `Team` (`{...allTeams[teamId]}`).
- **Team** loops over its `employeeIds` and looks up each employee with `allEmployees[employeeId]`. If the team has no employees, it shows *"No employees in this team"* (conditional rendering).
- **Employee** shows the employee's name and a ⚙︎ button.

The lookup tables (`allTeams`, `allEmployees`) and the callback `onEmployeeTeamChange` are passed down through every level. This is called **prop drilling**.

#### 4. Local UI state in `Employee`

Each `Employee` has its own state: `const [isEditMode, setIsEditMode] = useState(false)`. When you click ⚙︎, `isEditMode` becomes `true` and the button is replaced by a `TeamSelector` dropdown that lists every team. This state belongs to the component itself, because no other component needs to know about it.

#### 5. Moving an employee (lifting state up)

When you pick another team in the dropdown:

1. `TeamSelector` calls `onTeamChange(parseInt(e.target.value, 10))`.
2. `Employee` adds its own ID and calls `onTeamChange(id, teamId)`.
3. That call goes back up through `Team` and `Department` to `handleEmployeeTeamChange` in `App`.
4. `App` updates the state **immutably**:
   ```js
   const tmpCompany = structuredClone(company);        // deep copy, the original state is never mutated
   removeEmployeeFromTeam(employeeId, tmpCompany.teams); // splice the id out of its current team
   addEmployeeToTeam(employeeId, teamId, tmpCompany.teams); // push the id into the new team
   setCompany(tmpCompany);                              // new object → React re-renders
   ```

`structuredClone` makes a deep copy, so changing `tmpCompany` with `splice`/`push` does not touch the current state. React sees a new object reference, re-renders the tree, and the employee appears under the new team. The JSON view updates too.

### React concepts shown

| Concept | Where |
| --- | --- |
| `useState` for app state | `App.jsx`: `company` |
| `useState` for local UI state | `Employee.jsx`: `isEditMode` |
| Normalized / flat state | `company.js` |
| Lists with `map` and `key` | `App`, `Department`, `Team`, `TeamSelector` |
| Spreading props (`{...obj}`) | `Department` → `Team`, `Team` → `Employee` |
| Conditional rendering | `Team` (empty team), `Employee` (button or dropdown) |
| Lifting state up with callback props | `onEmployeeTeamChange` → `onTeamChange` |
| Immutable updates (`structuredClone`) | `handleEmployeeTeamChange` in `App.jsx` |

### Styling

- [Open Props](https://open-props.style/) is used for design tokens, a CSS reset (`normalize`) and button styles ([`src/index.css`](demo-01-React/src/index.css)).
- [`src/App.css`](demo-01-React/src/App.css) puts the page in two columns: the company tree on the left and the JSON state on the right.

### Known limitations

- `isEditMode` is never set back to `false` in the code. The dropdown only closes after a move because the `Employee` is rendered under a different `Team`, so React creates a new component and its state starts over. If you open the dropdown and don't change anything, you can't close it again.
- `TeamSelector` is an **uncontrolled** `<select>` (`defaultValue` instead of `value`).
- Because the data and the callback are passed through every level (prop drilling), this is a good candidate for `useReducer` and/or React Context.

---

## Demo 01 – Lit (`demo-01-Lit`)

The same TechCorp exercise, rebuilt with [Lit](https://lit.dev/) instead of React. It uses the same data, the same component structure and the same behaviour: click ⚙︎, choose a team, and the employee moves while the JSON on the right updates. The code is plain JavaScript (Lit 3, no decorators, no TypeScript), bundled with Vite.

### Run it

```bash
cd demo-01-Lit
npm install
npm run dev
```

### No React, but Vite

**No React.** [`package.json`](demo-01-Lit/package.json) only has `lit` and `open-props` as dependencies. None of the Lit files import anything from React, and there is no JSX.

**Vite is used, but only as a build tool.** It is the only devDependency. It doesn't appear in the app code; it runs the dev server and bundles the files. It is needed for two things:

1. **Bare imports.** The code imports packages by name, like `import { LitElement } from "lit"`. Browsers can't find a package from a name like that on their own, so Vite resolves it from `node_modules`.
2. **CSS imports.** `import "./index.css"` in `main.js`, and the `@import "open-props/style"` inside that file, are handled by Vite. Browsers can't load a CSS file through a JavaScript import like that.

Vite is not specific to React. The React demo also uses Vite, plus the `@vitejs/plugin-react` plugin to compile JSX. The Lit version needs no plugin, because `html` templates are already plain JavaScript.

**It could also run without Vite.** You would load Lit and Open Props from a CDN instead:

```js
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";
```

and add a `<link>` to the Open Props CSS in `index.html`. Then any simple static server can serve it, with no `npm install` and no build step. The downside is that the app depends on the CDN and nothing gets bundled or optimised. React can't do this as easily, because JSX always has to be compiled first.

### What happens in the demo

#### 1. Same flat data

[`src/company.js`](demo-01-Lit/src/company.js) is the same file as in the React demo: separate lookup tables for departments, teams and employees, linked by IDs.

#### 2. Every component is a Web Component

Each component is a class that extends `LitElement` and is registered as a real HTML tag with `customElements.define`:

```
<company-app>                  (holds the state)
└── <company-department>       (one per department)
    └── <company-team>         (one per teamId)
        └── <company-employee> (one per employeeId)
            └── <team-selector> (dropdown, only in edit mode)
```

[`index.html`](demo-01-Lit/index.html) just contains `<company-app></company-app>`. The browser recognises the tag as soon as [`src/main.js`](demo-01-Lit/src/main.js) imports the component.

#### 3. State in `<company-app>`

[`company-app.js`](demo-01-Lit/src/components/company-app.js) declares the company as internal reactive state:

```js
static properties = {
  company: { state: true },
};

constructor() {
  super();
  this.company = initialCompany;
}
```

Lit watches `this.company`. When a new value is assigned, `render()` runs again.

#### 4. Rendering with `html` templates

Lit components don't use JSX. They return an `html` tagged template literal from `render()`, and pass data down with **property bindings** (the `.` prefix):

```js
<company-team
  .team=${this.allTeams[teamId]}
  .allTeams=${this.allTeams}
  .allEmployees=${this.allEmployees}
></company-team>
```

Lists are rendered with the `repeat()` directive, which uses a key (the ID) the same way React's `key` prop does. Conditional rendering is a plain ternary, for example *"No employees in this team"* in [`company-team.js`](demo-01-Lit/src/components/company-team.js).

#### 5. Local UI state in `<company-employee>`

[`company-employee.js`](demo-01-Lit/src/components/company-employee.js) has its own `isEditMode: { state: true }`. Clicking ⚙︎ (`@click=${() => (this.isEditMode = true)}`) swaps the button for a `<team-selector>`.

#### 6. Moving an employee with events

Here the Lit version works differently from React. There is **no callback prop passed down**. The components send **events** up instead:

1. [`<team-selector>`](demo-01-Lit/src/components/team-selector.js) fires a `team-change` event with `{ teamId }` when the `<select>` changes.
2. `<company-employee>` listens with `@team-change`, adds its own ID, and fires a new event:
   ```js
   this.dispatchEvent(
     new CustomEvent("employee-team-change", {
       detail: { employeeId: this.employee.id, teamId: e.detail.teamId },
       bubbles: true,   // travels up the DOM tree
       composed: true,  // is allowed to leave the shadow DOM
     })
   );
   ```
3. The event travels up through `<company-team>` and `<company-department>`, which don't need to know about it.
4. `<company-app>` catches it with `<section @employee-team-change=${this.handleEmployeeTeamChange}>` and updates the state immutably, the same way as React:
   ```js
   const tmpCompany = structuredClone(this.company);
   this.removeEmployeeFromTeam(employeeId, tmpCompany.teams);
   this.addEmployeeToTeam(employeeId, teamId, tmpCompany.teams);
   this.company = tmpCompany; // new object → Lit re-renders
   ```

#### 7. Styling and Shadow DOM

Each component renders into its own **Shadow DOM**, so its styles are scoped: CSS from outside does not get in, and CSS from inside does not leak out.

- [`src/index.css`](demo-01-Lit/src/index.css) loads the Open Props variables and `normalize` for the page itself.
- Global stylesheets like `open-props/buttons` do **not** reach inside a shadow root. CSS custom properties (`var(--size-4)`) **do** pass through, because they are inherited.
- [`src/shared-styles.js`](demo-01-Lit/src/shared-styles.js) therefore holds a shared `css` block (headings, `article`, buttons) that is built from the Open Props variables and added to every component's `static styles`.

---

## React vs Lit – the differences

| Topic | React (`demo-01-React`) | Lit (`demo-01-Lit`) |
| --- | --- | --- |
| **What a component is** | A function that returns JSX | A class that extends `LitElement`, registered as a real HTML element (Web Component) |
| **Using a component** | `<Department />`, only works inside React | `<company-department>`, a real tag that works in any HTML page or framework |
| **Templates** | JSX, which needs a compile step | `html` tagged template literals, which are standard JavaScript |
| **State** | `useState` hook: `const [company, setCompany] = useState(...)` | `static properties = { company: { state: true } }` + `this.company = ...` |
| **Updating state** | Call the setter: `setCompany(tmpCompany)` | Assign the property: `this.company = tmpCompany` |
| **Passing data down** | Props: `allTeams={company.teams}` | Property bindings: `.allTeams=${this.company.teams}` |
| **Spreading props** | `{...allTeams[teamId]}` | Not possible, so the whole object is passed: `.team=${allTeams[teamId]}` |
| **Event listeners** | `onClick={...}` | `@click=${...}` |
| **Boolean attributes** | `disabled={x}` | `?selected=${x}` |
| **Lists** | `.map()` + `key` prop | `repeat(items, keyFn, templateFn)` directive |
| **Communication upwards** | Callback prop (`onEmployeeTeamChange`) passed through **every** level (prop drilling) | `CustomEvent` with `bubbles` + `composed`; the components in between don't need to pass anything |
| **Styling** | Global CSS files (`App.css`, `index.css`), which apply to everything | `static styles` per component, scoped inside the Shadow DOM |
| **Global CSS libraries** | `open-props/buttons` styles all buttons | Only CSS variables pass the shadow boundary, so button styles are rewritten in `shared-styles.js` |
| **Rendering** | Virtual DOM: the whole tree is re-rendered and compared | No virtual DOM: Lit only updates the dynamic parts (`${...}`) of a template |
| **`<select>` in `TeamSelector`** | Uncontrolled (`defaultValue`) | `?selected` on the matching `<option>` |
| **Size** | React + ReactDOM (~60 kB gzipped) | Lit (~5 kB gzipped) |
| **Tooling** | Vite + React plugin (for JSX) | Plain Vite, no plugin needed |

### What stays the same

- The flat (normalized) data structure.
- The component tree: app → department → team → employee → team selector.
- Immutable state updates with `structuredClone`: both libraries only re-render when they get a **new** object reference.
- Local UI state (`isEditMode`) inside the employee component. In both versions the dropdown closes after a move, because the employee element is created again under the new team, so its state starts over.

### Conclusion

- **React** keeps everything in its own world: JSX, hooks and a virtual DOM. Data goes down through props and changes come back up through callbacks. That is very explicit, but it leads to prop drilling in a deep tree like this one.
- **Lit** stays close to the web platform: components are real custom elements, templates are plain JavaScript, styles are scoped by the Shadow DOM, and changes go up through standard DOM events. The result is smaller and works in any framework. The downside is that Shadow DOM makes global styling harder, and there is less built-in tooling and ecosystem than React has.
