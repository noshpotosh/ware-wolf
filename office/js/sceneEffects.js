export function createCrtEffect() {
  const effect = document.createElement("div");
  effect.className = "crt-surface-effect";
  effect.innerHTML = `
    <div class="crt-surface-wash"></div>
    <div class="crt-surface-copy" aria-hidden="true">
      <i></i><i></i><i></i><i></i>
    </div>
    <div class="crt-surface-cursor"></div>
    <div class="crt-surface-lines"></div>
    <div class="crt-surface-scan"></div>`;
  return effect;
}

export function createSteamEffect(pickupId) {
  const effect = document.createElement("div");
  effect.className = "anchored-steam";
  effect.dataset.pickupEffect = pickupId;
  for (const [x, delay] of [[-7, 0], [0, -1.6], [7, -3.2]]) {
    const wisp = document.createElement("i");
    wisp.style.left = `${x}px`;
    wisp.style.animationDelay = `${delay}s`;
    effect.append(wisp);
  }
  return effect;
}

function createGlowEffect(parameters = {}) {
  const effect = document.createElement("i");
  const radius = Number(parameters.radius ?? 24);
  const intensity = Number(parameters.intensity ?? 0.25);
  effect.className = "anchored-glow";
  effect.style.setProperty("--glow-radius", `${radius}px`);
  effect.style.setProperty("--glow-intensity", String(intensity));
  return effect;
}

function createLedEffect(parameters = {}) {
  const effect = document.createElement("i");
  const size = Number(parameters.size ?? 8);
  const duration = Number(parameters.durationSeconds ?? 2.6);
  const delay = Number(parameters.delaySeconds ?? 0);
  effect.className = "anchored-led";
  effect.dataset.color = parameters.color === "amber" ? "amber" : "green";
  effect.style.setProperty("--led-size", `${size}px`);
  effect.style.setProperty("--led-duration", `${duration}s`);
  effect.style.setProperty("--led-delay", `${delay}s`);
  return effect;
}

export function createEffectPreset(preset, parameters = {}) {
  if (preset === "crt") return createCrtEffect();
  if (preset === "steam") return createSteamEffect(parameters.pickupId);
  if (preset === "glow") return createGlowEffect(parameters);
  if (preset === "led") return createLedEffect(parameters);
  throw new Error(`Unknown scene effect preset: ${preset}`);
}
