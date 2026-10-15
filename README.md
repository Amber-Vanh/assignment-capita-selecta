# Capita Selecta: Lit

Source code for my 10-minute presentation on **Lit** (lit.dev), a small library for building web components.
Author: Amber Vanhooren.

This README explains what is in every folder, who made it, and how it all fits together.

## How I worked (and where AI was used)

I used Claude as a learning tool. For each topic Claude wrote an exercise-style README (the kind of exercise we get in class) with the steps and a solution per step. I then read it, built the demo myself, and studied the solutions. For the two bigger ports, Claude and I built the Lit versions together. The written docs (READMEs, `THEORY.md`, the `COMPARISON.md` analyses) were written with or by Claude. The slides are my own presentation of what I learned.

Legend used below:

- **Mine**: I wrote the code.
- **Together**: built together with Claude, with me making the decisions.
- **Claude**: written by Claude as study material.
- **Given**: material I received (class assignments), unchanged.

## What is in each folder

| Folder | Who made it | What it is |
|---|---|---|
| `demo-01-Lit/` and `demo-01-React/` | Mine (code). Docs by Claude. | The same org-chart app (departments, teams, employees; move an employee between teams), built once in Lit and once in React, to compare the two. Explained in `README-demo-01.md`. |
| `demo-02-remade/` | Mine | Task board. A static page turned into a Lit component, used in the problem slides (`all: initial`). |
| `demo-03-remade/` | Mine | Kanban board: cards, columns, drag and drop, saved in `localStorage`. |
| `demo-04-remade/` | Mine | The big demo: a fractal tree, one component that renders itself, driven by two sliders. |
| `demo-02/`, `demo-03/`, `demo-04/` | Claude | The exercise versions I learned from: a README with steps, and a folder per step with the solution. My `-remade` folders are my own version of each. |
| `assignment-react-native-lit/` | Together | Lit port of the Fortune Teller app (every screen). Analysis in its `COMPARISON.md`. |
| `couch-potato-lit/` | Together | Lit port of the Couch Potato app. It reuses the original Playwright tests (48 of 48 pass). Analysis in its `COMPARISON.md`. |
| `assignment-react-native-original/` | Given | The original React Native (Expo) app, unchanged. |
| `couch-potato-react/` | Given | The original React Router app and its API server, unchanged. |
| `THEORY.md` | Claude | Study notes on what Lit is and how it compares to React. |

## Which folder is on which slide

| Slide | Folder |
|---|---|
| The problem (global CSS wrecks the widget, Shadow DOM, `all: initial`) | `demo-02-remade/` |
| Four concepts, one component / Lit vs React in code / Sending the change back up | `demo-01-Lit/` and `demo-01-React/` |
| Two real ports | `assignment-react-native-lit/`, `couch-potato-lit/` (numbers from their `COMPARISON.md`) |
| The big demo (video and steps 1 to 3) | `demo-04-remade/` |
| Research: what I built | all the demos above, including `demo-03-remade/` |

## How each demo works

**demo-01 (org chart).** The data is stored flat: departments, teams and employees are lookup tables that point to each other by ID. In React, the state lives in `App` and a callback prop (`onTeamChange`) is passed down. In Lit, each component is a custom element and the child fires a `CustomEvent` (`bubbles` and `composed`) that travels up on its own. This is the core comparison in the talk.

**demo-02 (task board).** The same page with and without Shadow DOM. The page's CSS (`*:not(task-board) { ... !important }`) wrecks everything except the component, which is protected by Shadow DOM. The `:host { all: initial }` line stops inherited styles from crossing in.

**demo-03 (kanban).** Card, column and board components that talk through events. It adds drag and drop, adding cards, and saving the board to `localStorage`.

**demo-04 (fractal tree).** One `<fractal-tree>` component renders two smaller copies of itself until depth reaches 1. At depth 8 that is 255 real elements, each with its own Shadow DOM. The depth slider sets a reactive property, so the tree re-renders. The angle slider only sets a CSS variable (`--angle`) on the root, which passes through every shadow root, so nothing re-renders but every branch changes. That is the same inheritance rule as in the problem slides, used on purpose.

**Fortune Teller port.** A React Native app rebuilt in Lit: start screen, a looping pager, three fortune pages, history and detail. About 30% fewer lines, 23 KB gzipped.

**Couch Potato port.** A React Router app rebuilt with Lit and `@lit-labs/router`. The router has no loaders or actions, so those parts are written by hand. The original 48 Playwright tests run against it.

## How to run each one

Demos 02, 03 and 04 have no build step. Lit is loaded from a CDN, so you need an internet connection.

```bash
cd demo-04-remade        # or demo-02-remade, demo-03-remade
npx serve .              # then open the address it prints
```

The Vite projects need Node 18 or newer:

```bash
cd demo-01-Lit           # or demo-01-React, assignment-react-native-lit
npm install
npm run dev
```

Couch Potato needs its API running first:

```bash
cd couch-potato-react/server && npm install && npm start     # terminal 1, port 3000
cd couch-potato-lit && npm install && npm run dev            # terminal 2, port 5173
cd couch-potato-lit && npm run test:chrome                   # the 48 tests (they mock the API)
```

`node_modules`, `dist` and the git history are left out of this zip to keep it small. `npm install` brings back what is needed.
