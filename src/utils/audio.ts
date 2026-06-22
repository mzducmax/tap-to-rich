/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import hackerMp3 from '../assets/sounds/hacker.mp3';
import loseMp3 from '../assets/sounds/lose.mp3';
import trainMp3 from '../assets/sounds/train.mp3';
import winMp3 from '../assets/sounds/win.mp3';
import trumpMp3 from '../assets/sounds/trump.mp3';

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5; // default volume level (0.0 to 1.0)
  private winAudio: HTMLAudioElement | null = null;
  private loseAudio: HTMLAudioElement | null = null;
  private trumpAudio: HTMLAudioElement | null = null;
  private hackerAudio: HTMLAudioElement | null = null;
  private trainAudio: HTMLAudioElement | null = null;

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
    if (this.trumpAudio) this.trumpAudio.volume = this.volume;
    if (this.hackerAudio) this.hackerAudio.volume = this.volume;
    if (this.trainAudio) this.trainAudio.volume = this.volume;
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

  private playMp3(src: string, cache: 'win' | 'lose' | 'trump') {
    if (this.isMuted) return;
    try {
      this.initContext();
      let audio =
        cache === 'win'
          ? this.winAudio
          : cache === 'lose'
            ? this.loseAudio
            : this.trumpAudio;
      if (!audio) {
        audio = new Audio(src);
        audio.preload = 'auto';
        if (cache === 'win') this.winAudio = audio;
        else if (cache === 'lose') this.loseAudio = audio;
        else this.trumpAudio = audio;
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

  /** Key 9 — Trump spawn intro clip. */
  playTrumpSpawn() {
    this.playMp3(trumpMp3, 'trump');
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

  // Epic lightning strike: crack → body → bass thump → short rumble tail (key 7)
  playThunder() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;

      // ── 1. Initial crack — instant white-noise burst, very bright ──────────
      const crackSz = Math.floor(ctx.sampleRate * 0.022);
      const crackBuf = ctx.createBuffer(1, crackSz, ctx.sampleRate);
      const crackData = crackBuf.getChannelData(0);
      for (let i = 0; i < crackSz; i++)
        crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crackSz * 0.18));
      const crackSrc = ctx.createBufferSource();
      crackSrc.buffer = crackBuf;
      const crackHP = ctx.createBiquadFilter();
      crackHP.type = 'highpass';
      crackHP.frequency.setValueAtTime(3500, t);
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.72 * this.volume, t);
      crackGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.025);
      crackSrc.connect(crackHP);
      crackHP.connect(crackGain);
      crackGain.connect(ctx.destination);
      crackSrc.start(t);
      crackSrc.stop(t + 0.028);

      // ── 2. Electric body — mid-freq sizzle that fills the crack ───────────
      const bodySz = Math.floor(ctx.sampleRate * 0.14);
      const bodyBuf = ctx.createBuffer(1, bodySz, ctx.sampleRate);
      const bodyData = bodyBuf.getChannelData(0);
      for (let i = 0; i < bodySz; i++)
        bodyData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bodySz * 0.42));
      const bodySrc = ctx.createBufferSource();
      bodySrc.buffer = bodyBuf;
      const bodyBP = ctx.createBiquadFilter();
      bodyBP.type = 'bandpass';
      bodyBP.frequency.setValueAtTime(1800, t + 0.008);
      bodyBP.Q.setValueAtTime(0.9, t + 0.008);
      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(0.44 * this.volume, t + 0.008);
      bodyGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.16);
      bodySrc.connect(bodyBP);
      bodyBP.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      bodySrc.start(t + 0.008);
      bodySrc.stop(t + 0.155);

      // ── 3. Bass thump — felt impact (sine sweep 120→38 Hz) ────────────────
      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(120, t + 0.012);
      thump.frequency.exponentialRampToValueAtTime(38, t + 0.22);
      thumpGain.gain.setValueAtTime(0.0, t + 0.012);
      thumpGain.gain.linearRampToValueAtTime(0.38 * this.volume, t + 0.030);
      thumpGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.28);
      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      thump.start(t + 0.012);
      thump.stop(t + 0.30);

      // ── 4. Short rumble tail — low-pass noise 0.5 s ──────────────────────
      const rumbleSz = Math.floor(ctx.sampleRate * 0.5);
      const rumbleBuf = ctx.createBuffer(1, rumbleSz, ctx.sampleRate);
      const rumbleData = rumbleBuf.getChannelData(0);
      for (let i = 0; i < rumbleSz; i++) rumbleData[i] = Math.random() * 2 - 1;
      const rumbleSrc = ctx.createBufferSource();
      rumbleSrc.buffer = rumbleBuf;
      const rumbleLP = ctx.createBiquadFilter();
      rumbleLP.type = 'lowpass';
      rumbleLP.frequency.setValueAtTime(180, t + 0.04);
      rumbleLP.frequency.exponentialRampToValueAtTime(55, t + 0.55);
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.0, t + 0.04);
      rumbleGain.gain.linearRampToValueAtTime(0.24 * this.volume, t + 0.08);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.52);
      rumbleSrc.connect(rumbleLP);
      rumbleLP.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumbleSrc.start(t + 0.04);
      rumbleSrc.stop(t + 0.55);
    } catch (e) {
      console.warn('Audio thunder failed:', e);
    }
  }

  // Vui nhộn — fanfare khi Trump spawn cộng tiền (key 9)
  playTrumpFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const gaps = [0, 0.09, 0.18, 0.28];

      notes.forEach((freq, i) => {
        const start = t + gaps[i]!;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === notes.length - 1 ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, start + 0.08);
        gain.gain.setValueAtTime(0.0, start);
        gain.gain.linearRampToValueAtTime((0.22 - i * 0.02) * this.volume, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });

      const cheerSz = Math.floor(ctx.sampleRate * 0.12);
      const cheerBuf = ctx.createBuffer(1, cheerSz, ctx.sampleRate);
      const cheerData = cheerBuf.getChannelData(0);
      for (let i = 0; i < cheerSz; i++) {
        cheerData[i] = (Math.random() * 2 - 1) * (1 - i / cheerSz);
      }
      const cheer = ctx.createBufferSource();
      cheer.buffer = cheerBuf;
      const cheerBP = ctx.createBiquadFilter();
      cheerBP.type = 'bandpass';
      cheerBP.frequency.setValueAtTime(2200, t + 0.2);
      cheerBP.Q.setValueAtTime(0.8, t + 0.2);
      const cheerGain = ctx.createGain();
      cheerGain.gain.setValueAtTime(0.0, t + 0.2);
      cheerGain.gain.linearRampToValueAtTime(0.14 * this.volume, t + 0.24);
      cheerGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.38);
      cheer.connect(cheerBP);
      cheerBP.connect(cheerGain);
      cheerGain.connect(ctx.destination);
      cheer.start(t + 0.2);
      cheer.stop(t + 0.4);
    } catch (e) {
      console.warn('Audio trump fanfare failed:', e);
    }
  }

  // Tiếng tiền rơi — key [4] avatar coin shower
  playMoneyRain() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;
      const clinkCount = 14;
      const baseGap = 0.055;

      for (let i = 0; i < clinkCount; i++) {
        const start = t + i * baseGap + Math.random() * 0.02;
        const freq = 920 + Math.random() * 680;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.62, start + 0.07);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 0.9, start);
        filter.Q.setValueAtTime(6, start);

        gain.gain.setValueAtTime(0.0, start);
        gain.gain.linearRampToValueAtTime((0.14 - i * 0.004) * this.volume, start + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, start + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.1);
      }

      const tumbleSz = Math.floor(ctx.sampleRate * 0.55);
      const tumbleBuf = ctx.createBuffer(1, tumbleSz, ctx.sampleRate);
      const tumbleData = tumbleBuf.getChannelData(0);
      for (let i = 0; i < tumbleSz; i++) {
        tumbleData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (tumbleSz * 0.38));
      }
      const tumble = ctx.createBufferSource();
      tumble.buffer = tumbleBuf;
      const tumbleBP = ctx.createBiquadFilter();
      tumbleBP.type = 'bandpass';
      tumbleBP.frequency.setValueAtTime(1400, t + 0.04);
      tumbleBP.Q.setValueAtTime(0.7, t + 0.04);
      const tumbleGain = ctx.createGain();
      tumbleGain.gain.setValueAtTime(0.0, t + 0.04);
      tumbleGain.gain.linearRampToValueAtTime(0.1 * this.volume, t + 0.08);
      tumbleGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.52);
      tumble.connect(tumbleBP);
      tumbleBP.connect(tumbleGain);
      tumbleGain.connect(ctx.destination);
      tumble.start(t + 0.04);
      tumble.stop(t + 0.55);
    } catch (e) {
      console.warn('Audio money rain failed:', e);
    }
  }

  /** Key [4] — money train pass intro clip. */
  playTrainSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.trainAudio) {
        this.trainAudio = new Audio(trainMp3);
        this.trainAudio.preload = 'auto';
      }
      this.trainAudio.volume = this.volume;
      this.trainAudio.loop = false;
      this.trainAudio.currentTime = 0;
      void this.trainAudio.play().catch((err) => console.warn('Train MP3 playback failed:', err));
    } catch (e) {
      console.warn('Train MP3 playback failed:', e);
    }
  }

  /** Key [0] — hacker clip during system hack sequence. */
  startHackerSound() {
    if (this.isMuted) return;
    this.stopHackerSound();
    try {
      this.initContext();
      if (!this.hackerAudio) {
        this.hackerAudio = new Audio(hackerMp3);
        this.hackerAudio.preload = 'auto';
      }
      this.hackerAudio.volume = this.volume;
      this.hackerAudio.loop = false;
      this.hackerAudio.currentTime = 0;
      void this.hackerAudio.play().catch((err) => console.warn('Hacker MP3 playback failed:', err));
    } catch (e) {
      console.warn('Hacker MP3 playback failed:', e);
    }
  }

  stopHackerSound() {
    if (!this.hackerAudio) return;
    this.hackerAudio.pause();
    this.hackerAudio.currentTime = 0;
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
