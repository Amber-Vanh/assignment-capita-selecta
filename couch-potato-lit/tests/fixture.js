import { test as base } from "@playwright/test";
import { testdata } from "./testdata.js";

export const test = base.extend({
  page: async ({ page }, use) => {
    // GET /sessions (all)
    await page.route(/localhost:3000\/sessions(\?.*)?$/, async (route) => {
      const url = route.request().url();
      const params = new URL(url).searchParams;
      const userId = params.get("userId");
      const categoryId = params.get("categoryId");
      const whereStr = params.get("_where");
      const embeds = params.getAll("_embed");

      let json = testdata.sessions;
      if (whereStr) {
        try {
          const where = JSON.parse(whereStr);
          if (where.userId?.eq !== undefined)
            json = json.filter((s) => s.userId === where.userId.eq);
          if (where.userId?.in !== undefined)
            json = json.filter((s) => where.userId.in.includes(s.userId));
          if (where.categoryId?.eq !== undefined)
            json = json.filter((s) => s.categoryId === where.categoryId.eq);
        } catch {}
      } else {
        if (userId !== null) json = json.filter((s) => s.userId === userId);
      }
      if (categoryId !== null)
        json = json.filter((s) => s.categoryId === categoryId);
      if (embeds.includes("user"))
        json = json.map((s) => ({
          ...s,
          user: testdata.users.find((u) => u.id === s.userId),
        }));
      if (embeds.includes("category"))
        json = json.map((s) => ({
          ...s,
          category: testdata.categories.find((c) => c.id === s.categoryId),
        }));

      const sort = params.get("_sort");
      if (sort === "-date")
        json = [...json].sort((a, b) => new Date(b.date) - new Date(a.date));

      await route.fulfill({ json });
    });

    // GET /sessions/:id
    testdata.sessions.forEach(async (session) => {
      const regex = new RegExp(
        `localhost:3000/sessions/${session.id}(\\?.*)?$`,
      );
      await page.route(regex, async (route) => {
        const url = route.request().url();
        const params = new URL(url).searchParams;
        const embeds = params.getAll("_embed");
        let json = session;
        if (embeds.includes("user"))
          json = {
            ...json,
            user: testdata.users.find((u) => u.id === session.userId),
          };
        if (embeds.includes("category"))
          json = {
            ...json,
            category: testdata.categories.find(
              (c) => c.id === session.categoryId,
            ),
          };
        await route.fulfill({ json });
      });
    });

    // GET /categories (list)
    await page.route(/localhost:3000\/categories(\?.*)?$/, async (route) => {
      await route.fulfill({ json: testdata.categories });
    });

    // GET /categories/:id
    testdata.categories.forEach(async (category) => {
      const regex = new RegExp(`localhost:3000/categories/${category.id}$`);
      await page.route(regex, async (route) => {
        await route.fulfill({ json: category });
      });
    });

    // GET /users (list)
    await page.route(/localhost:3000\/users(\?.*)?$/, async (route) => {
      await route.fulfill({ json: testdata.users });
    });

    // GET /users/:id
    testdata.users.forEach(async (user) => {
      const regex = new RegExp(`localhost:3000/users/${user.id}$`);
      await page.route(regex, async (route) => {
        await route.fulfill({ json: user });
      });
    });

    // GET /follows
    await page.route(/localhost:3000\/follows(\?.*)?$/, async (route) => {
      const url = route.request().url();
      const params = new URL(url).searchParams;
      const followerId = params.get("followerId");
      const followingId = params.get("followingId");
      const whereStr = params.get("_where");

      let json = testdata.follows;
      if (whereStr) {
        try {
          const where = JSON.parse(whereStr);
          if (where.followerId?.eq !== undefined)
            json = json.filter((f) => f.followerId === where.followerId.eq);
          if (where.followingId?.eq !== undefined)
            json = json.filter((f) => f.followingId === where.followingId.eq);
        } catch {}
      } else {
        if (followerId !== null)
          json = json.filter((f) => f.followerId === followerId);
        if (followingId !== null)
          json = json.filter((f) => f.followingId === followingId);
      }

      await route.fulfill({ json });
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from "@playwright/test";
