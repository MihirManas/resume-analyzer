let lastTickTime = 0;
let ctx = null;
let isUnlocked = false;

// Initialize context and wait for user gesture to unlock
if (typeof window !== 'undefined') {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    ctx = new AudioContext();

    const unlock = () => {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          isUnlocked = true;
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('keydown', unlock);
        }).catch(() => {});
      } else {
        isUnlocked = true;
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      }
    };

    // Use pointerdown as it's the most responsive touch/click event
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }
}

export const playTactileTick = () => {
  if (!ctx || !isUnlocked || ctx.state !== 'running') return;

  const now = ctx.currentTime;
  if (now - lastTickTime < 0.05) return; // 50ms throttle
  lastTickTime = now;

  try {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Premium 'tak' sound profile
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.01);

    filter.type = 'highpass';
    filter.frequency.value = 800;

    // Increased volume slightly to 0.15 to ensure it is audible on laptop speakers
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.015);
  } catch (e) {
    // Fail silently
  }
};
