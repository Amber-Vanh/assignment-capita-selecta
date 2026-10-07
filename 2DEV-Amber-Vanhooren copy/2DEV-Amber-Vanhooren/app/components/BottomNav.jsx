import { Rss, Plus, Users } from "lucide-react";
import { Link } from "react-router";

export function BottomNav() {
  return (
    <nav className="bottom-nav" data-testid="bottom-nav">
      <Link to="/" end className="bottom-nav__item" data-testid="nav-feed">
        <Rss size={22} />
        <span>Feed</span>
      </Link>
      <Link
        to="/track"
        className="bottom-nav__item bottom-nav__item--track"
        data-testid="nav-track"
      >
        <Plus size={26} />
        <span>Track</span>
      </Link>
      <Link to="/friends" className="bottom-nav__item" data-testid="nav-friends">
        <Users size={22} />
        <span>Friends</span>
      </Link>
    </nav>
  );
}
