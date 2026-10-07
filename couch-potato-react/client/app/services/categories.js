const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all categories.
 * @returns {Promise<Array>} List of all categories.
 */
export const getCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories`);
  return res.json();
};

/**
 * Fetches a single category by ID.
 * @param {string} id - The category ID.
 * @returns {Promise<Object>} The matching category.
 */
export const getCategory = async (id) => {
  const res = await fetch(`${BASE_URL}/categories/${id}`);
  return res.json();
};
