import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';

class KanbanCard extends LitElement {
    static properties = {
        card: { type: Object },
        priority: { type: String },
        _expanded: { state: true },
    };

    static styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      --accent: #94a3b8;
    }

    :host([priority='high']) {
      --accent: #ef4444;
    }

    :host([priority='medium']) {
      --accent: #f59e0b;
    }

    :host([priority='low']) {
      --accent: #22c55e;
    }

    article {
      background: white;
      border-left: 6px solid var(--accent);
      border-radius: 8px;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.15);
      padding: 8px 12px;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    h3 {
      font-size: 1rem;
      margin: 0;
    }

    p {
      color: #475569;
      font-size: 0.875rem;
      margin: 8px 0 0;
    }
  `;

    constructor() {
        super();
        this._expanded = false;
    }

    render() {
        if (!this.card) return nothing;

        return html`
      <article>
        <header>
          <h3>${this.card.title}</h3>
          <button @click=${this._toggle} aria-expanded=${this._expanded}>
            ${this._expanded ? '−' : '+'}
          </button>
        </header>
        ${this._expanded ? html`<p>${this.card.description}</p>` : nothing}
      </article>
    `;
    }

    _toggle() {
        this._expanded = !this._expanded;
    }
}

customElements.define('kanban-card', KanbanCard);