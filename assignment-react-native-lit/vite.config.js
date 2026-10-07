import { defineConfig } from "vite";

// host: true exposes the dev server on the LAN so a phone can open it.
// Sensors (DeviceMotion) only work in a secure context, so for a real phone
// run a tunnel (e.g. `npx localtunnel --port 5173`) or use Chrome remote debugging.
export default defineConfig({
  server: { host: true },
});
