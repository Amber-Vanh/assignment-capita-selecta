import { test, expect } from "./fixture.js";

// Session 1: userId="1" (own), categoryId="1" (Category A), date="2026-05-07", duration=180, notes="Test Session A notes"
// Session 4: userId="2" (Test User 2), categoryId="1" (Category A), date="2026-05-06", duration=240, notes="Test Session D notes"

test("session detail page shows the category name", async ({ page }) => {
  await page.goto("/sessions/1");
  await expect(page.getByText("Category A")).toBeVisible();
});

test("session detail page shows the formatted date", async ({ page }) => {
  await page.goto("/sessions/1");
  // 2026-05-07 → Wednesday, May 7, 2026
  await expect(page.getByText("Thursday, May 7, 2026")).toBeVisible();
});

test("session detail page shows formatted duration and raw minutes", async ({
  page,
}) => {
  await page.goto("/sessions/1");
  // 180 minutes → "3h" and "(180 minutes)"
  await expect(page.getByText(/3h/)).toBeVisible();
  await expect(page.getByText(/180 minutes/)).toBeVisible();
});

test("session detail page shows notes", async ({ page }) => {
  await page.goto("/sessions/1");
  await expect(page.getByText("Test Session A notes")).toBeVisible();
});

test("session detail page links to the session owner's profile", async ({
  page,
}) => {
  await page.goto("/sessions/1");
  // user 1 = "Test User 1"
  const profileLink = page.getByRole("link", { name: /Test User 1/ });
  await expect(profileLink).toBeVisible();
  await expect(profileLink).toHaveAttribute("href", "/users/1");
});

test("session detail page shows Edit button for own session", async ({
  page,
}) => {
  await page.goto("/sessions/1");
  await expect(page.getByRole("link", { name: /edit/i })).toBeVisible();
});

test("session detail page hides Edit button for another user's session", async ({
  page,
}) => {
  await page.goto("/sessions/4");
  await expect(page.getByRole("link", { name: /edit/i })).not.toBeVisible();
});

test("session detail Back button returns to previous page without reload", async ({
  page,
}) => {
  await page.goto("/");
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });
  // Navigate to session detail via a feed item click (SPA navigation)
  await page.getByTestId("feed-item-1").click();
  await expect(page).toHaveURL(/\/sessions\/1$/);
  await page.getByRole("button", { name: /back/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
