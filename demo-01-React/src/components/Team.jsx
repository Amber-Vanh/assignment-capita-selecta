import Employee from "./Employee";

const Team = ({
  id,
  name,
  employeeIds,
  allTeams,
  allEmployees,
  onEmployeeTeamChange,
}) => {
  return (
    <article>
      <h3>{name}</h3>
      {employeeIds.length === 0 ? (
        <p>No employees in this team</p>
      ) : (
        <ul>
          {employeeIds.map((employeeId) => (
            <Employee
              key={employeeId}
              {...allEmployees[employeeId]}
              allTeams={allTeams}
              currentTeamId={id}
              onTeamChange={onEmployeeTeamChange}
            />
          ))}
        </ul>
      )}
    </article>
  );
};

export default Team;
