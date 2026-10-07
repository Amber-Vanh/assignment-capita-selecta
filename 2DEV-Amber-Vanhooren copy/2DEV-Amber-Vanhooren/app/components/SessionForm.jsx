import { Form, useNavigate } from "react-router";

export function SessionForm({ session, submitLabel = "Save" }) {
  let navigate = useNavigate();

  return (
    <Form method="post" className="session-form">
      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          required
          defaultValue={session?.date ?? ""}
        />
      </div>
      <div className="form-group">
        <label htmlFor="duration">Duration (minutes)</label>
        <input
          type="number"
          id="duration"
          name="duration"
          required
          min="1"
          defaultValue={session?.duration ?? ""}
        />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows="4"
          defaultValue={session?.notes ?? ""}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate(`/session`)}

          /* onClick={() => navigate to previous route} */
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}
