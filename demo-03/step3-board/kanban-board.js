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
      <div class="board">
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
}

customElements.define('kanban-board', KanbanBoard);
