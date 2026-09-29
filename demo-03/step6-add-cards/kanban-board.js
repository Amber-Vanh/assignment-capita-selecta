import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
import { initialBoard } from './board-data.js';
import './kanban-column.js';

class KanbanBoard extends LitElement {
  static properties = {
    _board: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      align-items: start;
    }
  `;

  constructor() {
    super();
    this._board = initialBoard;
  }

  render() {
    const { columnOrder, columns, cards } = this._board;

    return html`
      <div
        class="board"
        @card-move=${this._onCardMove}
        @card-drop=${this._onCardDrop}
        @card-add=${this._onCardAdd}
      >
        ${columnOrder.map((columnId) => {
          const column = columns[columnId];
          return html`
            <kanban-column
              .column=${column}
              .cards=${column.cardIds.map((cardId) => cards[cardId])}
            ></kanban-column>
          `;
        })}
      </div>
    `;
  }

  _onCardMove(e) {
    const { cardId, direction } = e.detail;
    const { columnOrder, columns } = this._board;
    const fromIndex = columnOrder.findIndex((columnId) => columns[columnId].cardIds.includes(cardId));
    const toColumnId = columnOrder[fromIndex + direction];
    if (toColumnId) this._moveCard(cardId, toColumnId);
  }

  _onCardDrop(e) {
    const { cardId, columnId } = e.detail;
    this._moveCard(cardId, columnId);
  }

  _onCardAdd(e) {
    const { columnId, title, priority } = e.detail;
    if (!title) return;
    const { columns, cards } = this._board;
    const id = Math.max(0, ...Object.keys(cards).map(Number)) + 1;
    const column = columns[columnId];

    this._board = {
      ...this._board,
      cards: { ...cards, [id]: { id, title, description: '', priority } },
      columns: { ...columns, [columnId]: { ...column, cardIds: [...column.cardIds, id] } },
    };
  }

  _moveCard(cardId, toColumnId) {
    const { columns } = this._board;
    const fromColumn = Object.values(columns).find((column) => column.cardIds.includes(cardId));
    if (!fromColumn || fromColumn.id === toColumnId) return;
    const toColumn = columns[toColumnId];

    this._board = {
      ...this._board,
      columns: {
        ...columns,
        [fromColumn.id]: { ...fromColumn, cardIds: fromColumn.cardIds.filter((id) => id !== cardId) },
        [toColumn.id]: { ...toColumn, cardIds: [...toColumn.cardIds, cardId] },
      },
    };
  }
}

customElements.define('kanban-board', KanbanBoard);
