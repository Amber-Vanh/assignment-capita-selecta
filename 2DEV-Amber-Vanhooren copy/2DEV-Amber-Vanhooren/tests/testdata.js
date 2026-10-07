export const testdata = {
  users: [
    { id: "1", name: "Test User 1", avatar: "🧪" },
    { id: "2", name: "Test User 2", avatar: "🧪" },
    { id: "3", name: "Test User 3", avatar: "🧪" },
    { id: "4", name: "Test User 4", avatar: "🧪" },
  ],
  categories: [
    { id: "1", name: "Category A", emoji: "🔵" },
    { id: "2", name: "Category B", emoji: "🟢" },
    { id: "3", name: "Category C", emoji: "🟡" },
  ],
  sessions: [
    // User 1 (own)
    {
      id: "1",
      userId: "1",
      categoryId: "1",
      date: "2026-05-07",
      duration: 180,
      notes: "Test Session A notes",
    },
    {
      id: "2",
      userId: "1",
      categoryId: "2",
      date: "2026-05-05",
      duration: 120,
      notes: "Test Session B notes",
    },
    // User 2 — followed
    {
      id: "4",
      userId: "2",
      categoryId: "1",
      date: "2026-05-06",
      duration: 240,
      notes: "Test Session D notes",
    },
    {
      id: "5",
      userId: "2",
      categoryId: "3",
      date: "2026-05-03",
      duration: 60,
      notes: "Test Session E notes",
    },
    // User 3 — followed
    {
      id: "6",
      userId: "3",
      categoryId: "2",
      date: "2026-05-07",
      duration: 300,
      notes: "Test Session F notes",
    },
    // User 4 — NOT followed
    {
      id: "8",
      userId: "4",
      categoryId: "2",
      date: "2026-05-07",
      duration: 480,
      notes: "Test Session H notes",
    },
  ],
  follows: [
    { id: "1", followerId: "1", followingId: "2" },
    { id: "2", followerId: "1", followingId: "3" },
  ],
};
