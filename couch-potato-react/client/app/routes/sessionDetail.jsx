import { Link, useNavigate } from "react-router";
import { CalendarDays, Clock, FileText } from "lucide-react";
import { formatDuration, formatDate } from "../utils/index.js";

import { getSessionWithRelations } from "../services/sessions.js";
import { getCurrentUserId } from "../services/auth.js";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function clientLoader({ params }) {
  const id = params.Id;
  const session = await getSessionWithRelations(`http://localhost:3000/sessions/${id}`)
  const currentUserId = await getCurrentUserId();

  return { session, currentUserId };
}

export default function SessionDetail({ loaderData }) {
  const { session, currentUserId } = loaderData ;
  const { user, category } = session;
  const isOwn = session.userId === currentUserId;

  let navigate = useNavigate();

  return (
    <div className="form-page">
      <div className="page-header">
        <h2 className="page-header__title">
          {category.emoji} {category.name}
        </h2>
      </div>

      <div className="session-detail__row">
        <CalendarDays size={16} />
        <span>{formatDate(session.date)}</span>
      </div>
      <div className="session-detail__row">
        <Clock size={16} />
        <span>
          {formatDuration(session.duration)} ({session.duration} minutes)
        </span>
      </div>
      {session.notes && (
        <div className="session-detail__row">
          <FileText size={16} />
          <span>{session.notes}</span>
        </div>
      )}

      <div className="session-detail__row" style={{ marginTop: "8px" }}>
        <Link to={`/users/${user.id}`} className="user-card__name">
          {user.avatar} {user.name}
        </Link>
      </div>

      <div className="session-detail__actions">
        {isOwn && (
          <Link
            to={`/sessions/${session.id}/edit`}
            className="btn btn--primary"
          >
            Edit
          </Link>
        )}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate(`/session`)}
          /* onClick={() => navigate to previous route} */
        >
          Back
        </button>
      </div>
    </div>
  );
}
