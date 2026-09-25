import { LitElement, html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { sharedStyles } from "../shared-styles.js";
import "./company-employee.js";

export class CompanyTeam extends LitElement {
  static properties = {
    team: { type: Object },
    allTeams: { type: Object },
    allEmployees: { type: Object },
  };

  static styles = sharedStyles;

  render() {
    const { id, name, employeeIds } = this.team;
    return html`
      <article>
        <h3>${name}</h3>
        ${employeeIds.length === 0
          ? html`<p>No employees in this team</p>`
          : html`
              <ul>
                ${repeat(
                  employeeIds,
                  (employeeId) => employeeId,
                  (employeeId) => html`
                    <company-employee
                      .employee=${this.allEmployees[employeeId]}
                      .allTeams=${this.allTeams}
                      .currentTeamId=${id}
                    ></company-employee>
                  `
                )}
              </ul>
            `}
      </article>
    `;
  }
}

customElements.define("company-team", CompanyTeam);
