import { SessionForm } from "../components/SessionForm.jsx";
import { getSession } from "../services/sessions.js"

export async function clientLoader({params}) {
  const id = params.id;
  const session = await getSession(`http://localhost:3000/sessions/${id}`)
  return { session }
}


export default function EditSession() {
  const { session } = {};
  return (
    <div className="form-page">
      <h2 className="form-page__title">Edit Session</h2>
      <SessionForm session={session} submitLabel="Save" />
    </div>
  );
}
