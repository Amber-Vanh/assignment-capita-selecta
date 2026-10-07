# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-session-detail.spec.js >> session detail page shows Edit button for own session
- Location: tests/04-session-detail.spec.js:41:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /edit/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: /edit/i })

```

# Page snapshot

```yaml
- main [ref=e2]:
  - heading "Oops!" [level=1] [ref=e3]
  - paragraph [ref=e4]: Cannot read properties of undefined (reading 'emoji')
  - code [ref=e6]: "TypeError: Cannot read properties of undefined (reading 'emoji') at SessionDetail (http://localhost:5174/app/routes/sessionDetail.jsx?import:41:29) at Object.react_stack_bottom_frame (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:18507:20) at renderWithHooks (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:5652:24) at updateFunctionComponent (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:7473:21) at beginWork (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:8523:20) at runWithFiberInDEV (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:995:72) at performUnitOfWork (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:12559:98) at workLoopSync (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:12422:43) at renderRootSync (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:12406:13) at performWorkOnRoot (http://localhost:5174/node_modules/.vite/deps/react-dom_client.js?v=62024196:11825:37)"
```

# Test source

```ts
  1  | import { test, expect } from "./fixture.js";
  2  | 
  3  | // Session 1: userId="1" (own), categoryId="1" (Category A), date="2026-05-07", duration=180, notes="Test Session A notes"
  4  | // Session 4: userId="2" (Test User 2), categoryId="1" (Category A), date="2026-05-06", duration=240, notes="Test Session D notes"
  5  | 
  6  | test("session detail page shows the category name", async ({ page }) => {
  7  |   await page.goto("/sessions/1");
  8  |   await expect(page.getByText("Category A")).toBeVisible();
  9  | });
  10 | 
  11 | test("session detail page shows the formatted date", async ({ page }) => {
  12 |   await page.goto("/sessions/1");
  13 |   // 2026-05-07 → Wednesday, May 7, 2026
  14 |   await expect(page.getByText("Thursday, May 7, 2026")).toBeVisible();
  15 | });
  16 | 
  17 | test("session detail page shows formatted duration and raw minutes", async ({
  18 |   page,
  19 | }) => {
  20 |   await page.goto("/sessions/1");
  21 |   // 180 minutes → "3h" and "(180 minutes)"
  22 |   await expect(page.getByText(/3h/)).toBeVisible();
  23 |   await expect(page.getByText(/180 minutes/)).toBeVisible();
  24 | });
  25 | 
  26 | test("session detail page shows notes", async ({ page }) => {
  27 |   await page.goto("/sessions/1");
  28 |   await expect(page.getByText("Test Session A notes")).toBeVisible();
  29 | });
  30 | 
  31 | test("session detail page links to the session owner's profile", async ({
  32 |   page,
  33 | }) => {
  34 |   await page.goto("/sessions/1");
  35 |   // user 1 = "Test User 1"
  36 |   const profileLink = page.getByRole("link", { name: /Test User 1/ });
  37 |   await expect(profileLink).toBeVisible();
  38 |   await expect(profileLink).toHaveAttribute("href", "/users/1");
  39 | });
  40 | 
  41 | test("session detail page shows Edit button for own session", async ({
  42 |   page,
  43 | }) => {
  44 |   await page.goto("/sessions/1");
> 45 |   await expect(page.getByRole("link", { name: /edit/i })).toBeVisible();
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  46 | });
  47 | 
  48 | test("session detail page hides Edit button for another user's session", async ({
  49 |   page,
  50 | }) => {
  51 |   await page.goto("/sessions/4");
  52 |   await expect(page.getByRole("link", { name: /edit/i })).not.toBeVisible();
  53 | });
  54 | 
  55 | test("session detail Back button returns to previous page without reload", async ({
  56 |   page,
  57 | }) => {
  58 |   await page.goto("/");
  59 |   page.on("load", () => {
  60 |     throw new Error("Full page reload detected — use client-side navigation!");
  61 |   });
  62 |   // Navigate to session detail via a feed item click (SPA navigation)
  63 |   await page.getByTestId("feed-item-1").click();
  64 |   await expect(page).toHaveURL(/\/sessions\/1$/);
  65 |   await page.getByRole("button", { name: /back/i }).click();
  66 |   await expect(page).toHaveURL(/\/$/);
  67 | });
  68 | 
```