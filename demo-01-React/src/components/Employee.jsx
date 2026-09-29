import { useState } from "react";

const Employee = ({ id, name, allTeams, currentTeamId, onTeamChange }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  return (
    <li>
      {name}{" "}
      {isEditMode ? (
        <TeamSelector
          teams={allTeams}
          selectedTeamId={currentTeamId}
          onTeamChange={(teamId) => onTeamChange(id, teamId)}
        />
      ) : (
        <button onClick={() => setIsEditMode(true)}>⚙︎</button>
      )}
    </li>
  );
};

const TeamSelector = ({ teams, selectedTeamId, onTeamChange }) => {
  return (
    <select
      defaultValue={selectedTeamId}
      onChange={(e) => onTeamChange(parseInt(e.target.value, 10))}
    >
      {Object.values(teams).map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  );
};

export default Employee;
