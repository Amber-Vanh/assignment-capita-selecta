// Port of the shake detection in potion-page.tsx (same thresholds).
// expo-sensors Accelerometer -> DeviceMotionEvent.
const SHAKE_THRESHOLD = 0.7; // in g, like expo-sensors
const SHAKE_COOLDOWN_MS = 2000;
const SHAKE_COUNT_REQUIRED = 2;
const SHAKE_WINDOW_MS = 1000;
const G = 9.81; // DeviceMotion reports m/s², expo-sensors reports g

export const shakeSupported = () => "DeviceMotionEvent" in window;

// iOS 13+ only hands out motion data after an explicit permission prompt
// that must be triggered from a user gesture (a tap). Other browsers: no prompt.
export async function requestMotionPermission() {
  const req = window.DeviceMotionEvent?.requestPermission;
  if (typeof req !== "function") return true;
  try {
    return (await req.call(window.DeviceMotionEvent)) === "granted";
  } catch {
    return false;
  }
}

/** Starts listening; returns a stop() function. */
export function startShakeDetection(onShake) {
  let lastMagnitude = null;
  let wasAbove = false;
  let lastShake = 0;
  let crossings = [];

  const handler = (event) => {
    const a = event.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    const magnitude = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2) / G;
    const now = Date.now();

    const delta = lastMagnitude === null ? 0 : Math.abs(magnitude - lastMagnitude);
    lastMagnitude = magnitude;
    const isAbove = delta > SHAKE_THRESHOLD;

    if (isAbove && !wasAbove) {
      crossings = [...crossings, now].filter((t) => now - t <= SHAKE_WINDOW_MS);
      if (crossings.length >= SHAKE_COUNT_REQUIRED && now - lastShake > SHAKE_COOLDOWN_MS) {
        lastShake = now;
        crossings = [];
        onShake();
      }
    }
    wasAbove = isAbove;
  };

  window.addEventListener("devicemotion", handler);
  return () => window.removeEventListener("devicemotion", handler);
}
