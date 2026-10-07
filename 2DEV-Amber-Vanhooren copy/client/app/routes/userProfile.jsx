import { useFetcher } from "react-router";
import { SessionAccordion } from "../components/SessionAccordion.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Sofa } from "lucide-react";

import {getCurrentUserId} from "../services/auth.js"
import { getUser } from "../services/users.js"
import { getFollow } from "../services/follows.js"
import { getSessionsByUser } from "../services/sessions.js"

export async function clientLoader({params}) {
  const currentUserId = await getCurrentUserId();
  const userId = params.userId ?? currentUserId;
  const isOwnProfile = userId === currentUserId;

  const [user, follow, sessions] = await Promise.all([
    getUser(userId),
    isOwnProfile ? Promise.resolve(null) : getFollow(currentUserId, userId),
    getSessionsByUser(userId),
  ]);

  return {
    user,
    currentUserId,
    isOwnProfile,
    isFollowing: Boolean(follow),
    followId: follow?.id ?? null,
    sessions,
  };
}


export default function UserProfile( { loaderData }) {
  const { user, currentUserId, isOwnProfile, isFollowing, followId, sessions } = loaderData;

  const fetcher = useFetcher();

  let optimisticFollowing = isFollowing;
  if (fetcher.state !== "idle" && fetcher.formData) {
    optimisticFollowing = fetcher.formData.get("intent") === "follow";
  }

  return (
    <div className="user-profile" data-testid="user-profile">
      <div className="user-profile__hero">
        <div className="user-profile__avatar">{user.avatar}</div>
        <h2 className="user-profile__name" data-testid="profile-name">
          {user.name}
        </h2>
        {!isOwnProfile && (
          <fetcher.Form method="post" action="/friends">
            {optimisticFollowing ? (
              <>
                <input type="hidden" name="intent" value="unfollow" />
                <input type="hidden" name="followId" value={followId} />
                <button
                  type="submit"
                  className="btn btn--following"
                  data-testid="unfollow-btn"
                >
                  Following
                </button>
              </>
            ) : (
              <>
                <input type="hidden" name="intent" value="follow" />
                <input type="hidden" name="followingId" value={user.id} />
                <button
                  type="submit"
                  className="btn btn--follow"
                  data-testid="follow-btn"
                >
                  Follow
                </button>
              </>
            )}
          </fetcher.Form>
        )}
      </div>

      <p className="profile-section-title">
        {isOwnProfile ? "Your Sessions" : "Recent Sessions"}
      </p>

      {sessions.length === 0 ? (
        <EmptyState
          icon={<Sofa size={44} />}
          title={isOwnProfile ? "Nothing logged yet" : "No sessions yet"}
          message={
            isOwnProfile
              ? "Use the Track button to log your first session."
              : undefined
          }
          testId={isOwnProfile ? "empty-my-sessions" : "empty-user-sessions"}
        />
      ) : (
        <div data-testid={isOwnProfile ? "my-sessions" : "user-sessions"}>
          <SessionAccordion sessions={sessions} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  );
}
