import { FeedItem } from "../components/FeedItem.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Rss } from "lucide-react";

import { getCurrentUserId } from "../services/auth.js"
import { getFollows } from "../services/follows.js"
import { getFeedSessions } from "../services/sessions.js"

export async function clientLoader() {
  const currentUserId = await getCurrentUserId();
  const follows = await getFollows(currentUserId);

  const feedSessions = await getFeedSessions([
    currentUserId, ...follows.map((f) => f.followingId),
  ]);

  return { feedSessions };
}

export default function Feed({ loaderData }) {
  const { feedSessions } = loaderData;

  if (feedSessions.length === 0) {
    return (
      <EmptyState
        icon={<Rss size={44} />}
        title="Nothing here yet"
        message="Follow friends to see their lazy sessions."
        testId="empty-feed"
      />
    );
  }

  return (
    <div className="feed" data-testid="feed">
      {feedSessions.map((session) => (
        <FeedItem key={session.id} session={session} />
      ))}
    </div>
  );
}
