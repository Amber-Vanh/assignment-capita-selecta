# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-friends.spec.js >> friends page search shows all matching users including non-followed
- Location: tests/03-friends.spec.js:14:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('user-card-4')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('user-card-4')

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
      - heading "Friends" [level=2] [ref=e12]
      - searchbox "Search people…" [active] [ref=e14]
      - list [ref=e15]:
        - listitem [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]: 🧪
            - link "Test User 2" [ref=e20] [cursor=pointer]:
              - /url: /users/2
            - button "Following" [ref=e22] [cursor=pointer]
        - listitem [ref=e23]:
          - generic [ref=e24]:
            - generic [ref=e25]: 🧪
            - link "Test User 3" [ref=e27] [cursor=pointer]:
              - /url: /users/3
            - button "Following" [ref=e29] [cursor=pointer]
  - navigation [ref=e30]:
    - link "Feed" [ref=e31] [cursor=pointer]:
      - /url: /
      - img [ref=e32]
      - generic [ref=e36]: Feed
    - link [ref=e37] [cursor=pointer]:
      - /url: /track
      - img [ref=e38]
    - link "Friends" [ref=e39] [cursor=pointer]:
      - /url: /friends
      - img [ref=e40]
      - generic [ref=e45]: Friends
```

# Test source

```ts
  1   | import { test, expect } from "./fixture.js";
  2   | import { testdata } from "./testdata.js";
  3   | 
  4   | test("friends page shows only followed users by default", async ({ page }) => {
  5   |   await page.goto("/friends");
  6   |   await expect(page.getByTestId("friends-list")).toBeVisible();
  7   |   // User 1 follows users 2 and 3
  8   |   await expect(page.getByTestId("user-card-2")).toBeVisible();
  9   |   await expect(page.getByTestId("user-card-3")).toBeVisible();
  10  |   // User 4 is not followed — should not appear
  11  |   await expect(page.getByTestId("user-card-4")).not.toBeVisible();
  12  | });
  13  | 
  14  | test("friends page search shows all matching users including non-followed", async ({
  15  |   page,
  16  | }) => {
  17  |   await page.goto("/friends");
  18  |   // User 4 is not followed but should appear when searching
  19  |   await page.getByRole("searchbox").fill("User 4");
> 20  |   await expect(page.getByTestId("user-card-4")).toBeVisible();
      |                                                 ^ Error: expect(locator).toBeVisible() failed
  21  | });
  22  | 
  23  | test("clicking a friend navigates to their profile without reload", async ({
  24  |   page,
  25  | }) => {
  26  |   await page.goto("/friends");
  27  |   page.on("load", () => {
  28  |     throw new Error("Full page reload detected — use client-side navigation!");
  29  |   });
  30  |   await page.getByTestId("user-card-2").getByRole("link").click();
  31  |   await expect(page).toHaveURL(/\/users\/2$/);
  32  | });
  33  | 
  34  | test("user profile shows the user's name", async ({ page }) => {
  35  |   await page.goto("/users/2");
  36  |   await expect(page.getByTestId("profile-name")).toHaveText("Test User 2");
  37  | });
  38  | 
  39  | test("user profile shows Following button when already following", async ({
  40  |   page,
  41  | }) => {
  42  |   await page.goto("/users/2");
  43  |   await expect(page.getByTestId("unfollow-btn")).toBeVisible();
  44  | });
  45  | 
  46  | test("user profile shows Follow button when not following", async ({
  47  |   page,
  48  | }) => {
  49  |   await page.goto("/users/4");
  50  |   await expect(page.getByTestId("follow-btn")).toBeVisible();
  51  | });
  52  | 
  53  | test("follow action — clicking Follow creates follow and shows Following", async ({
  54  |   page,
  55  | }) => {
  56  |   const newFollow = { id: "3", followerId: "1", followingId: "4" };
  57  |   let followCreated = false;
  58  | 
  59  |   await page.route(/localhost:3000\/follows$/, async (route) => {
  60  |     if (route.request().method() === "POST") {
  61  |       await route.fulfill({ json: newFollow });
  62  |       followCreated = true;
  63  |     } else {
  64  |       await route.fallback();
  65  |     }
  66  |   });
  67  | 
  68  |   // Override GET /follows?_where=... only after the POST has completed
  69  |   await page.route(/localhost:3000\/follows\?_where=/, async (route) => {
  70  |     if (followCreated) {
  71  |       await route.fulfill({ json: [...testdata.follows, newFollow] });
  72  |     } else {
  73  |       await route.fallback();
  74  |     }
  75  |   });
  76  | 
  77  |   await page.goto("/users/4");
  78  |   page.on("load", () => {
  79  |     throw new Error("Full page reload detected — use client-side navigation!");
  80  |   });
  81  | 
  82  |   await page.getByTestId("follow-btn").click();
  83  |   await expect(page.getByTestId("unfollow-btn")).toBeVisible();
  84  | });
  85  | 
  86  | test("unfollow action — clicking Following removes follow and shows Follow", async ({
  87  |   page,
  88  | }) => {
  89  |   let unfollowDone = false;
  90  | 
  91  |   await page.route(/localhost:3000\/follows\/1$/, async (route) => {
  92  |     if (route.request().method() === "DELETE") {
  93  |       await route.fulfill({ status: 200, json: {} });
  94  |       unfollowDone = true;
  95  |     } else {
  96  |       await route.fallback();
  97  |     }
  98  |   });
  99  | 
  100 |   // Override GET /follows?_where=... only after the DELETE has completed
  101 |   await page.route(/localhost:3000\/follows\?_where=/, async (route) => {
  102 |     if (unfollowDone) {
  103 |       await route.fulfill({ json: [] });
  104 |     } else {
  105 |       await route.fallback();
  106 |     }
  107 |   });
  108 | 
  109 |   await page.goto("/users/2");
  110 |   page.on("load", () => {
  111 |     throw new Error("Full page reload detected — use client-side navigation!");
  112 |   });
  113 | 
  114 |   await page.getByTestId("unfollow-btn").click();
  115 |   await expect(page.getByTestId("follow-btn")).toBeVisible();
  116 | });
  117 | 
  118 | test("sessions on another user's profile do not show Edit link", async ({
  119 |   page,
  120 | }) => {
```