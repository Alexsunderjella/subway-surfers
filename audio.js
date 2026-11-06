/**
 * Subway Surfers Web - Procedural Sound Engine
 * Uses Web Audio API for zero-dependency, ultra-fast, zero-lag sound effects and BGM.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.coinPitchIndex = 0;
    this.lastCoinTime = 0;
    this.jetpackOsc = null;
    this.jetpackGain = null;

    // Load mute preference
    const savedMute = localStorage.getItem('subway_surfers_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('subway_surfers_muted', this.isMuted.toString());
    if (this.isMuted) {
      this.stopBGM();
      this.stopJetpackSound();
    }
    return this.isMuted;
  }

  // Helper to create gain envelope
  createGain(startVal, endVal, duration, timeOffset = 0) {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime + timeOffset;
    gain.gain.setValueAtTime(startVal, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVal), now + duration);
    return gain;
  }

  // --- SOUND EFFECTS ---

  playJump(isSuper = false) {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = isSuper ? 180 : 220;
    const endFreq = isSuper ? 580 : 440;
    const dur = isSuper ? 0.35 : 0.25;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur);
  }

  playSlide() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.22;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.22);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  playLaneChange() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playCoin() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    // Ascending melody chain if collected in quick succession
    if (now - this.lastCoinTime < 0.35) {
      this.coinPitchIndex = (this.coinPitchIndex + 1) % 5;
    } else {
      this.coinPitchIndex = 0;
    }
    this.lastCoinTime = now;

    const scale = [987.77, 1174.66, 1318.51, 1567.98, 1760.0]; // B5, D6, E6, G6, A6
    const baseFreq = scale[this.coinPitchIndex];

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2, now); // Higher harmonic chime

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.18);
    osc2.stop(now + 0.18);
  }

  playPowerup() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const time = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  playCrash() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;

    // Heavy bass thump
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Noise explosion
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.45);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  startJetpackSound() {
    if (this.isMuted || this.jetpackOsc) return;
    this.init();

    const now = this.ctx.currentTime;
    this.jetpackOsc = this.ctx.createOscillator();
    this.jetpackGain = this.ctx.createGain();

    this.jetpackOsc.type = 'sawtooth';
    this.jetpackOsc.frequency.setValueAtTime(80, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    this.jetpackGain.gain.setValueAtTime(0.01, now);
    this.jetpackGain.gain.linearRampToValueAtTime(0.15, now + 0.3);

    this.jetpackOsc.connect(filter);
    filter.connect(this.jetpackGain);
    this.jetpackGain.connect(this.ctx.destination);

    this.jetpackOsc.start(now);
  }

  stopJetpackSound() {
    if (this.jetpackOsc && this.jetpackGain) {
      const now = this.ctx.currentTime;
      this.jetpackGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      setTimeout(() => {
        try {
          if (this.jetpackOsc) {
            this.jetpackOsc.stop();
            this.jetpackOsc.disconnect();
          }
        } catch (e) {}
        this.jetpackOsc = null;
        this.jetpackGain = null;
      }, 220);
    }
  }

  // --- BACKGROUND MUSIC LOOP ---

  startBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;
    this.runBGMLoop();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  runBGMLoop() {
    if (!this.bgmPlaying || this.isMuted || !this.ctx) return;

    // Upbeat 130 BPM funky arcade progression
    const bpm = 130;
    const stepTime = 60 / bpm / 4; // 16th note duration
    const barSteps = 16;
    const totalBars = 4;
    const loopDuration = barSteps * totalBars * stepTime;

    const now = this.ctx.currentTime + 0.05;

    // Bass line notes (frequencies in Hz): F2, G#2, C3, D#3 etc.
    const bassNotes = [
      87.31, 87.31, 0, 87.31,  116.54, 0, 87.31, 103.83,
      87.31, 87.31, 0, 87.31,  130.81, 116.54, 103.83, 98.00,
      77.78, 77.78, 0, 77.78,  103.83, 0, 77.78, 92.50,
      87.31, 87.31, 0, 116.54, 130.81, 0, 155.56, 174.61
    ];

    // High melodic synth plucks
    const melodyNotes = [
      349.23, 0, 415.30, 0,  523.25, 0, 415.30, 349.23,
      0, 349.23, 523.25, 0,  622.25, 523.25, 0, 415.30,
      311.13, 0, 415.30, 0,  466.16, 0, 415.30, 311.13,
      349.23, 0, 523.25, 622.25, 698.46, 0, 622.25, 523.25
    ];

    for (let i = 0; i < 32; i++) {
      const noteTime = now + i * (stepTime * 2);

      // Play Bass
      const bFreq = bassNotes[i];
      if (bFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bFreq, noteTime);

        // Lowpass envelope for punchy synth bass
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, noteTime);
        filter.frequency.exponentialRampToValueAtTime(100, noteTime + 0.15);

        gain.gain.setValueAtTime(0.08, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.17);
      }

      // Play High Melody Pluck
      const mFreq = melodyNotes[i];
      if (mFreq > 0) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = 'sine';
        mOsc.frequency.setValueAtTime(mFreq, noteTime);

        mGain.gain.setValueAtTime(0.04, noteTime);
        mGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

        mOsc.connect(mGain);
        mGain.connect(this.ctx.destination);

        mOsc.start(noteTime);
        mOsc.stop(noteTime + 0.19);
      }

      // Drum: Hi-hat every 8th note
      if (i % 2 === 0) {
        this.playDrumHiHat(noteTime);
      }
      // Drum: Kick on 1 and 3
      if (i % 4 === 0) {
        this.playDrumKick(noteTime);
      }
      // Drum: Snare on 2 and 4
      if (i % 4 === 2) {
        this.playDrumSnare(noteTime);
      }
    }

    // Schedule next cycle
    this.bgmTimer = setTimeout(() => {
      this.runBGMLoop();
    }, loopDuration * 1000 - 60);
  }

  playDrumKick(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

    gain.gain.setValueAtTime(0.16, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  playDrumSnare(time) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }

  playDrumHiHat(time) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }
}

window.soundEngine = new SoundEngine();

