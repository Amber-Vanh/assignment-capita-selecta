const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all follows for a given follower.
 * @param {string} followerId - The ID of the user who is following.
 * @returns {Promise<Array>} List of follow records.
 */
export const getFollows = async (followerId) => {
  const where = encodeURIComponent(
    JSON.stringify({ followerId: { eq: followerId } }),
  );
  const res = await fetch(`${BASE_URL}/follows?_where=${where}`);
  return res.json();
};

/**
 * Fetches a single follow record between two users.
 * @param {string} followerId - The ID of the user who is following.
 * @param {string} followingId - The ID of the user being followed.
 * @returns {Promise<Object|null>} The follow record, or null if not following.
 */
export const getFollow = async (followerId, followingId) => {
  const where = encodeURIComponent(
    JSON.stringify({
      followerId: { eq: followerId },
      followingId: { eq: followingId },
    }),
  );
  const res = await fetch(`${BASE_URL}/follows?_where=${where}`);
  const results = await res.json();
  return results[0] ?? null;
};

/**
 * Creates a new follow relationship.
 * @param {{ followerId: string, followingId: string }} follow - The follower and followee IDs.
 * @returns {Promise<Object>} The created follow record.
 */
export const createFollow = async ({ followerId, followingId }) => {
  const res = await fetch(`${BASE_URL}/follows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerId, followingId }),
  });
  return res.json();
};

/**
 * Deletes a follow relationship by its ID.
 * @param {string} id - The follow record ID to delete.
 * @returns {Promise<void>}
 */
export const deleteFollow = async (id) => {
  await fetch(`${BASE_URL}/follows/${id}`, { method: "DELETE" });
};
