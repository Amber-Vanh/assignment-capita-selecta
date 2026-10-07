// The "occasional, randomised" idle animations (hat bow, envelope strain).
// RN used a recursive setTimeout plus a flag in a useEffect; here it's a plain
// scheduler that returns its own cancel function.
export function scheduleIdle(play, minDelay, spread) {
  let timer;
  const next = () => {
    timer = setTimeout(() => {
      play();
      next();
    }, minDelay + Math.random() * spread);
  };
  next();
  return () => clearTimeout(timer);
}
