const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all users.
 * @returns {Promise<Array>} List of all users.
 */
export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

/**
 * Fetches a single user by ID.
 * @param {string} id - The user ID.
 * @returns {Promise<Object>} The matching user.
 */
export const getUser = async (id) => {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  return res.json();
};
