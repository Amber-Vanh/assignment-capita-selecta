import { LitElement, html, css } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { sharedStyles } from "../shared-styles.js";
import initialCompany from "../company.js";
import "./company-department.js";

export class CompanyApp extends LitElement {
  static properties = {
    // Internal reactive state, like useState in React
    company: { state: true },
  };

  static styles = [
    sharedStyles,
    css`
      .cols {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
    `,
  ];

  constructor() {
    super();
    this.company = initialCompany;
  }

  handleEmployeeTeamChange(e) {
    const { employeeId, teamId } = e.detail;
    const tmpCompany = structuredClone(this.company);
    this.removeEmployeeFromTeam(employeeId, tmpCompany.teams);
    this.addEmployeeToTeam(employeeId, teamId, tmpCompany.teams);
    // Assigning a new object triggers a re-render
    this.company = tmpCompany;
  }

  removeEmployeeFromTeam(employeeId, teams) {
    Object.values(teams).forEach((team) => {
      const index = team.employeeIds.indexOf(employeeId);
      if (index !== -1) {
        team.employeeIds.splice(index, 1);
      }
    });
  }

  addEmployeeToTeam(employeeId, teamId, teams) {
    teams[teamId].employeeIds.push(employeeId);
  }

  render() {
    return html`
      <h1>${this.company.name}</h1>
      <div class="cols">
        <section @employee-team-change=${this.handleEmployeeTeamChange}>
          ${repeat(
            Object.values(this.company.departments),
            (department) => department.id,
            (department) => html`
              <company-department
                .department=${department}
                .allTeams=${this.company.teams}
                .allEmployees=${this.company.employees}
              ></company-department>
            `
          )}
        </section>
        <pre>${JSON.stringify(this.company, null, 2)}</pre>
      </div>
    `;
  }
}

customElements.define("company-app", CompanyApp);
