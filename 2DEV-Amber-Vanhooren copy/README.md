# Couch Potato 🛋️

**Couch Potato** is a social activity tracker — but for intentional laziness. Users log their couch sessions (binge-watching, gaming, napping, …), follow friends, and see a shared feed of everyone's proudest idle moments.

## Goal

Basically, the goal of this assignment is to finish the application itself and make all the tests pass. You can change almost anything except the tests themselves.
The focus is on React Router and React. It is not necessary to make changes in the app/services folder.

The readme gives you information about which data is needed for a specific page. Implement the loader with that information in mind.

Often, you will need to make little changes in the components to make sure everything works as expected. We've implemented those changes to prevent errors or as a challenge.

## Tests

In the tests, the backend service is mocked. This means that the tests will run without the need for a backend server.
Check the package.json scripts for different options on how to run the tests.
There are a lot of tests, but don't worry about them. Use them as a safety net to check if your implementation is correct.

---

## Data model

The application is backed by a small JSON database with four collections:

| Collection   | Fields                                                   | Purpose                                  |
|--------------|----------------------------------------------------------|------------------------------------------|
| `users`      | `id`, `name`, `avatar`                                   | Every person in the system               |
| `categories` | `id`, `name`, `emoji`                                    | Types of lazy activity (TV, Gaming, …)   |
| `sessions`   | `id`, `userId`, `categoryId`, `date`, `duration`, `notes`| A single logged couch session            |
| `follows`    | `id`, `followerId`, `followingId`                        | Who follows whom (many-to-many via join) |

---

## Application shell

Every screen lives inside a shared shell that wraps all content:

```text
┌────────────────────────────────────┐
│  AppHeader                         │
│  ┌──────────────┐  ┌────────────┐  │
│  │ Couch Potato │  │ 🛋️ Me      │  │
│  └──────────────┘  └────────────┘  │
├────────────────────────────────────┤
│                                    │
│   <screen content here>            │
│                                    │
├────────────────────────────────────┤
│  BottomNav                         │
│  ┌────────┬──────────┬───────────┐ │
│  │  Feed  │  + Track │  Friends  │ │
│  └────────┴──────────┴───────────┘ │
└────────────────────────────────────┘
```

- **AppHeader** — brand name on the left; avatar/name link to the logged-in user's profile on the right.
- **BottomNav** — persistent navigation between the three main destinations.

### Code hint

To get the current user, pass the currentUserId to the getUser method:

```js
getUser(await getCurrentUserId());
```

---

## Screens

### 1. Feed  `/`

The home screen. Shows a reverse-chronological list of sessions from the logged-in user and everyone they follow.

**Data needed:**  We have to get all the sessions of the current user + the sessions from the ones the current user is following.

```js
  const currentUserId = await getCurrentUserId();
  const follows = await getFollows(currentUserId);
  const feedSessions = await getFeedSessions([
    currentUserId,
    ...follows.map((f) => f.followingId),
  ]);
```

```text
┌────────────────────────────────────┐
│  AppHeader                         │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │ FeedItem                     │  │
│  │  😎 Alex Chen  · May 7       │  │
│  │  📺 TV Binge                 │  │
│  │  3h of glorious laziness     │  │
│  │  "Finished Breaking Bad"     │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ FeedItem                     │  │
│  │  🎮 Sam Rivera  · May 6      │  │
│  │  🎮 Gaming                   │  │
│  │  2h of glorious laziness     │  │
│  └──────────────────────────────┘  │
│  …                                 │
│                                    │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

Each **FeedItem** card shows:

- The poster's avatar, name, and session date
- The category badge (emoji + name)
- Duration ("Xh Ym of glorious laziness")
- Optional notes

Clicking any FeedItem navigates to the **Session Detail** screen.

If no sessions exist yet, an empty state is shown encouraging the user to follow friends.

---

### 2. Session Detail  `/sessions/:id`

A full read-only view of a single session, accessible from the feed or from a profile accordion.

**Data needed:** the session record, with its owning user and category embedded.

```js
  const session = await getSessionWithRelations(__sessionID from the url__);
  const currentUserId = await getCurrentUserId();
