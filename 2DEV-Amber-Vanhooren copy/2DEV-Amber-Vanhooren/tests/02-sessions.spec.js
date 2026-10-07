import { test, expect } from "./fixture.js";

test("profile page shows session list", async ({ page }) => {
  await page.goto("/users/1");
  await expect(page.getByTestId("my-sessions")).toBeVisible();
  await expect(
    page.getByTestId("my-sessions").getByRole("listitem"),
  ).toHaveCount(2);
});

test("clicking a session expands its details (accordion)", async ({ page }) => {
  await page.goto("/users/1");
  await page.getByTestId("session-item-1").click();
  await expect(page.getByTestId("session-detail-1")).toBeVisible();
});

test("session detail shows formatted duration and notes", async ({ page }) => {
  await page.goto("/users/1");
  await page.getByTestId("session-item-1").click();
  await expect(page.getByTestId("session-detail-1")).toContainText("3h");
  await expect(page.getByTestId("session-detail-1")).toContainText(
    "Test Session A notes",
  );
});

test("track form submits and redirects to feed", async ({ page }) => {
  const newSession = {
    id: "99",
    userId: "1",
    categoryId: "1",
    date: "2026-05-08",
    duration: 45,
    notes: "Quick nap",
  };

  await page.route(/localhost:3000\/sessions$/, async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ json: newSession });
    } else {
      await route.fallback();
    }
  });

  await page.goto("/track");
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });

  await page.getByLabel("Date").fill("2026-05-08");
  await page.getByLabel("Duration (minutes)").fill("45");
  await page.getByLabel("Notes").fill("Quick nap");
  await page.getByRole("button", { name: /log it/i }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("cancel track returns to previous page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("feed")).toBeVisible();
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });
  await page.getByTestId("nav-track").click();
  await expect(
    page.getByRole("heading", { name: "Log a Session" }),
  ).toBeVisible();

  await page.getByRole("button", { name: /cancel/i }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("edit session — save redirects to profile", async ({ page }) => {
  const original = {
    id: "1",
    userId: "1",
    categoryId: "1",
    date: "2026-05-07",
    duration: 180,
    notes: "Test Session A notes",
  };

  await page.route(/localhost:3000\/sessions\/1$/, async (route) => {
    if (route.request().method() === "PATCH") {
      const body = JSON.parse(route.request().postData());
      await route.fulfill({ json: { ...original, ...body } });
    } else {
      await route.fallback();
    }
  });

  await page.goto("/sessions/1/edit");
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });

  await page.getByLabel("Notes").fill("Updated!");
  await page.getByRole("button", { name: /save/i }).click();
  await expect(page).toHaveURL(/\/users\/1$/);
});

test("edit session — cancel returns to previous page", async ({ page }) => {
  await page.goto("/users/1");
  await page.getByTestId("session-item-1").click();
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });
  await page
    .getByTestId("session-detail-1")
    .getByRole("link", { name: /edit/i })
    .click();
  await expect(page).toHaveURL(/\/sessions\/1\/edit$/);
  await page.getByRole("button", { name: /cancel/i }).click();
  await expect(page).toHaveURL(/\/users\/1$/);
});

test("own session shows Edit link in accordion", async ({ page }) => {
  await page.goto("/users/1");
  await page.getByTestId("session-item-1").click();
  await expect(
    page.getByTestId("session-detail-1").getByRole("link", { name: /edit/i }),
  ).toBeVisible();
});

test("another user's session does not show Edit link", async ({ page }) => {
  await page.goto("/users/2");
  // session 4 belongs to user 2 (Test User 2)
  await page.getByTestId("session-item-4").click();
  await expect(page.getByTestId("session-detail-4")).toBeVisible();
  await expect(
    page.getByTestId("session-detail-4").getByRole("link", { name: /edit/i }),
  ).not.toBeVisible();
});

test("track form category dropdown is populated from the API", async ({
  page,
}) => {
  await page.goto("/track");
  const select = page.locator("select[name='categoryId']");
  await expect(select).toBeVisible();
  // fixture provides 3 categories
  await expect(select.locator("option")).toHaveCount(3);
});

test("track form date defaults to today", async ({ page }) => {
  await page.goto("/track");
  const today = new Date().toISOString().slice(0, 10);
  await expect(page.getByLabel("Date")).toHaveValue(today);
});

test("edit form is pre-filled with the existing session values", async ({
  page,
}) => {
  await page.goto("/sessions/1/edit");
  await expect(page.getByLabel("Date")).toHaveValue("2026-05-07");
  await expect(page.getByLabel("Duration (minutes)")).toHaveValue("180");
  await expect(page.getByLabel("Notes")).toHaveValue("Test Session A notes");
});

test("edit form does not include a category field", async ({ page }) => {
  await page.goto("/sessions/1/edit");
  await expect(page.locator("select[name='categoryId']")).not.toBeAttached();
});
