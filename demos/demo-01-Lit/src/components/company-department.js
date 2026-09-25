import { LitElement, html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { sharedStyles } from "../shared-styles.js";
import "./company-team.js";

export class CompanyDepartment extends LitElement {
  static properties = {
    department: { type: Object },
    allTeams: { type: Object },
    allEmployees: { type: Object },
  };

  static styles = sharedStyles;

  render() {
    return html`
      <article>
        <h2>${this.department.name}</h2>

        ${repeat(
          this.department.teamIds,
          (teamId) => teamId,
          (teamId) => html`
            <company-team
              .team=${this.allTeams[teamId]}
              .allTeams=${this.allTeams}
              .allEmployees=${this.allEmployees}
            ></company-team>
          `
        )}
      </article>
    `;
  }
}

customElements.define("company-department", CompanyDepartment);
