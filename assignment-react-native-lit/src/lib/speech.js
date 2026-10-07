// expo-speech -> speechSynthesis. Voices differ per OS/browser, so prefer en-GB when present.
export function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = speechSynthesis.getVoices().find((v) => /en[-_]GB/i.test(v.lang));
  if (voice) utterance.voice = voice;
  utterance.rate = 0.8;
  utterance.pitch = 0.75;
  speechSynthesis.speak(utterance);
}

export const stopSpeaking = () => "speechSynthesis" in window && speechSynthesis.cancel();
