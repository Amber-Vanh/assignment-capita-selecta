// expo-haptics has impact styles + success/warning notifications.
// The web only has navigator.vibrate(ms | pattern): Android Chrome only,
// and no-op on iOS Safari. So the styles collapse into duration patterns.
const vibrate = (pattern) => navigator.vibrate?.(pattern);

export const haptics = {
  impact: (style = "medium") => vibrate({ light: 10, medium: 25, heavy: 50 }[style]),
  success: () => vibrate([20, 40, 20]),
  warning: () => vibrate([60, 40, 60]),
};
