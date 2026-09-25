import { LitElement, html, css } from "lit";
import { sharedStyles } from "../shared-styles.js";
import "./team-selector.js";

export class CompanyEmployee extends LitElement {
  static properties = {
    employee: { type: Object },
    allTeams: { type: Object },
    currentTeamId: { type: Number },
    // Local UI state, only this component needs it
    isEditMode: { state: true },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: list-item;
      }
    `,
  ];

  constructor() {
    super();
    this.isEditMode = false;
  }

  handleTeamChange(e) {
    // Instead of calling a callback prop, dispatch an event that bubbles up
    // (composed: true lets it cross shadow DOM boundaries) to <company-app>.
    this.dispatchEvent(
      new CustomEvent("employee-team-change", {
        detail: { employeeId: this.employee.id, teamId: e.detail.teamId },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      ${this.employee.name}
      ${this.isEditMode
        ? html`
            <team-selector
              .teams=${this.allTeams}
              .selectedTeamId=${this.currentTeamId}
              @team-change=${this.handleTeamChange}
            ></team-selector>
          `
        : html`<button @click=${() => (this.isEditMode = true)}>⚙︎</button>`}
    `;
  }
}

customElements.define("company-employee", CompanyEmployee);
