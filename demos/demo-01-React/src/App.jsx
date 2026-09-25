import "./App.css";
import initialCompany from "./company";

import { useState } from "react";
import Department from "./components/Department";

function App() {
  const [company, setCompany] = useState(initialCompany);

  const handleEmployeeTeamChange = (employeeId, teamId) => {
    const tmpCompany = structuredClone(company);
    removeEmployeeFromTeam(employeeId, tmpCompany.teams);
    addEmployeeToTeam(employeeId, teamId, tmpCompany.teams);
    setCompany(tmpCompany);
  };

  const removeEmployeeFromTeam = (employeeId, teams) => {
    Object.values(teams).forEach((team) => {
      const index = team.employeeIds.indexOf(employeeId);
      if (index !== -1) {
        team.employeeIds.splice(index, 1);
      }
    });
  };

  const addEmployeeToTeam = (employeeId, teamId, teams) => {
    teams[teamId].employeeIds.push(employeeId);
  };

  return (
    <>
      <h1>{company.name}</h1>
      <div className="cols">
        <section>
          {Object.values(company.departments).map((department) => (
            <Department
              key={department.id}
              department={department}
              allTeams={company.teams}
              allEmployees={company.employees}
              onEmployeeTeamChange={handleEmployeeTeamChange}
            />
          ))}
        </section>
        <pre>{JSON.stringify(company, null, 2)}</pre>
      </div>
    </>
  );
}

export default App;
