export function describeTime(now = new Date()) {
  const hour = now.getHours();
  const clock = now.toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const date = now.toLocaleDateString([], { month: "short", day: "numeric" });
  let mood = "Sleepy";
  if (hour >= 6 && hour < 12) mood = "Fresh";
  else if (hour >= 12 && hour < 17) mood = "Focused";
  else if (hour >= 17 && hour < 21) mood = "Winding down";
  return { clock, date, mood };
}
