/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import loseMp3 from '../assets/sounds/lose.mp3';
import winMp3 from '../assets/sounds/win.mp3';

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5; // default volume level (0.0 to 1.0)
  private winAudio: HTMLAudioElement | null = null;
  private loseAudio: HTMLAudioElement | null = null;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuteStatus() {
    return this.isMuted;
  }

  setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.winAudio) this.winAudio.volume = this.volume;
    if (this.loseAudio) this.loseAudio.volume = this.volume;
  }

  getVolume() {
    return this.volume;
  }

  // Play standard block stack pop sound
  playPop(freqOffset: number = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Cute pop: fast pitched drop
      const startFreq = 160 + freqOffset;
      const endFreq = 90 + freqOffset;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, ctx.currentTime + 0.15);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Play perfect stack musical scale chime based on streak
  playPerfectChime(streak: number) {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      
      // Determine musical frequency (pentatonic scale feels harmonious)
      const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
      const baseFreq = pentatonic[Math.min(streak, pentatonic.length - 1)];

      // Construct a bell/chime sound containing a carrier and brief overtone
      const playBellNode = (freq: number, oscType: OscillatorType, gainVal: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(gainVal * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      };

      // Primary tone
      playBellNode(baseFreq, 'sine', 0.25, 0.4);
      // Clean overtone
      playBellNode(baseFreq * 1.5, 'sine', 0.12, 0.25);
      // Octave chime
      playBellNode(baseFreq * 2, 'sine', 0.08, 0.35);

    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  }

  // Play a descending sliding rumble for "destroyed/phá" operations
  playDestroySound() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, ctx.currentTime + 0.5);

      // Low pass filter for a deeper rumble
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio rumble failed:', e);
    }
  }

  // Play an rising synth sweep when building bulk boxes
  playBuildChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.18 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio build failed:', e);
    }
  }

  // Play standard failure sound when completely missed
  playMiss() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio miss failed:', e);
    }
  }

  private playMp3(src: string, cache: 'win' | 'lose') {
    if (this.isMuted) return;
    try {
      this.initContext();
      let audio = cache === 'win' ? this.winAudio : this.loseAudio;
      if (!audio) {
        audio = new Audio(src);
        audio.preload = 'auto';
        if (cache === 'win') this.winAudio = audio;
        else this.loseAudio = audio;
      }
      audio.volume = this.volume;
      audio.currentTime = 0;
      void audio.play().catch((err) => console.warn('MP3 playback failed:', err));
    } catch (err) {
      console.warn('MP3 playback failed:', err);
    }
  }

  playWin() {
    this.playMp3(winMp3, 'win');
  }

  playLose() {
    this.playMp3(loseMp3, 'lose');
  }

  // Tiếng nổ nhỏ khi bom phát nổ (ngắn, nhẹ)
  playExplosion() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;

      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(110, t);
      thump.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      thumpGain.gain.setValueAtTime(0.22 * this.volume, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.18);
      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      thump.start(t);
      thump.stop(t + 0.2);

      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(900, t);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.1 * this.volume, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.07);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.08);
    } catch (e) {
      console.warn('Audio explosion failed:', e);
    }
  }

  // Gun crack — short bang when firing (pằng)
  playGunShot() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;

      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(200, t);
      thump.frequency.exponentialRampToValueAtTime(55, t + 0.09);
      thumpGain.gain.setValueAtTime(0.32 * this.volume, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.11);
      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      thump.start(t);
      thump.stop(t + 0.12);

      const bufferSize = Math.floor(ctx.sampleRate * 0.045);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 1.6;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2800, t);
      bandpass.Q.setValueAtTime(0.85, t);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28 * this.volume, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.05);
      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.06);

      const crack = ctx.createOscillator();
      const crackGain = ctx.createGain();
      crack.type = 'square';
      crack.frequency.setValueAtTime(1400, t);
      crack.frequency.exponentialRampToValueAtTime(320, t + 0.035);
      crackGain.gain.setValueAtTime(0.07 * this.volume, t);
      crackGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.04);
      crack.connect(crackGain);
      crackGain.connect(ctx.destination);
      crack.start(t);
      crack.stop(t + 0.045);
    } catch (e) {
      console.warn('Audio gun shot failed:', e);
    }
  }

  // Feather pop when a bird is shot down
  playBirdHit() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;

      const chirp = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      chirp.type = 'sine';
      chirp.frequency.setValueAtTime(680, t);
      chirp.frequency.exponentialRampToValueAtTime(1180, t + 0.08);
      chirpGain.gain.setValueAtTime(0.22 * this.volume, t);
      chirpGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.14);
      chirp.connect(chirpGain);
      chirpGain.connect(ctx.destination);
      chirp.start(t);
      chirp.stop(t + 0.15);

      const pluck = ctx.createOscillator();
      const pluckGain = ctx.createGain();
      pluck.type = 'triangle';
      pluck.frequency.setValueAtTime(240, t + 0.03);
      pluck.frequency.exponentialRampToValueAtTime(120, t + 0.12);
      pluckGain.gain.setValueAtTime(0.16 * this.volume, t + 0.03);
      pluckGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.14);
      pluck.connect(pluckGain);
      pluckGain.connect(ctx.destination);
      pluck.start(t + 0.03);
      pluck.stop(t + 0.15);

      const bufferSize = Math.floor(ctx.sampleRate * 0.035);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const fluff = ctx.createBufferSource();
      fluff.buffer = buffer;
      const fluffFilter = ctx.createBiquadFilter();
      fluffFilter.type = 'highpass';
      fluffFilter.frequency.setValueAtTime(1200, t);
      const fluffGain = ctx.createGain();
      fluffGain.gain.setValueAtTime(0.08 * this.volume, t);
      fluffGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.04);
      fluff.connect(fluffFilter);
      fluffFilter.connect(fluffGain);
      fluffGain.connect(ctx.destination);
      fluff.start(t);
      fluff.stop(t + 0.045);
    } catch (e) {
      console.warn('Audio bird hit failed:', e);
    }
  }

  /** @deprecated use playGunShot */
  playSheepShot() {
    this.playGunShot();
  }

  // Play crisp high-pitched sound for countdown ticks
  playTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, ctx.currentTime + 0.08);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio tick failed:', e);
    }
  }
}

export const audioManager = new SoundEffectsManager();
