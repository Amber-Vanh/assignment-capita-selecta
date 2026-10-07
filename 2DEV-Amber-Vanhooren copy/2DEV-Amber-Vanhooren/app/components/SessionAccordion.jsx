import { useState } from "react";
import {
  CalendarDays,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDuration, formatDate } from "../utils/index.js";
import { Link } from "react-router";

export function SessionAccordion({ sessions, currentUserId }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!sessions || sessions.length === 0) return null;

  return (
    <ul className="session-list" data-testid="session-list">
      {sessions.map((session) => {
        const isOpen = expandedId === session.id;
        return (
          <li key={session.id} className="session-accordion__item">
            <button
              type="button"
              className={`session-item session-accordion__summary${isOpen ? " active" : ""}`}
              data-testid={`session-item-${session.id}`}
              onClick={() => setExpandedId(isOpen ? null : session.id)}
              aria-expanded={isOpen}
            >
              <span className="session-item__date">
                {formatDate(session.date)}
              </span>
              <span className="session-item__right">
                <span className="session-item__duration">
                  {formatDuration(session.duration)}
                </span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {isOpen && (
              <div
                className="session-accordion__detail"
                data-testid={`session-detail-${session.id}`}
              >
                <div className="session-detail__duration">
                  {formatDuration(session.duration)}
                </div>
                <div className="session-detail__row">
                  <CalendarDays size={16} />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="session-detail__row">
                  <Clock size={16} />
                  <span>{session.duration} minutes</span>
                </div>
                {session.notes && (
                  <div className="session-detail__row">
                    <FileText size={16} />
                    <span>{session.notes}</span>
                  </div>
                )}
                {session.userId === currentUserId && (
                  <div className="session-detail__actions">
                    <Link
                      to={`/sessions/${session.id}/edit`}
                      className="btn btn--ghost"
                    >
                      Edit
                    </Link>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