```

```text
┌────────────────────────────────────┐
│  AppHeader                         │
├────────────────────────────────────┤
│                                    │
│  📺 TV Binge                       │
│  ─────────────────────────────     │
│  📅  May 7, 2026                   │
│  🕐  3h (180 minutes)              │
│  📄  Finished Breaking Bad finale  │
│                                    │
│  🛋️ You  ← link to profile        │
│                                    │
│  [ Edit ]  [ Back ]                │
│  (Edit only visible if own session)│
│                                    │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

**Functionality:**

- Displays category, date, formatted duration, and notes.
- Links to the owning user's profile.
- **Edit** button appears only when viewing your own session; it navigates to the Edit screen.
- **Back** returns to the previous screen without a full page reload.

---

### 3. Track (Log a Session)  `/track`

A form to log a new couch session.

**Data needed:** all categories (to populate the dropdown).

```js
const categories = await getCategories();
```

```text
┌────────────────────────────────────┐
│  AppHeader                         │
├────────────────────────────────────┤
│                                    │
│  Log a Session                     │
│  ─────────────────────────────     │
│  Category   [ 📺 TV Binge  ▼ ]     │
│  Date       [ 2026-05-10   ]       │
│  Duration   [ 180 minutes  ]       │
│  Notes      [ .............]       │
│                                    │
│  [ Log it! ]  [ Cancel ]           │
│                                    │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

**Functionality:**

- Category dropdown pre-populated from the database.
- Date defaults to today.
- Duration entered in minutes.
- Notes field is optional.
- **Log it!** saves the session and redirects to the Feed.
- **Cancel** goes back to the previous screen.

**Data to send:** Make use of the `createSession` method (check its documentation)
You also need to pass the currentUserId to the createSession method, which does not come via the form data.

---

### 4. Edit Session  `/sessions/:id/edit`

Same form as Track, pre-filled with the existing session values. Only accessible to the session's owner (redirects to the feed otherwise).

**Data needed:** the session record to pre-fill the form.

```js
  const session = await getSession(__sessionID from the url__);
```

Check if the `session.userId` is different then the `getCurrentUserId()`, redirect to the home feed otherwise

**Date to send:** Make use of the `updateSession` method (check its documentation). Get the session id from the url. Navigate to `/users/${currentUserId}` when done

```text
┌────────────────────────────────────┐
│  AppHeader                         │
├────────────────────────────────────┤
│                                    │
│  Edit Session                      │
│  ─────────────────────────────     │
│  Date       [ 2026-05-07   ]       │
│  Duration   [ 180 minutes  ]       │
│  Notes      [ Finished BB  ]       │
│                                    │
│  [ Save ]  [ Cancel ]              │
│                                    │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

**Functionality:**

- Category is not editable (it is fixed when the session is created).
- **Save** updates the session and redirects to your profile.
- **Cancel** goes back to the previous screen.

---

### 5. Friends  `/friends`

Manage your social connections — see who you follow and discover new people.

**Data needed:** all users, your current follows list.

```js
  const currentUserId = await getCurrentUserId();
  const [users, follows] = await Promise.all([
    getUsers(),
    getFollows(currentUserId),
  ]);
```

**Data to send:** This route is handling the following and unfollowing. The difference is set via the `intent` variable.

```js
  if (intent === "follow") {
    await createFollow({
      followerId: await getCurrentUserId(),
      followingId: formData.get("followingId"),
    });
  } else if (intent === "unfollow") {
    await deleteFollow(formData.get("followId"));
  }

  return null;
```

