// expo-local-authentication -> WebAuthn with a platform authenticator
// (Touch ID / Face ID / Windows Hello / Android fingerprint).
//
// The semantics differ: there is no "just scan the finger". The first read creates a
// device-bound passkey, later reads ask that passkey for an assertion. Nothing is verified
// server-side: we only care that the user proved themselves to the device.
const CRED_KEY = "hatCredentialId";

const toB64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export async function verifyUser() {
  const available = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.();
  if (!available) {
    return { ok: false, unavailable: true, message: "This device has no fingerprint or Face ID sensor." };
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const stored = localStorage.getItem(CRED_KEY);
  try {
    if (stored) {
      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ type: "public-key", id: fromB64(stored), transports: ["internal"] }],
          userVerification: "required",
          timeout: 60_000,
        },
      });
    } else {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Fortune Teller" },
          user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "wizard", displayName: "Wizard" },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60_000,
        },
      });
      localStorage.setItem(CRED_KEY, toB64(new Uint8Array(cred.rawId)));
    }
    return { ok: true };
  } catch (error) {
    // a passkey the user deleted would fail forever, so forget it and re-create next time
    localStorage.removeItem(CRED_KEY);
    return {
      ok: false,
      message:
        error.name === "NotAllowedError"
          ? "The Hat couldn't read you. Try again."
          : "Something went wrong. Try again.",
    };
  }
}
