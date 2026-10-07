const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all sessions.
 * @returns {Promise<Array>} List of all sessions.
 */
export const getSessions = async () => {
  const res = await fetch(`${BASE_URL}/sessions`);
  return res.json();
};

/**
 * Fetches sessions for a specific user, sorted by date descending.
 * @param {string} userId - The user whose sessions to fetch.
 * @param {string} [categoryId] - Optional category to filter by.
 * @returns {Promise<Array>} List of matching sessions.
 */
export const getSessionsByUser = async (userId, categoryId) => {
  const conditions = { userId: { eq: userId } };
  if (categoryId !== undefined) conditions.categoryId = { eq: categoryId };
  const where = encodeURIComponent(JSON.stringify(conditions));
  const res = await fetch(`${BASE_URL}/sessions?_where=${where}&_sort=-date`);
  return res.json();
};

/**
 * Fetches sessions for the feed, including embedded user and category data,
 * sorted by date descending.
 * @param {string[]} userIds - IDs of the users whose sessions to include.
 * @returns {Promise<Array>} List of sessions with embedded user and category.
 */
export const getFeedSessions = async (userIds) => {
  const where = encodeURIComponent(JSON.stringify({ userId: { in: userIds } }));
  const res = await fetch(
    `${BASE_URL}/sessions?_where=${where}&_embed=user&_embed=category&_sort=-date`,
  );
  return res.json();
};

/**
 * Fetches a single session by ID with embedded user and category data.
 * @param {string} id - The session ID.
 * @returns {Promise<Object>} The session with embedded user and category.
 */
export const getSessionWithRelations = async (id) => {
  const res = await fetch(
    `${BASE_URL}/sessions/${id}?_embed=user&_embed=category`,
  );
  return res.json();
};

/**
 * Fetches a single session by ID.
 * @param {string} id - The session ID.
 * @returns {Promise<Object>} The matching session.
 */
export const getSession = async (id) => {
  const res = await fetch(`${BASE_URL}/sessions/${id}`);
  return res.json();
};

/**
 * Creates a new session.
 * @param {{ userId: string, categoryId: string, date: string, duration: number, notes: string }} session - The session data.
 * @returns {Promise<Object>} The created session.
 */
export const createSession = async ({
  userId,
  categoryId,
  date,
  duration,
  notes,
}) => {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, categoryId, date, duration, notes }),
  });
  return res.json();
};

/**
 * Updates an existing session's date, duration, and notes.
 * @param {{ id: string, date: string, duration: number, notes: string }} session - The updated session data.
 * @returns {Promise<Object>} The updated session.
 */
export const updateSession = async ({ id, date, duration, notes }) => {
  const res = await fetch(`${BASE_URL}/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, duration, notes }),
  });
  return res.json();
};
