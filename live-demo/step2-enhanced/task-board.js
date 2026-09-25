import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class TaskBoard extends LitElement {
  static styles = css`
    :host {
      all: initial;
      display: block;
      font-family: sans-serif;
      max-width: 320px;
    }

    .task {
      background: #e0e7ff;
      border-radius: 8px;
      padding: 8px 12px;
      margin: 8px 0;
    }
  `;

  static properties = {
    _tasks: { state: true },
    _count: { state: true },
  };

  constructor() {
    super();
    this._tasks = [
      { id: 1, text: 'Research Lit' },
      { id: 2, text: 'Build demo' },
      { id: 3, text: 'Rehearse talk' },
    ];
    this._count = 0;
  }

  render() {
    return html`
      <p>Updates: ${this._count}</p>
      <button @click=${this._shuffle}>Shuffle tasks</button>
      ${this._tasks.map((task) => html`<div class="task">${task.text}</div>`)}
    `;
  }

  _shuffle() {
    this._tasks = [...this._tasks].sort(() => Math.random() - 0.5);
    this._count++;
  }
}

customElements.define('task-board', TaskBoard);
