import { test, expect } from "./fixture.js";

test("feed shows sessions from followed users", async ({ page }) => {
  await page.goto("/");
  // Test User 2 (userId=2) and Test User 3 (userId=3) are followed
  await expect(page.getByText("Test User 2").first()).toBeVisible();
  await expect(page.getByText("Test User 3").first()).toBeVisible();
});

test("feed shows own sessions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Test User 1").first()).toBeVisible();
});

test("feed does not show sessions from non-followed users", async ({
  page,
}) => {
  await page.goto("/");
  // Test User 4 (userId=4) is NOT followed
  await expect(page.getByText("Test User 4")).not.toBeVisible();
});

test("feed items show category badge", async ({ page }) => {
  await page.goto("/");
  // Session 1 (userId=1, categoryId=1) → Category A
  await expect(page.getByTestId("feed-category-1")).toContainText("Category A");
});

test("feed shows most recent session first", async ({ page }) => {
  await page.goto("/");
  // 5 sessions visible: users 1, 2, 3 (user 4 NOT followed)
  const feedItems = page.getByTestId("feed").locator("a.feed-item");
  await expect(feedItems).toHaveCount(5);
  // Session 5 (2026-05-03 — oldest among visible) must be the last item
  await expect(feedItems.last()).toHaveAttribute("data-testid", "feed-item-5");
});

test("clicking a feed item navigates without page reload", async ({ page }) => {
  await page.goto("/");
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });
  await page.getByTestId("feed-item-1").click();
  await expect(page).toHaveURL(/\/sessions\/1$/);
});

test("feed items show formatted duration", async ({ page }) => {
  await page.goto("/");
  // session 1 has duration=180 → "3h"
  await expect(page.getByTestId("feed-item-1")).toContainText("3h");
});

test("feed items show notes when present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("feed-item-1")).toContainText(
    "Test Session A notes",
  );
});

test("feed shows empty state when there are no sessions to display", async ({
  page,
}) => {
  await page.route(/localhost:3000\/sessions(\?.*)?$/, async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.goto("/");
  await expect(page.getByTestId("empty-feed")).toBeVisible();
});
