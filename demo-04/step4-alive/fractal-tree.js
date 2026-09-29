import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class FractalTree extends LitElement {
  static properties = {
    depth: { type: Number },
  };

  static styles = css`
    :host {
      display: block;
      width: 16px;
      height: 120px;
    }

    .branch {
      position: relative;
      width: 100%;
      height: 100%;
      background: hsl(var(--hue) 60% 35%);
      border-radius: 8px;
      transform-origin: bottom center;
      transition: background 0.4s;
      animation:
        grow 0.6s ease-out,
        sway 5s ease-in-out infinite;
    }

    @keyframes grow {
      from {
        scale: 1 0;
      }
    }

    @keyframes sway {
      25% {
        rotate: -2deg;
      }
      75% {
        rotate: 2deg;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .branch {
        animation: none;
      }
    }

    fractal-tree {
      position: absolute;
      bottom: 100%;
      left: 0;
      transform-origin: bottom center;
    }

    .left {
      transform: rotate(calc(-1 * var(--angle, 25deg))) scale(0.8);
    }

    .right {
      transform: rotate(var(--angle, 25deg)) scale(0.8);
    }
  `;

  constructor() {
    super();
    this.depth = 1;
  }

  render() {
    return html`
      <div class="branch" style="--hue: ${130 - this.depth * 12}">
        ${this.depth > 1
          ? html`
              <fractal-tree class="left" .depth=${this.depth - 1}></fractal-tree>
              <fractal-tree class="right" .depth=${this.depth - 1}></fractal-tree>
            `
          : nothing}
      </div>
    `;
  }
}

customElements.define('fractal-tree', FractalTree);
