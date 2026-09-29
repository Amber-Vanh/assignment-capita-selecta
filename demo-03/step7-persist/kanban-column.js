import { LitElement, html, css, nothing, repeat, classMap } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
import './kanban-card.js';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

class KanbanColumn extends LitElement {
  static properties = {
    column: { type: Object },
    cards: { type: Array },
    _sorted: { state: true },
    _dragDepth: { state: true },
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
      outline: 3px dashed transparent;
      transition: background 0.15s, outline-color 0.15s;
    }

    section.drag-over {
      background: #dbeafe;
      outline-color: #3b82f6;
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

    form {
      display: flex;
      gap: 4px;
      margin-top: 12px;
    }

    input {
      flex: 1;
      min-width: 0;
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
    this._dragDepth = 0;
  }

  get _visibleCards() {
    if (!this._sorted) return this.cards;
    return [...this.cards].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }

  render() {
    if (!this.column) return nothing;

    return html`
      <section
        class=${classMap({ 'drag-over': this._dragDepth > 0 })}
        @dragenter=${this._onDragEnter}
        @dragover=${this._onDragOver}
        @dragleave=${this._onDragLeave}
        @drop=${this._onDrop}
      >
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
              )}
        </div>
        <form @submit=${this._onSubmit}>
          <input name="title" placeholder="New card…" required />
          <select name="priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
          <button>Add</button>
        </form>
      </section>
    `;
  }

  _toggleSort() {
    this._sorted = !this._sorted;
  }

  _onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    this.dispatchEvent(
      new CustomEvent('card-add', {
        detail: {
          columnId: this.column.id,
          title: data.get('title').trim(),
          priority: data.get('priority'),
        },
        bubbles: true,
      })
    );
    form.reset();
  }

  _onDragEnter(e) {
    e.preventDefault();
    this._dragDepth++;
  }

  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  _onDragLeave() {
    this._dragDepth--;
  }

  _onDrop(e) {
    e.preventDefault();
    this._dragDepth = 0;
    const cardId = Number(e.dataTransfer.getData('text/plain'));
    this.dispatchEvent(
      new CustomEvent('card-drop', {
        detail: { cardId, columnId: this.column.id },
        bubbles: true,
      })
    );
  }
}

customElements.define('kanban-column', KanbanColumn);
