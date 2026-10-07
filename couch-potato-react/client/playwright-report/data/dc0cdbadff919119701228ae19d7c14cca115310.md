# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-friends.spec.js >> follow button on friends page flips optimistically before server responds
- Location: tests/03-friends.spec.js:176:1

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
  121 |   await page.goto("/users/2");
  122 |   // session 4 belongs to user 2 (Test User 2), not to us
  123 |   await page.getByTestId("session-item-4").click();
  124 |   await expect(page.getByTestId("session-detail-4")).toBeVisible();
  125 |   await expect(
  126 |     page.getByTestId("session-detail-4").getByRole("link", { name: /edit/i }),
  127 |   ).not.toBeVisible();
  128 | });
  129 | 
  130 | test("direct navigation to edit another user's session redirects", async ({
  131 |   page,
  132 | }) => {
  133 |   // session 4 belongs to user 2 — should redirect to feed
  134 |   await page.goto("/sessions/4/edit");
  135 |   await expect(page).toHaveURL(/\/$/);
  136 | });
  137 | 
  138 | test("own profile does not show a follow or unfollow button", async ({
  139 |   page,
  140 | }) => {
  141 |   await page.goto("/users/1");
  142 |   await expect(page.getByTestId("follow-btn")).not.toBeVisible();
  143 |   await expect(page.getByTestId("unfollow-btn")).not.toBeVisible();
  144 | });
  145 | 
  146 | test("own profile section title reads 'Your Sessions'", async ({ page }) => {
  147 |   await page.goto("/users/1");
  148 |   await expect(page.getByText("Your Sessions")).toBeVisible();
  149 | });
  150 | 
  151 | test("other user profile section title reads 'Recent Sessions'", async ({
  152 |   page,
  153 | }) => {
  154 |   await page.goto("/users/2");
  155 |   await expect(page.getByText("Recent Sessions")).toBeVisible();
  156 | });
  157 | 
  158 | test("profile shows sessions sorted newest first", async ({ page }) => {
  159 |   await page.goto("/users/1");
  160 |   // user 1 has session 1 (2026-05-07) and session 2 (2026-05-05)
  161 |   const items = page.getByTestId("my-sessions").getByRole("listitem");
  162 |   await expect(items.first()).toContainText("May 7, 2026");
  163 |   await expect(items.last()).toContainText("May 5, 2026");
  164 | });
  165 | 
  166 | test("profile shows empty state when user has no sessions", async ({
  167 |   page,
  168 | }) => {
  169 |   await page.route(/localhost:3000\/sessions(\?.*)?$/, async (route) => {
  170 |     await route.fulfill({ json: [] });
  171 |   });
  172 |   await page.goto("/users/4");
  173 |   await expect(page.getByTestId("empty-user-sessions")).toBeVisible();
  174 | });
  175 | 
  176 | test("follow button on friends page flips optimistically before server responds", async ({
  177 |   page,
  178 | }) => {
  179 |   // Delay the POST response so the server hasn't answered yet when we check
  180 |   await page.route(/localhost:3000\/follows$/, async (route) => {
  181 |     if (route.request().method() === "POST") {
  182 |       await new Promise((r) => setTimeout(r, 500));
  183 |       await route.fulfill({
  184 |         json: { id: "3", followerId: "1", followingId: "4" },
  185 |       });
  186 |     } else {
  187 |       await route.fallback();
  188 |     }
  189 |   });
  190 | 
  191 |   await page.goto("/friends");
  192 |   page.on("load", () => {
  193 |     throw new Error("Full page reload detected — use client-side navigation!");
  194 |   });
  195 | 
  196 |   // Search to reveal Test User 4 (not followed)
  197 |   await page.getByRole("searchbox").fill("User 4");
> 198 |   await expect(page.getByTestId("user-card-4")).toBeVisible();
      |                                                 ^ Error: expect(locator).toBeVisible() failed
  199 | 
  200 |   // Fire click without awaiting — check optimistic state while request is in-flight
  201 |   const clickPromise = page.getByTestId("follow-btn-4").click();
  202 |   await expect(page.getByTestId("unfollow-btn-4")).toBeVisible();
  203 |   await clickPromise;
  204 | });
  205 | 
```