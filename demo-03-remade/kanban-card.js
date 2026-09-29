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
      cursor: grab;
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
    .actions {
      display: flex;
      gap: 4px;
    }
  `;

  constructor() {
    super();
    this._expanded = false;
  }

  render() {
    if (!this.card) return nothing;

    return html`
      <article draggable="true" @dragstart=${this._onDragStart}>
        <header>
          <h3>${this.card.title}</h3>
          <div class="actions">
            <button @click=${() => this._move(-1)} aria-label="Move left">←</button>
           <button @click=${this._toggle} aria-expanded=${this._expanded}>
              ${this._expanded ? '−' : '+'}
            </button>
           <button @click=${() => this._move(1)} aria-label="Move right">→</button>
         </div>
        </header>
        ${this._expanded ? html`<p>${this.card.description}</p>` : nothing}
      </article>
    `;
  }

  _toggle() {
    this._expanded = !this._expanded;
  }

  _move(direction) {
    this.dispatchEvent(
      new CustomEvent('card-move', {
        detail: { cardId: this.card.id, direction },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onDragStart(e) {
    e.dataTransfer.setData('text/plain', String(this.card.id));
    e.dataTransfer.effectAllowed = 'move';
  }
}

customElements.define('kanban-card', KanbanCard);