import { toBlob } from "html-to-image";

// react-native-view-shot + expo-sharing -> html-to-image + Web Share API.
// html-to-image redraws the DOM through an SVG <foreignObject>, so it is an
// approximation of the screen, not a real capture like captureRef.
export async function shareElement(element, title = "Share this fortune") {
  const blob = await toBlob(element, { pixelRatio: 2 });
  if (!blob) throw new Error("capture failed");
  const file = new File([blob], "fortune.png", { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title });
    return "shared";
  }
  // Desktop browsers mostly can't share files: fall back to a download.
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: "fortune.png" });
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
