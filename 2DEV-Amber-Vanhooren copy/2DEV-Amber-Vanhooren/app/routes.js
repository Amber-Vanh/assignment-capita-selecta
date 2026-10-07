import { index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layouts/AppLayout.jsx", [
    index("routes/feed.jsx"),
    route("track", "routes/track.jsx"),
    route("sessions/:sessionId", "routes/sessionDetail.jsx"),
    route("sessions/:sessionId/edit", "routes/editSession.jsx"),
    route("friends", "routes/friends.jsx"),
    route("users/:userId", "routes/userProfile.jsx"),
  ]),
];