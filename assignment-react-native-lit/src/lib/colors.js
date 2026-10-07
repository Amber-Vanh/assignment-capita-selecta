import { css } from "lit";

// Same palette as src/constants/colors.ts in the React Native app, but as CSS
// custom properties: they cross the shadow DOM boundary, so every component can use them.
export const palette = css`
  :host {
    --parchment: #ede1c0;
    --old-ink: #241a10;
    --study-wood: #3a2a19;
    --candlelight-gold: #b8892b;
    --potion-crimson: #7c2f2f;
    --potion-emerald: #2f5d46;
    --spectral-navy: #141b22;
    --pensieve-silver-blue: #c7d4dE;
  }
  *, *::before, *::after { box-sizing: border-box; }
`;
