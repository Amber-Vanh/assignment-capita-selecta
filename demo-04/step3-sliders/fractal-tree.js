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
      background: #78350f;
      border-radius: 8px;
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
      <div class="branch">
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
