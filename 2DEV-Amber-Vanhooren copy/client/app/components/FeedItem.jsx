import { formatDuration, formatDate } from "../utils/index.js";
import { Link } from "react-router";

export function FeedItem({ session }) {
  const { user, category } = session;
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="feed-item"
      data-testid={`feed-item-${session.id}`}
    >
      <div className="feed-item__header">
        <div className="feed-item__avatar">{user.avatar}</div>
        <div className="feed-item__meta">
          <div
            className="feed-item__user-name"
            data-testid={`feed-user-${session.id}`}
          >
            {user.name}
          </div>
          <div className="feed-item__date">{formatDate(session.date)}</div>
        </div>
        <span
          className="feed-item__category-badge"
          data-testid={`feed-category-${session.id}`}
        >
          {category.emoji} {category.name}
        </span>
      </div>
      <div className="feed-item__duration">
        {formatDuration(session.duration)}
        <span className="feed-item__duration-label">of glorious laziness</span>
      </div>
      {session.notes && <div className="feed-item__notes">{session.notes}</div>}
    </Link>
  );
}
