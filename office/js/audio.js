const AUDIO_MUTE_STORAGE_KEY = "warewolf.office.mute.v1";

function readMuteFlag() {
  try {
    return window.localStorage.getItem(AUDIO_MUTE_STORAGE_KEY)
      === "1";
  } catch {
    return false;
  }
}

function writeMuteFlag(isMuted) {
  try {
    window.localStorage.setItem(
      AUDIO_MUTE_STORAGE_KEY,
      isMuted ? "1" : "0"
    );
  } catch {
    // Private browsing may block persistence; mute still works.
  }
}

export function createAudioBus() {
  return {
    isMuted: readMuteFlag(),
  };
}

export function isAudioMuted(audio) {
  return Boolean(audio && audio.isMuted);
}

export function setAudioMuted(audio, isMuted) {
  audio.isMuted = Boolean(isMuted);
  writeMuteFlag(audio.isMuted);
  return audio.isMuted;
}

export function toggleAudioMuted(audio) {
  return setAudioMuted(audio, !audio.isMuted);
}

export function playUiBlip(audio, kind = "ui") {
  if (!audio || audio.isMuted) {
    return;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  try {
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequency = kind === "message" ? 660 : 520;

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.04;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.12);
    window.setTimeout(() => {
      context.close();
    }, 200);
  } catch {
    // Autoplay / AudioContext restrictions — ignore.
  }
}
