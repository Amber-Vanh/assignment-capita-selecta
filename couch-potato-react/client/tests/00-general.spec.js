import { test, expect } from "./fixture.js";

test("page has title Couch Potato", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Couch Potato")).toBeVisible();
});

test("bottom nav has 3 tabs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("bottom-nav")).toBeVisible();
  await expect(page.getByTestId("bottom-nav").locator("a")).toHaveCount(3);
});
