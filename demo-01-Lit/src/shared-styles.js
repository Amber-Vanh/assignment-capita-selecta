import { css } from "lit";

// Global stylesheets (like open-props/normalize and open-props/buttons) don't
// reach inside a component's shadow DOM. CSS custom properties do, so the
// Open Props tokens (var(--size-2), ...) still work here.
export const sharedStyles = css`
  :host {
    display: block;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  h1,
  h2,
  h3,
  h4 {
    margin-top: 0;
    margin-bottom: 0.3em;
    font-weight: var(--font-weight-7);
    line-height: var(--font-lineheight-1);
  }

  article {
    margin-left: var(--size-4);
    margin-bottom: var(--size-4);
  }

  button {
    padding-inline: var(--size-2);
    padding-block: 0;
    font-size: 1.5em;
    font-family: inherit;
    color: inherit;
    background: var(--surface-3, ButtonFace);
    border: var(--border-size-1) solid var(--surface-4, ButtonBorder);
    border-radius: var(--radius-2);
    cursor: pointer;
  }

  select {
    font: inherit;
  }
`;
