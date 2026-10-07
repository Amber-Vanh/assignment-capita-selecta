# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-sessions.spec.js >> edit session — save redirects to profile
- Location: tests/02-sessions.spec.js:71:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/users\/1$/
Received string:  "http://localhost:5174/sessions/1/edit"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:5174/sessions/1/edit"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link "Couch Potato" [ref=e5] [cursor=pointer]:
      - /url: /
    - link "My profile" [ref=e6] [cursor=pointer]:
      - /url: /users/undefined
      - generic [ref=e8]: Me
  - main [ref=e9]:
    - generic [ref=e10]:
      - heading "Edit Session" [level=2] [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Date
          - textbox "Date" [active] [ref=e15]
        - generic [ref=e16]:
          - generic [ref=e17]: Duration (minutes)
          - spinbutton "Duration (minutes)" [ref=e18]
        - generic [ref=e19]:
          - generic [ref=e20]: Notes
          - textbox "Notes" [ref=e21]: Updated!
        - generic [ref=e22]:
          - button "Save" [ref=e23] [cursor=pointer]
          - button "Cancel" [ref=e24] [cursor=pointer]
  - navigation [ref=e25]:
    - link "Feed" [ref=e26] [cursor=pointer]:
      - /url: /
      - img [ref=e27]
      - generic [ref=e31]: Feed
    - link [ref=e32] [cursor=pointer]:
      - /url: /track
      - img [ref=e33]
    - link "Friends" [ref=e34] [cursor=pointer]:
      - /url: /friends
      - img [ref=e35]
      - generic [ref=e40]: Friends
```

# Test source

```ts
  1   | import { test, expect } from "./fixture.js";
  2   | 
  3   | test("profile page shows session list", async ({ page }) => {
  4   |   await page.goto("/users/1");
  5   |   await expect(page.getByTestId("my-sessions")).toBeVisible();
  6   |   await expect(
  7   |     page.getByTestId("my-sessions").getByRole("listitem"),
  8   |   ).toHaveCount(2);
  9   | });
  10  | 
  11  | test("clicking a session expands its details (accordion)", async ({ page }) => {
  12  |   await page.goto("/users/1");
  13  |   await page.getByTestId("session-item-1").click();
  14  |   await expect(page.getByTestId("session-detail-1")).toBeVisible();
  15  | });
  16  | 
  17  | test("session detail shows formatted duration and notes", async ({ page }) => {
  18  |   await page.goto("/users/1");
  19  |   await page.getByTestId("session-item-1").click();
  20  |   await expect(page.getByTestId("session-detail-1")).toContainText("3h");
  21  |   await expect(page.getByTestId("session-detail-1")).toContainText(
  22  |     "Test Session A notes",
  23  |   );
  24  | });
  25  | 
  26  | test("track form submits and redirects to feed", async ({ page }) => {
  27  |   const newSession = {
  28  |     id: "99",
  29  |     userId: "1",
  30  |     categoryId: "1",
  31  |     date: "2026-05-08",
  32  |     duration: 45,
  33  |     notes: "Quick nap",
  34  |   };
  35  | 
  36  |   await page.route(/localhost:3000\/sessions$/, async (route) => {
  37  |     if (route.request().method() === "POST") {
  38  |       await route.fulfill({ json: newSession });
  39  |     } else {
  40  |       await route.fallback();
  41  |     }
  42  |   });
  43  | 
  44  |   await page.goto("/track");
  45  |   page.on("load", () => {
  46  |     throw new Error("Full page reload detected — use client-side navigation!");
  47  |   });
  48  | 
  49  |   await page.getByLabel("Date").fill("2026-05-08");
  50  |   await page.getByLabel("Duration (minutes)").fill("45");
  51  |   await page.getByLabel("Notes").fill("Quick nap");
  52  |   await page.getByRole("button", { name: /log it/i }).click();
  53  |   await expect(page).toHaveURL(/\/$/);
  54  | });
  55  | 
  56  | test("cancel track returns to previous page", async ({ page }) => {
  57  |   await page.goto("/");
  58  |   await expect(page.getByTestId("feed")).toBeVisible();
  59  |   page.on("load", () => {
  60  |     throw new Error("Full page reload detected — use client-side navigation!");
  61  |   });
  62  |   await page.getByTestId("nav-track").click();
  63  |   await expect(
  64  |     page.getByRole("heading", { name: "Log a Session" }),
  65  |   ).toBeVisible();
  66  | 
  67  |   await page.getByRole("button", { name: /cancel/i }).click();
  68  |   await expect(page).toHaveURL(/\/$/);
  69  | });
  70  | 
  71  | test("edit session — save redirects to profile", async ({ page }) => {
  72  |   const original = {
  73  |     id: "1",
  74  |     userId: "1",
  75  |     categoryId: "1",
  76  |     date: "2026-05-07",
  77  |     duration: 180,
  78  |     notes: "Test Session A notes",
  79  |   };
  80  | 
  81  |   await page.route(/localhost:3000\/sessions\/1$/, async (route) => {
  82  |     if (route.request().method() === "PATCH") {
  83  |       const body = JSON.parse(route.request().postData());
  84  |       await route.fulfill({ json: { ...original, ...body } });
  85  |     } else {
  86  |       await route.fallback();
  87  |     }
  88  |   });
  89  | 
  90  |   await page.goto("/sessions/1/edit");
  91  |   page.on("load", () => {
  92  |     throw new Error("Full page reload detected — use client-side navigation!");
  93  |   });
  94  | 
  95  |   await page.getByLabel("Notes").fill("Updated!");
  96  |   await page.getByRole("button", { name: /save/i }).click();
> 97  |   await expect(page).toHaveURL(/\/users\/1$/);
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  98  | });
  99  | 
  100 | test("edit session — cancel returns to previous page", async ({ page }) => {
  101 |   await page.goto("/users/1");
  102 |   await page.getByTestId("session-item-1").click();
  103 |   page.on("load", () => {
  104 |     throw new Error("Full page reload detected — use client-side navigation!");
  105 |   });
  106 |   await page
  107 |     .getByTestId("session-detail-1")
  108 |     .getByRole("link", { name: /edit/i })
  109 |     .click();
  110 |   await expect(page).toHaveURL(/\/sessions\/1\/edit$/);
  111 |   await page.getByRole("button", { name: /cancel/i }).click();
  112 |   await expect(page).toHaveURL(/\/users\/1$/);
  113 | });
  114 | 
  115 | test("own session shows Edit link in accordion", async ({ page }) => {
  116 |   await page.goto("/users/1");
  117 |   await page.getByTestId("session-item-1").click();
  118 |   await expect(
  119 |     page.getByTestId("session-detail-1").getByRole("link", { name: /edit/i }),
  120 |   ).toBeVisible();
  121 | });
  122 | 
  123 | test("another user's session does not show Edit link", async ({ page }) => {
  124 |   await page.goto("/users/2");
  125 |   // session 4 belongs to user 2 (Test User 2)
  126 |   await page.getByTestId("session-item-4").click();
  127 |   await expect(page.getByTestId("session-detail-4")).toBeVisible();
  128 |   await expect(
  129 |     page.getByTestId("session-detail-4").getByRole("link", { name: /edit/i }),
  130 |   ).not.toBeVisible();
  131 | });
  132 | 
  133 | test("track form category dropdown is populated from the API", async ({
  134 |   page,
  135 | }) => {
  136 |   await page.goto("/track");
  137 |   const select = page.locator("select[name='categoryId']");
  138 |   await expect(select).toBeVisible();
  139 |   // fixture provides 3 categories
  140 |   await expect(select.locator("option")).toHaveCount(3);
  141 | });
  142 | 
  143 | test("track form date defaults to today", async ({ page }) => {
  144 |   await page.goto("/track");
  145 |   const today = new Date().toISOString().slice(0, 10);
  146 |   await expect(page.getByLabel("Date")).toHaveValue(today);
  147 | });
  148 | 
  149 | test("edit form is pre-filled with the existing session values", async ({
  150 |   page,
  151 | }) => {
  152 |   await page.goto("/sessions/1/edit");
  153 |   await expect(page.getByLabel("Date")).toHaveValue("2026-05-07");
  154 |   await expect(page.getByLabel("Duration (minutes)")).toHaveValue("180");
  155 |   await expect(page.getByLabel("Notes")).toHaveValue("Test Session A notes");
  156 | });
  157 | 
  158 | test("edit form does not include a category field", async ({ page }) => {
  159 |   await page.goto("/sessions/1/edit");
  160 |   await expect(page.locator("select[name='categoryId']")).not.toBeAttached();
  161 | });
  162 | 
```