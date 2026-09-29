import Team from "./Team";

const Department = ({
  department,
  allTeams,
  allEmployees,
  onEmployeeTeamChange,
}) => {
  return (
    <article>
      <h2>{department.name}</h2>

      {department.teamIds.map((teamId) => (
        <Team
          key={teamId}
          {...allTeams[teamId]}
          allTeams={allTeams}
          allEmployees={allEmployees}
          onEmployeeTeamChange={onEmployeeTeamChange}
        />
      ))}
    </article>
  );
};

export default Department;
