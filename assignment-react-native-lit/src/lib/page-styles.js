import { css } from "lit";

// react-native had PageTitle, PageHint, RevealBadge and ShareButton as components.
// In CSS they are just classes shared by every page's shadow root.
export const pageStyles = css`
  :host {
    display: block;
    position: relative;
    height: 100%;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
  }
  .capture {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .title {
    position: absolute;
    top: 104px;
    left: 0;
    right: 0;
    margin: 0;
    font-family: "ClimateCrisis", serif;
    font-weight: normal;
    font-size: min(44px, calc(var(--w, 100vw) * 0.075)); /* RN used a fixed 44, which overflows on narrow phones */
    line-height: 44px;
    text-align: center;
  }
  .hint {
    position: absolute;
    bottom: 88px;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0 40px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-align: center;
    text-transform: uppercase;
  }
  .reveal {
    background: url("/img/parchment.png") center / 100% 100%;
    filter: drop-shadow(2px 3px 4px rgb(0 0 0 / 0.4));
    display: grid;
    place-items: center;
  }
  button.share {
    position: absolute;
    bottom: 80px;
    left: 40px;
    right: 40px;
    padding: 14px;
    font: 600 12px system-ui, sans-serif;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: inherit;
    background: none;
    border: 1px solid currentColor;
    border-radius: 8px;
    cursor: pointer;
  }
  .status {
    position: absolute;
    bottom: 40px;
    left: 0;
    right: 0;
    margin: 0;
    text-align: center;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition-duration: 0.01ms !important; }
  }
`;

// react-native's adjustsFontSizeToFit has no CSS equivalent: pick a size by length.
export const fitFont = (text) => (text.length > 150 ? 15 : text.length > 100 ? 18 : 22);

export const routeBack = (fallback) =>
  history.length > 1 ? history.back() : (location.hash = fallback);
