# Capita Selecta: Lit

Source code for my 10-minute presentation on **Lit** (lit.dev), a small library for building web components.
Author: Amber Vanhooren.

## Which folder is shown on which slide

| Slide | What it shows | Folder |
|---|---|---|
| The problem (styles collide) | The task board before and after, with `all: initial` | `demo-02-remade/` (`task-board.js`), `demo-02/step4-chaos/` |
| Four concepts, one component / Lit vs React in code | The org chart built twice, in Lit and in React | `demo-01-Lit/` and `demo-01-React/` |
| Six core functions | Lines taken from my demos | `demo-01-Lit/`, `demo-03-remade/`, `demo-04-remade/` |
| Beyond snippets: two real ports | Fortune Teller and Couch Potato rebuilt in Lit | `assignment-react-native-lit/`, `couch-potato-lit/` |
| Big demo (video and steps 1 to 4) | The fractal tree: one component that renders itself | `demo-04-remade/` (step by step: `demo-04/step1-branch` to `step4-alive`) |
| Research and references | What I built per demo | all folders |

## What is in each folder

| Folder | What it is |
|---|---|
| `demo-01-Lit/` and `demo-01-React/` | The same org-chart app built in both frameworks. Explained in `README-demo-01.md`. |
| `demo-02/`, `demo-03/`, `demo-04/` | The exercise versions (README with steps, one folder per step with the solution). The READMEs were written by Claude, in the style of the exercises we get in class, to help me learn Lit. |
| `demo-02-remade/`, `demo-03-remade/`, `demo-04-remade/` | My own rebuilds of the task board, the kanban board and the fractal tree, without the steps. |
| `assignment-react-native-original/` | The given React Native app (Fortune Teller), unchanged. |
| `assignment-react-native-lit/` | My Lit port of it. Analysis in its `COMPARISON.md`. |
| `couch-potato-react/` | The given React Router app (Couch Potato) and its API server. |
| `couch-potato-lit/` | My Lit port of it. Reuses the original Playwright tests (48 of 48 pass). Analysis in its `COMPARISON.md`. |
| `THEORY.md` | My notes on what Lit is and how it compares to React. |

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
