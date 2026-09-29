import { LitElement, html, css, nothing, repeat } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
import './kanban-card.js';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

class KanbanColumn extends LitElement {
    static properties = {
        column: { type: Object },
        cards: { type: Array },
        _sorted: { state: true },
    };

    static styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
    }

    section {
      background: #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      min-height: 200px;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 12px;
    }

    h2 {
      font-size: 1.125rem;
      margin: 0;
    }

    .count {
      background: #cbd5e1;
      border-radius: 999px;
      font-size: 0.75rem;
      padding: 2px 8px;
    }

    .cards {
      display: grid;
      gap: 8px;
    }

    .empty {
      color: #64748b;
      font-style: italic;
      text-align: center;
    }
  `;

    constructor() {
        super();
        this.cards = [];
        this._sorted = false;
    }

    get _visibleCards() {
        if (!this._sorted) return this.cards;
        return [...this.cards].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    }

    render() {
        if (!this.column) return nothing;

        return html`
      <section>
        <header>
          <h2>${this.column.title} <span class="count">${this.cards.length}</span></h2>
          <button @click=${this._toggleSort}>
            ${this._sorted ? 'Original order' : 'Sort by priority'}
          </button>
        </header>
        <div class="cards">
          ${this.cards.length === 0
                ? html`<p class="empty">No cards yet</p>`
                : repeat(
                    this._visibleCards,
                    (card) => card.id,
                    (card) => html`<kanban-card .card=${card} priority=${card.priority}></kanban-card>`
                )
    }
        </div>
      </section >
    `;
    }

    _toggleSort() {
        this._sorted = !this._sorted;
    }
}

customElements.define('kanban-column', KanbanColumn);