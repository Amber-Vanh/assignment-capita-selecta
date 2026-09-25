import { LitElement, html, css } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { sharedStyles } from "../shared-styles.js";

export class TeamSelector extends LitElement {
  static properties = {
    teams: { type: Object },
    selectedTeamId: { type: Number },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: inline-block;
      }
    `,
  ];

  handleChange(e) {
    this.dispatchEvent(
      new CustomEvent("team-change", {
        detail: { teamId: parseInt(e.target.value, 10) },
      })
    );
  }

  render() {
    return html`
      <select @change=${this.handleChange}>
        ${repeat(
          Object.values(this.teams),
          (team) => team.id,
          (team) => html`
            <option
              value=${team.id}
              ?selected=${team.id === this.selectedTeamId}
            >
              ${team.name}
            </option>
          `
        )}
      </select>
    `;
  }
}

customElements.define("team-selector", TeamSelector);
