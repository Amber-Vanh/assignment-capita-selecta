import { useFetcher, Link } from "react-router";

export function UserCard({ user, subText, isFollowing, followId }) {
  const fetcher = useFetcher();

  // Optimistic UI: flip state immediately based on in-flight submission
  let optimisticFollowing = isFollowing;
  if (fetcher.state !== "idle" && fetcher.formData) {
    optimisticFollowing = fetcher.formData.get("intent") === "follow";
  }

  return (
    <div className="user-card" data-testid={`user-card-${user.id}`}>
      <div className="user-card__avatar">{user.avatar}</div>
      <div className="user-card__info">
        <Link to={`/users/${user.id}`} className="user-card__name">
          {user.name}
        </Link>
        {subText && <div className="user-card__sub">{subText}</div>}
      </div>
      {isFollowing !== undefined && (
        <fetcher.Form method="post" action="/friends">
          {optimisticFollowing ? (
            <>
              <input type="hidden" name="intent" value="unfollow" />
              <input type="hidden" name="followId" value={followId} />
              <button
                type="submit"
                className="btn btn--following"
                data-testid={`unfollow-btn-${user.id}`}
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
                data-testid={`follow-btn-${user.id}`}
              >
                Follow
              </button>
            </>
          )}
        </fetcher.Form>
      )}
    </div>
  );
}
