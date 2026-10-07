import { User } from "lucide-react";
import { Link } from "react-router";

export function AppHeader({ currentUser }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <Link to="/" className="app-header__title">
          Couch Potato
        </Link>
      </div>
      <Link
        to={`/users/${currentUser?.id}`}
        className="app-header__me"
        data-testid="nav-profile"
        aria-label="My profile"
      >
        {currentUser ? (
          <span className="app-header__avatar">{currentUser.avatar}</span>
        ) : (
          <User size={22} />
        )}
        <span>Me</span>
      </Link>
    </header>
  );
}
