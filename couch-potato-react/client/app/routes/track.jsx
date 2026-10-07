import { getCategories } from "../services/categories";
import { Form, redirect, useNavigate } from "react-router";
import { createSession } from "../services/sessions"; 
import { getCurrentUserId } from "../services/auth.js"

export async function clientLoader() {
  const categories = await getCategories();

  return { categories }
}

export async function clientAction({ request }) {
  const formData = await request.formData();
  const currentUserId = await getCurrentUserId();
  const categoryId = formData.get("categoryId");
  await createSession({ currentUserId, categoryId });
  return redirect("/");
}

export default function Track({ loaderData }) {
  const { categories } = loaderData;
  let navigate = useNavigate();

  // default date = today
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="form-page">
      <h2 className="form-page__title">Log a Session</h2>
      <Form method="post" className="session-form">
        <div className="form-group">
          <label htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            className="form-select"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={today}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            id="duration"
            name="duration"
            type="number"
            min="1"
            placeholder="e.g. 90"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            placeholder="What did you watch / play / do?"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            Log it
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate(`/track`)}
          >
            Cancel
          </button>
        </div>
      </Form>
    </div>
  );
}
