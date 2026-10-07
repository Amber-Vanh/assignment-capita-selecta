import { test, expect } from "./fixture.js";
import { testdata } from "./testdata.js";

test("friends page shows only followed users by default", async ({ page }) => {
  await page.goto("/friends");
  await expect(page.getByTestId("friends-list")).toBeVisible();
  // User 1 follows users 2 and 3
  await expect(page.getByTestId("user-card-2")).toBeVisible();
  await expect(page.getByTestId("user-card-3")).toBeVisible();
  // User 4 is not followed — should not appear
  await expect(page.getByTestId("user-card-4")).not.toBeVisible();
});

test("friends page search shows all matching users including non-followed", async ({
  page,
}) => {
  await page.goto("/friends");
  // User 4 is not followed but should appear when searching
  await page.getByRole("searchbox").fill("User 4");
  await expect(page.getByTestId("user-card-4")).toBeVisible();
});

test("clicking a friend navigates to their profile without reload", async ({
  page,
}) => {
  await page.goto("/friends");
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });
  await page.getByTestId("user-card-2").getByRole("link").click();
  await expect(page).toHaveURL(/\/users\/2$/);
});

test("user profile shows the user's name", async ({ page }) => {
  await page.goto("/users/2");
  await expect(page.getByTestId("profile-name")).toHaveText("Test User 2");
});

test("user profile shows Following button when already following", async ({
  page,
}) => {
  await page.goto("/users/2");
  await expect(page.getByTestId("unfollow-btn")).toBeVisible();
});

test("user profile shows Follow button when not following", async ({
  page,
}) => {
  await page.goto("/users/4");
  await expect(page.getByTestId("follow-btn")).toBeVisible();
});

test("follow action — clicking Follow creates follow and shows Following", async ({
  page,
}) => {
  const newFollow = { id: "3", followerId: "1", followingId: "4" };
  let followCreated = false;

  await page.route(/localhost:3000\/follows$/, async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ json: newFollow });
      followCreated = true;
    } else {
      await route.fallback();
    }
  });

  // Override GET /follows?_where=... only after the POST has completed
  await page.route(/localhost:3000\/follows\?_where=/, async (route) => {
    if (followCreated) {
      await route.fulfill({ json: [...testdata.follows, newFollow] });
    } else {
      await route.fallback();
    }
  });

  await page.goto("/users/4");
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });

  await page.getByTestId("follow-btn").click();
  await expect(page.getByTestId("unfollow-btn")).toBeVisible();
});

test("unfollow action — clicking Following removes follow and shows Follow", async ({
  page,
}) => {
  let unfollowDone = false;

  await page.route(/localhost:3000\/follows\/1$/, async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ status: 200, json: {} });
      unfollowDone = true;
    } else {
      await route.fallback();
    }
  });

  // Override GET /follows?_where=... only after the DELETE has completed
  await page.route(/localhost:3000\/follows\?_where=/, async (route) => {
    if (unfollowDone) {
      await route.fulfill({ json: [] });
    } else {
      await route.fallback();
    }
  });

  await page.goto("/users/2");
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });

  await page.getByTestId("unfollow-btn").click();
  await expect(page.getByTestId("follow-btn")).toBeVisible();
});

test("sessions on another user's profile do not show Edit link", async ({
  page,
}) => {
  await page.goto("/users/2");
  // session 4 belongs to user 2 (Test User 2), not to us
  await page.getByTestId("session-item-4").click();
  await expect(page.getByTestId("session-detail-4")).toBeVisible();
  await expect(
    page.getByTestId("session-detail-4").getByRole("link", { name: /edit/i }),
  ).not.toBeVisible();
});

test("direct navigation to edit another user's session redirects", async ({
  page,
}) => {
  // session 4 belongs to user 2 — should redirect to feed
  await page.goto("/sessions/4/edit");
  await expect(page).toHaveURL(/\/$/);
});

test("own profile does not show a follow or unfollow button", async ({
  page,
}) => {
  await page.goto("/users/1");
  await expect(page.getByTestId("follow-btn")).not.toBeVisible();
  await expect(page.getByTestId("unfollow-btn")).not.toBeVisible();
});

test("own profile section title reads 'Your Sessions'", async ({ page }) => {
  await page.goto("/users/1");
  await expect(page.getByText("Your Sessions")).toBeVisible();
});

test("other user profile section title reads 'Recent Sessions'", async ({
  page,
}) => {
  await page.goto("/users/2");
  await expect(page.getByText("Recent Sessions")).toBeVisible();
});

test("profile shows sessions sorted newest first", async ({ page }) => {
  await page.goto("/users/1");
  // user 1 has session 1 (2026-05-07) and session 2 (2026-05-05)
  const items = page.getByTestId("my-sessions").getByRole("listitem");
  await expect(items.first()).toContainText("May 7, 2026");
  await expect(items.last()).toContainText("May 5, 2026");
});

test("profile shows empty state when user has no sessions", async ({
  page,
}) => {
  await page.route(/localhost:3000\/sessions(\?.*)?$/, async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.goto("/users/4");
  await expect(page.getByTestId("empty-user-sessions")).toBeVisible();
});

test("follow button on friends page flips optimistically before server responds", async ({
  page,
}) => {
  // Delay the POST response so the server hasn't answered yet when we check
  await page.route(/localhost:3000\/follows$/, async (route) => {
    if (route.request().method() === "POST") {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        json: { id: "3", followerId: "1", followingId: "4" },
      });
    } else {
      await route.fallback();
    }
  });

  await page.goto("/friends");
  page.on("load", () => {
    throw new Error("Full page reload detected — use client-side navigation!");
  });

  // Search to reveal Test User 4 (not followed)
  await page.getByRole("searchbox").fill("User 4");
  await expect(page.getByTestId("user-card-4")).toBeVisible();

  // Fire click without awaiting — check optimistic state while request is in-flight
  const clickPromise = page.getByTestId("follow-btn-4").click();
  await expect(page.getByTestId("unfollow-btn-4")).toBeVisible();
  await clickPromise;
});
