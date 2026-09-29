import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

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
      width: 100%;
      height: 100%;
      background: #78350f;
      border-radius: 8px;
    }
  `;

    constructor() {
        super();
        this.depth = 1;
    }

    render() {
        return html`<div class="branch"></div>`;
    }
}

customElements.define('fractal-tree', FractalTree);