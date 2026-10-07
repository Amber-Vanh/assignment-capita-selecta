import { UserCard } from "../components/UserCard.jsx";
import { getCurrentUserId } from "../services/auth.js"
import { getUsers } from "../services/users.js"
import { getFollows, createFollow, deleteFollow } from "../services/follows.js"

export async function clientLoader() {
  const currentUserId = await getCurrentUserId();
  const [users, follows] = await Promise.all([
    getUsers(),
    getFollows(currentUserId),
  ]);

  return { users, follows, currentUserId };
}

export async function clientAction({ request }) {
  const formData = await request.formData();
  let intent;

  if (intent === "follow") {
    await createFollow({
      followerId: await getCurrentUserId(),
      followingId: formData.get("followingId"),
    });
  } else if (intent === "unfollow") {
    await deleteFollow(formData.get("followId"));
  }

  return null;
}

export default function Friends({ loaderData }) {
  const { users, follows, currentUserId } = loaderData;

  /* query and setQuery should be declared in another way...  */
  const query = "";
  const setQuery = undefined;

  const otherUsers = users.filter((u) => u.id !== currentUserId);

  const followingIds = new Set(follows.map((f) => f.followingId));

  const filtered = query.trim()
    ? otherUsers.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase()),
      )
    : otherUsers.filter((u) => followingIds.has(u.id));

  return (
    <div>
      <div className="page-header">
        <h2 className="page-header__title">Friends</h2>
      </div>

      <div className="friends-search">
        <input
          className="friends-search__input"
          type="search"
          placeholder="Search people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className="user-list" data-testid="friends-list">
        {filtered.map((user) => {
          const follow = follows.find((f) => f.followingId === user.id);
          const isFollowing = Boolean(follow);
          return (
            <li key={user.id}>
              <UserCard
                user={user}
                isFollowing={isFollowing}
                followId={follow?.id}
              />
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="friends-empty">No results for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  );
}