```text
┌────────────────────────────────────┐
│  AppHeader                         │
├────────────────────────────────────┤
│  Friends                           │
│  ─────────────────────────────     │
│  [ 🔍 Search people…         ]     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ UserCard                     │  │
│  │  😎 Alex Chen   [Following]  │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ UserCard                     │  │
│  │  🎮 Sam Rivera  [Following]  │  │
│  └──────────────────────────────┘  │
│                                    │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

**Functionality:**

- By default, only users you already follow are shown.
- Typing in the search box filters across **all** users by name (including people you don't follow yet).
- Each **UserCard** shows the user's avatar, name, and a Follow/Following toggle button.
  - The button updates optimistically.
- Clicking a user's name navigates to their **Profile** screen.

---

### 6. Profile  `/users/:id`

A user's profile page. Works for both your own profile and other users' profiles — the same screen adapts based on who is being viewed.

**Data needed:** the user record, their sessions (sorted newest first), and — when viewing someone else — whether you currently follow them.

```js
  const currentUserId = await getCurrentUserId();
  const userId = params.userId ?? currentUserId;
  const isOwnProfile = userId === currentUserId;

  const [user, follow, sessions] = await Promise.all([
    getUser(userId),
    isOwnProfile ? Promise.resolve(null) : getFollow(currentUserId, userId),
    getSessionsByUser(userId),
  ]);

  return {
    user,
    currentUserId,
    isOwnProfile,
    isFollowing: Boolean(follow),
    followId: follow?.id ?? null,
    sessions,
  };
```

```text
┌────────────────────────────────────┐
│  AppHeader                         │
├────────────────────────────────────┤
│                                    │
│  🛋️  You              (own profile)│
│  ─────────────────────────────     │
│  YOUR SESSIONS                     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ SessionAccordion             │  │
│  │  May 7  ·········  3h    ▼  │  │  ← click to expand
│  │  ┌────────────────────────┐ │  │
│  │  │  📅 May 7, 2026        │ │  │
│  │  │  🕐 180 minutes        │ │  │
│  │  │  📄 Finished BB        │ │  │
│  │  │  [ Edit ]              │ │  │
│  │  └────────────────────────┘ │  │
│  │  May 4  ·········  1h 30m ▼ │  │
│  └──────────────────────────────┘  │
│                                    │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  AppHeader                         │
├────────────────────────────────────┤
│                                    │
│  😎  Alex Chen  [ Following ]      │  ← other user's profile
│  ─────────────────────────────     │
│  RECENT SESSIONS                   │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ SessionAccordion             │  │
│  │  May 7  ·········  3h    ▼  │  │
│  │  …                           │  │
│  └──────────────────────────────┘  │
│                                    │
├────────────────────────────────────┤
│  BottomNav                         │
└────────────────────────────────────┘
```

**Functionality:**

| Feature                  | Own profile | Other user's profile |
|--------------------------|-------------|----------------------|
| Follow / Unfollow button | Hidden      | Visible              |
| Edit link on sessions    | Visible     | Hidden               |
| Section title            | "Your Sessions" | "Recent Sessions" |

- Sessions are displayed in a collapsible **accordion**: clicking a row expands it to show full details.
- On your own profile, each expanded session includes an **Edit** link.
- On another user's profile, the **Follow / Unfollow** button is shown next to their name and reflects the current follow state. Clicking it immediately persists the change.

---

## Component tree

```text
AppLayout
├── AppHeader
├── <screen>
│   ├── Feed
│   │   └── FeedItem  (×N)
│   │
│   ├── SessionDetail
│   │
│   ├── Track
│   │   └── SessionForm
│   │
│   ├── EditSession
│   │   └── SessionForm
│   │
│   ├── Friends
│   │   └── UserCard  (×N)
│   │
│   └── UserProfile  (own or other)
│       ├── EmptyState  (when no sessions)
│       └── SessionAccordion
│
└── BottomNav
```

---

## Services

All API communication is isolated in the `services/` layer. Each file groups related calls
Route files (screens) call these services directly — they contain no raw `fetch` calls themselves.

---

## Handing in

- Only hand in the client folder
- Remove the node_modules folder
- Rename the client folder to 2DEV-FIRSTNAME-LASTNAME
- Zip that folder and upload it to Leho.
