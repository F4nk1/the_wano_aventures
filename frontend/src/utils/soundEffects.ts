// Sound Effects synthesized using Web Audio API

class SoundEffectsManager {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a metallic coin register sound (Cha-ching!)
  playCash() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1500, now);
    osc1.frequency.setValueAtTime(2000, now + 0.08);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.setValueAtTime(1200, now + 0.08);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  // Play a siren sound (going to jail)
  playSiren() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, now);
    
    // Modulate frequency to create siren sweep
    osc.frequency.linearRampToValueAtTime(900, now + 0.25);
    osc.frequency.linearRampToValueAtTime(500, now + 0.5);
    osc.frequency.linearRampToValueAtTime(900, now + 0.75);
    osc.frequency.linearRampToValueAtTime(500, now + 1.0);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.85);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.05);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.1);
  }

  // Play dice rolling rattle
  playDice() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Create 4 rapid small impacts
    for (let i = 0; i < 5; i++) {
      const timeOffset = now + i * 0.08;
      
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 - i * 15, timeOffset);
      osc.frequency.exponentialRampToValueAtTime(40, timeOffset + 0.05);

      gainNode.gain.setValueAtTime(0.2, timeOffset);
      gainNode.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.055);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(timeOffset);
      osc.stop(timeOffset + 0.06);
    }
  }

  // Play bankruptcy explosion sound
  playExplode() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.85);

    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.95);
  }

  // Play step movement sound
  playStep() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(100, now + 0.03);

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const SoundEffects = new SoundEffectsManager();
