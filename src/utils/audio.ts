/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import hackerMp3 from '../assets/sounds/hacker.mp3';
import jokerMp3 from '../assets/sounds/joker.mp3';
import wrongMp3 from '../assets/sounds/wrong.mp3';
import loseMp3 from '../assets/sounds/lose.mp3';
import trainMp3 from '../assets/sounds/train.mp3';
import winMp3 from '../assets/sounds/win.mp3';
import trumpMp3 from '../assets/sounds/trump.mp3';
import squidGameMp3 from '../assets/sounds/squid-game.mp3';
import gunshotMp3 from '../assets/sounds/gunhit.mp3';
import getCoinMp3 from '../assets/sounds/getcoin.mp3';
import tingMp3 from '../assets/sounds/ting.mp3';
import trumpetSadMp3 from '../assets/sounds/trumpetsad.mp3';
import trumpet2Mp3 from '../assets/sounds/trumpet2.mp3';
import addCoinWav from '../assets/sounds/ADD.wav';
import birdsFlyMp3 from '../assets/sounds/birdsfly.mp3';
import poopMp3 from '../assets/sounds/poop.mp3';
import knifeSliceMp3 from '../assets/sounds/freesound_community-knife-slice-41231.mp3';
import tickMp3 from '../assets/sounds/tick.mp3';
import tomatoMp3 from '../assets/sounds/tomato.mp3';
import missileMp3 from '../assets/sounds/missile.mp3';
import spinnerMp3 from '../assets/sounds/nhac-xo-so.mp3';
import levelUpMp3 from '../assets/sounds/levelup.mp3';
import comboMp3 from '../assets/sounds/combo.mp3';
import bombMp3 from '../assets/sounds/bomb.mp3';

export type HammerCoinSound = 'default' | 'tick';

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5; // default volume level (0.0 to 1.0)
  private hammerCoinSound: HammerCoinSound = 'default';
  private winAudio: HTMLAudioElement | null = null;
  private loseAudio: HTMLAudioElement | null = null;
  private trumpAudio: HTMLAudioElement | null = null;
  private squidAudio: HTMLAudioElement | null = null;
  private hackerAudio: HTMLAudioElement | null = null;
  private jokerAudio: HTMLAudioElement | null = null;
  private wrongAudio: HTMLAudioElement | null = null;
  private trainAudio: HTMLAudioElement | null = null;
  private gunshotAudio: HTMLAudioElement | null = null;
  private getCoinAudio: HTMLAudioElement | null = null;
  private tingAudio: HTMLAudioElement | null = null;
  private trumpetSadAudio: HTMLAudioElement | null = null;
  private trumpet2Audio: HTMLAudioElement | null = null;
  private addCoinAudio: HTMLAudioElement | null = null;
  private birdsFlyAudio: HTMLAudioElement | null = null;
  private activeBirdsFlyClip: HTMLAudioElement | null = null;
  private poopAudio: HTMLAudioElement | null = null;
  private knifeSliceAudio: HTMLAudioElement | null = null;
  private tickCoinAudio: HTMLAudioElement | null = null;
  private tomatoAudio: HTMLAudioElement | null = null;
  private missileAudio: HTMLAudioElement | null = null;
  private spinnerAudio: HTMLAudioElement | null = null;
  private activeSpinnerClip: HTMLAudioElement | null = null;
  private activePlinkoSpawnClip: HTMLAudioElement | null = null;
  private levelUpAudio: HTMLAudioElement | null = null;
  private comboAudio: HTMLAudioElement | null = null;
  private bombAudio: HTMLAudioElement | null = null;

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
    if (this.squidAudio) this.squidAudio.volume = this.volume;
    if (this.hackerAudio) this.hackerAudio.volume = this.volume;
    if (this.jokerAudio) this.jokerAudio.volume = this.volume;
    if (this.wrongAudio) this.wrongAudio.volume = this.volume;
    if (this.trainAudio) this.trainAudio.volume = this.volume;
    if (this.gunshotAudio) this.gunshotAudio.volume = this.volume;
    if (this.getCoinAudio) this.getCoinAudio.volume = this.volume;
    if (this.tingAudio) this.tingAudio.volume = this.volume;
    if (this.trumpetSadAudio) this.trumpetSadAudio.volume = this.volume;
    if (this.trumpet2Audio) this.trumpet2Audio.volume = this.volume;
    if (this.addCoinAudio) this.addCoinAudio.volume = this.volume;
    if (this.birdsFlyAudio) this.birdsFlyAudio.volume = this.volume;
    if (this.poopAudio) this.poopAudio.volume = this.volume;
    if (this.knifeSliceAudio) this.knifeSliceAudio.volume = this.volume;
    if (this.tickCoinAudio) this.tickCoinAudio.volume = this.volume;
    if (this.tomatoAudio) this.tomatoAudio.volume = this.volume;
    if (this.missileAudio) this.missileAudio.volume = this.volume;
    if (this.spinnerAudio) this.spinnerAudio.volume = this.volume;
    if (this.levelUpAudio) this.levelUpAudio.volume = this.volume;
    if (this.comboAudio) this.comboAudio.volume = this.volume;
    if (this.bombAudio) this.bombAudio.volume = this.volume;
  }

  getVolume() {
    return this.volume;
  }

  // Which clip plays for hammer hits / coin credit (see playAddCoin).
  setHammerCoinSound(sound: HammerCoinSound) {
    this.hammerCoinSound = sound;
  }

  getHammerCoinSound() {
    return this.hammerCoinSound;
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

  // Airy "whoosh" — a rising then falling band of noise, like something
  // being lobbed through the air. Used when a tomato (key [U]) is launched.
  playWhoosh() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const duration = 0.26;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(500, now);
      bp.frequency.exponentialRampToValueAtTime(1300, now + duration * 0.5);
      bp.frequency.exponentialRampToValueAtTime(400, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.3 * this.volume, now + duration * 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, now + duration);

      noise.connect(bp);
      bp.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {
      console.warn('Audio whoosh failed:', e);
    }
  }

  // Wet "splat" — a short filtered noise burst with a downward pitch smear,
  // like a tomato bursting against a wall. Used when a tomato (key [U]) is thrown.
  playSplat() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Noise burst = the wet spatter.
      const duration = 0.32;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        // Decaying random noise → the spatter tail fizzles out.
        const decay = 1 - i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * decay * decay;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1600, now);
      lp.frequency.exponentialRampToValueAtTime(220, now + duration);
      lp.Q.value = 0.8;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, now + duration);

      noise.connect(lp);
      lp.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // Low "splot" thud body underneath the spatter.
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(190, now);
      thud.frequency.exponentialRampToValueAtTime(70, now + 0.16);
      thudGain.gain.setValueAtTime(0.35 * this.volume, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, now + 0.18);
      thud.connect(thudGain);
      thudGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
      thud.start(now);
      thud.stop(now + 0.18);
    } catch (e) {
      console.warn('Audio splat failed:', e);
    }
  }

  private playMp3(src: string, cache: 'win' | 'lose' | 'trump' | 'squid') {
    if (this.isMuted) return;
    try {
      this.initContext();
      let audio =
        cache === 'win'
          ? this.winAudio
          : cache === 'lose'
            ? this.loseAudio
            : cache === 'trump'
              ? this.trumpAudio
              : this.squidAudio;
      if (!audio) {
        audio = new Audio(src);
        audio.preload = 'auto';
        if (cache === 'win') this.winAudio = audio;
        else if (cache === 'lose') this.loseAudio = audio;
        else if (cache === 'trump') this.trumpAudio = audio;
        else this.squidAudio = audio;
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

  /** Key [P] — Squid Game piggy bank sound effect when the pig bank spawns. */
  playSquidGame() {
    this.playMp3(squidGameMp3, 'squid');
  }

  /** Cut the Squid Game clip when the pig bank action ends so it doesn't linger. */
  stopSquidGame() {
    if (!this.squidAudio) return;
    this.squidAudio.pause();
    this.squidAudio.currentTime = 0;
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

  // Key [1] — bomb clip played the moment the bomb detonates.
  playBomb() {
    if (this.isMuted) return;
    try {
      if (!this.bombAudio) {
        this.bombAudio = new Audio(bombMp3);
        this.bombAudio.preload = 'auto';
        this.bombAudio.volume = this.volume;
      }
      // Clone so rapid-fire spawns don't cut each other off.
      const clip = this.bombAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      void clip.play().catch((err) => console.warn('Audio bomb failed:', err));
    } catch (e) {
      console.warn('Audio bomb failed:', e);
    }
  }

  // Gun crack — short bang when firing (pằng), using the recorded gunshot clip.
  playGunShot() {
    if (this.isMuted) return;
    try {
      if (!this.gunshotAudio) {
        this.gunshotAudio = new Audio(gunshotMp3);
        this.gunshotAudio.preload = 'auto';
        this.gunshotAudio.volume = this.volume;
      }
      // Clone so overlapping/rapid-fire shots don't cut each other off.
      const shot = this.gunshotAudio.cloneNode(true) as HTMLAudioElement;
      shot.volume = this.volume;
      void shot.play().catch((err) => console.warn('Audio gun shot failed:', err));
    } catch (e) {
      console.warn('Audio gun shot failed:', e);
    }
  }

  // Coin reward chime — played when money is credited (e.g. gold nugget slam).
  playGetCoin() {
    if (this.isMuted) return;
    try {
      if (!this.getCoinAudio) {
        this.getCoinAudio = new Audio(getCoinMp3);
        this.getCoinAudio.preload = 'auto';
        this.getCoinAudio.volume = this.volume;
      }
      const coin = this.getCoinAudio.cloneNode(true) as HTMLAudioElement;
      coin.volume = this.volume;
      void coin.play().catch((err) => console.warn('Audio get coin failed:', err));
    } catch (e) {
      console.warn('Audio get coin failed:', e);
    }
  }

  // Tiếng cộng tiền khi búa gõ trúng nhà (ADD.wav, or the "tick" clip if selected in settings).
  playAddCoin() {
    if (this.isMuted) return;
    try {
      if (this.hammerCoinSound === 'tick') {
        if (!this.tickCoinAudio) {
          this.tickCoinAudio = new Audio(tickMp3);
          this.tickCoinAudio.preload = 'auto';
          this.tickCoinAudio.volume = this.volume;
        }
        const tick = this.tickCoinAudio.cloneNode(true) as HTMLAudioElement;
        tick.volume = this.volume;
        void tick.play().catch((err) => console.warn('Audio tick coin failed:', err));
        return;
      }
      if (!this.addCoinAudio) {
        this.addCoinAudio = new Audio(addCoinWav);
        this.addCoinAudio.preload = 'auto';
        this.addCoinAudio.volume = this.volume;
      }
      // Clone so rapid hammer taps don't cut each other off.
      const clip = this.addCoinAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      void clip.play().catch((err) => console.warn('Audio add coin failed:', err));
    } catch (e) {
      console.warn('Audio add coin failed:', e);
    }
  }

  // Combo / mega-combo bonus sting (hammer only) — always combo.mp3,
  // regardless of the "tick" hammer-hit sound setting. `big` (mega-combo)
  // plays a touch louder and lower-pitched so it stands out from the
  // regular combo.
  playComboBonus(big: boolean = false) {
    if (this.isMuted) return;
    try {
      if (!this.comboAudio) {
        this.comboAudio = new Audio(comboMp3);
        this.comboAudio.preload = 'auto';
        this.comboAudio.volume = this.volume;
      }
      const clip = this.comboAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = Math.min(1, this.volume * (big ? 1.15 : 1));
      clip.playbackRate = big ? 0.85 : 1.08;
      void clip.play().catch((err) => console.warn('Audio combo bonus failed:', err));
    } catch (e) {
      console.warn('Audio combo bonus failed:', e);
    }
  }

  // Estate level up (see LevelUpTransition) — plays on level increase only,
  // not on level down.
  playLevelUp() {
    if (this.isMuted) return;
    try {
      if (!this.levelUpAudio) {
        this.levelUpAudio = new Audio(levelUpMp3);
        this.levelUpAudio.preload = 'auto';
        this.levelUpAudio.volume = this.volume;
      }
      const clip = this.levelUpAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      void clip.play().catch((err) => console.warn('Audio level up failed:', err));
    } catch (e) {
      console.warn('Audio level up failed:', e);
    }
  }

  // Wings flapping — played when a bird flock wave spawns, stopped when the
  // flock leaves the screen (see stopBirdsFly).
  playBirdsFly() {if (this.isMuted) return;
    try {
      this.stopBirdsFly();
      if (!this.birdsFlyAudio) {
        this.birdsFlyAudio = new Audio(birdsFlyMp3);
        this.birdsFlyAudio.preload = 'auto';
        this.birdsFlyAudio.volume = this.volume;
      }
      const clip = this.birdsFlyAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      this.activeBirdsFlyClip = clip;
      void clip.play().catch((err) => console.warn('Audio birds fly failed:', err));
    } catch (e) {
      console.warn('Audio birds fly failed:', e);
    }
  }

  /** Cut the birds-fly clip short once the flock has left the screen. */
  stopBirdsFly() {
    if (!this.activeBirdsFlyClip) return;
    this.activeBirdsFlyClip.pause();
    this.activeBirdsFlyClip.currentTime = 0;
    this.activeBirdsFlyClip = null;
  }

  // Splat — played when a bird drops poop.
  playPoop() {
    if (this.isMuted) return;
    try {
      if (!this.poopAudio) {
        this.poopAudio = new Audio(poopMp3);
        this.poopAudio.preload = 'auto';
        this.poopAudio.volume = this.volume;
      }
      const clip = this.poopAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      void clip.play().catch((err) => console.warn('Audio poop failed:', err));
    } catch (e) {
      console.warn('Audio poop failed:', e);
    }
  }

  // Tomato toss — played the moment a veggie projectile appears (key [U]).
  playTomato() {
    if (this.isMuted) return;
    try {
      if (!this.tomatoAudio) {
        this.tomatoAudio = new Audio(tomatoMp3);
        this.tomatoAudio.preload = 'auto';
        this.tomatoAudio.volume = this.volume;
      }
      // Clone so rapid-fire spawns don't cut each other off.
      const clip = this.tomatoAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      void clip.play().catch((err) => console.warn('Audio tomato failed:', err));
    } catch (e) {
      console.warn('Audio tomato failed:', e);
    }
  }

  // Missile whistle + boom clip (key [I]) — the boom in the clip peaks at
  // ~1.38s (MISSILE_SOUND_BOOM_MS); callers schedule playback so that peak
  // lands exactly when the rocket hits the estate.
  playMissileLaunch() {
    if (this.isMuted) return;
    try {
      if (!this.missileAudio) {
        this.missileAudio = new Audio(missileMp3);
        this.missileAudio.preload = 'auto';
        this.missileAudio.volume = this.volume;
      }
      // Clone so rapid volleys don't cut each other off.
      const clip = this.missileAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      void clip.play().catch((err) => console.warn('Audio missile failed:', err));
    } catch (e) {
      console.warn('Audio missile failed:', e);
    }
  }

  // Trumpet fanfare — played when the money spinner wheel spawns (key [5]);
  // stopped explicitly via stopSpinnerStart once the round ends.
  playSpinnerStart() {
    if (this.isMuted) return;
    try {
      this.stopSpinnerStart();
      if (!this.trumpet2Audio) {
        this.trumpet2Audio = new Audio(trumpet2Mp3);
        this.trumpet2Audio.preload = 'auto';
        this.trumpet2Audio.volume = this.volume;
      }
      const clip = this.trumpet2Audio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      this.activeSpinnerClip = clip;
      void clip.play().catch((err) => console.warn('Audio spinner failed:', err));
    } catch (e) {
      console.warn('Audio spinner failed:', e);
    }
  }

  /** Cut the spinner fanfare short once the wheel round has ended. */
  stopSpinnerStart() {
    if (!this.activeSpinnerClip) return;
    this.activeSpinnerClip.pause();
    this.activeSpinnerClip.currentTime = 0;
    this.activeSpinnerClip = null;
  }

  // Blade thunk — played when a dropped knife plants into the ground (key [8]).
  playKnifeSlice() {
    if (this.isMuted) return;
    try {
      if (!this.knifeSliceAudio) {
        this.knifeSliceAudio = new Audio(knifeSliceMp3);
        this.knifeSliceAudio.preload = 'auto';
        this.knifeSliceAudio.volume = this.volume;
      }
      const clip = this.knifeSliceAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      void clip.play().catch((err) => console.warn('Audio knife slice failed:', err));
    } catch (e) {
      console.warn('Audio knife slice failed:', e);
    }
  }

  // Ting cue — played for win/score delta actions (e.g. actionId 14, "- Win").
  playTing() {
    if (this.isMuted) return;
    try {
      if (!this.tingAudio) {
        this.tingAudio = new Audio(tingMp3);
        this.tingAudio.preload = 'auto';
        this.tingAudio.volume = this.volume;
      }
      const ting = this.tingAudio.cloneNode(true) as HTMLAudioElement;
      ting.volume = this.volume;
      void ting.play().catch((err) => console.warn('Audio ting failed:', err));
    } catch (e) {
      console.warn('Audio ting failed:', e);
    }
  }

  // Sad trumpet cue — played for actionId 14 ("- Win").
  playTrumpetSad() {
    if (this.isMuted) return;
    try {
      if (!this.trumpetSadAudio) {
        this.trumpetSadAudio = new Audio(trumpetSadMp3);
        this.trumpetSadAudio.preload = 'auto';
        this.trumpetSadAudio.volume = this.volume;
      }
      const clip = this.trumpetSadAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      void clip.play().catch((err) => console.warn('Audio trumpet sad failed:', err));
    } catch (e) {
      console.warn('Audio trumpet sad failed:', e);
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

  // Key [3] — Joker clip for the grappling hook heist launch.
  playGrappleLaunch() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.jokerAudio) {
        this.jokerAudio = new Audio(jokerMp3);
        this.jokerAudio.preload = 'auto';
      }
      this.jokerAudio.volume = this.volume;
      this.jokerAudio.loop = false;
      this.jokerAudio.currentTime = 0;
      void this.jokerAudio.play().catch((err) => console.warn('Joker MP3 playback failed:', err));
    } catch (e) {
      console.warn('Joker MP3 playback failed:', e);
    }
  }

  // Key [3] — "wrong" buzzer when the heist docks the balance.
  playWrongSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.wrongAudio) {
        this.wrongAudio = new Audio(wrongMp3);
        this.wrongAudio.preload = 'auto';
      }
      this.wrongAudio.volume = this.volume;
      this.wrongAudio.loop = false;
      this.wrongAudio.currentTime = 0;
      void this.wrongAudio.play().catch((err) => console.warn('Wrong MP3 playback failed:', err));
    } catch (e) {
      console.warn('Wrong MP3 playback failed:', e);
    }
  }

  // Crisp cash register clink sound for grappling hook grab
  playCashGrab() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;

      // Two high-pitched bell tones for the "cha-ching" clink
      const playClink = (freq: number, delay: number, dur: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);
        
        gain.gain.setValueAtTime(0, t + delay);
        gain.gain.linearRampToValueAtTime(vol * this.volume, t + delay + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + delay + dur);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + dur + 0.02);
      };

      // Cha-ching: first chime then a slightly higher second chime
      playClink(1800, 0, 0.12, 0.16);
      playClink(2400, 0.05, 0.18, 0.14);

      // A quick mechanical spring/register noise slide
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t + 0.02);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.18);
      filter.Q.setValueAtTime(2.0, t + 0.02);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t + 0.02);
      gain.gain.linearRampToValueAtTime(0.08 * this.volume, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t + 0.02);
      noise.stop(t + 0.22);
    } catch (e) {
      console.warn('Audio cash grab failed:', e);
    }
  }

  // Slot-machine jingle when Plinko modal spawns (actionId 3); stopped
  // explicitly via stopPlinkoSpawn once the round ends since the clip runs
  // longer than a single round.
  playPlinkoSpawn() {
    if (this.isMuted) return;
    try {
      this.stopPlinkoSpawn();
      if (!this.spinnerAudio) {
        this.spinnerAudio = new Audio(spinnerMp3);
        this.spinnerAudio.preload = 'auto';
        this.spinnerAudio.volume = this.volume;
      }
      const clip = this.spinnerAudio.cloneNode(true) as HTMLAudioElement;
      clip.volume = this.volume;
      this.activePlinkoSpawnClip = clip;
      void clip.play().catch((err) => console.warn('Audio plinko spawn failed:', err));
    } catch (e) {
      console.warn('Audio plinko spawn failed:', e);
    }
  }

  /** Cut the Plinko spawn jingle short once the round has ended. */
  stopPlinkoSpawn() {
    if (!this.activePlinkoSpawnClip) return;
    this.activePlinkoSpawnClip.pause();
    this.activePlinkoSpawnClip.currentTime = 0;
    this.activePlinkoSpawnClip = null;
  }

  // Synthesized cheering & clapping/applause sound for Plinko landing/completion
  playPlinkoCheer() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;

      // Crowd cheer (white noise sweep)
      const cheerDuration = 1.8;
      const cheerSz = Math.floor(ctx.sampleRate * cheerDuration);
      const cheerBuf = ctx.createBuffer(1, cheerSz, ctx.sampleRate);
      const cheerData = cheerBuf.getChannelData(0);
      for (let i = 0; i < cheerSz; i++) {
        cheerData[i] = Math.random() * 2 - 1;
      }
      
      const cheerSrc = ctx.createBufferSource();
      cheerSrc.buffer = cheerBuf;
      
      const cheerFilter = ctx.createBiquadFilter();
      cheerFilter.type = 'bandpass';
      cheerFilter.frequency.setValueAtTime(1000, t);
      cheerFilter.frequency.exponentialRampToValueAtTime(1400, t + 0.5);
      cheerFilter.frequency.exponentialRampToValueAtTime(800, t + cheerDuration);
      cheerFilter.Q.setValueAtTime(1.2, t);

      const cheerGain = ctx.createGain();
      cheerGain.gain.setValueAtTime(0, t);
      cheerGain.gain.linearRampToValueAtTime(0.18 * this.volume, t + 0.3);
      cheerGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + cheerDuration);

      cheerSrc.connect(cheerFilter);
      cheerFilter.connect(cheerGain);
      cheerGain.connect(ctx.destination);
      
      cheerSrc.start(t);
      cheerSrc.stop(t + cheerDuration);

      // Clapping hands
      const clapCount = 18;
      for (let i = 0; i < clapCount; i++) {
        const clapDelay = 0.1 + i * 0.08 + Math.random() * 0.04;
        const clapDuration = 0.06;
        const clapSz = Math.floor(ctx.sampleRate * clapDuration);
        const clapBuf = ctx.createBuffer(1, clapSz, ctx.sampleRate);
        const clapData = clapBuf.getChannelData(0);
        for (let j = 0; j < clapSz; j++) {
          clapData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (clapSz * 0.25));
        }

        const clapSrc = ctx.createBufferSource();
        clapSrc.buffer = clapBuf;

        const clapFilter = ctx.createBiquadFilter();
        clapFilter.type = 'bandpass';
        clapFilter.frequency.setValueAtTime(1100 + Math.random() * 400, t + clapDelay);
        clapFilter.Q.setValueAtTime(2.0, t + clapDelay);

        const clapGain = ctx.createGain();
        clapGain.gain.setValueAtTime(0, t + clapDelay);
        clapGain.gain.linearRampToValueAtTime(0.12 * this.volume, t + clapDelay + 0.003);
        clapGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + clapDelay + clapDuration);

        clapSrc.connect(clapFilter);
        clapFilter.connect(clapGain);
        clapGain.connect(ctx.destination);

        clapSrc.start(t + clapDelay);
        clapSrc.stop(t + clapDelay + clapDuration + 0.01);
      }

      // High-pitched winning melody chime (triumph fanfare)
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const noteDur = 0.15;
      notes.forEach((freq, idx) => {
        const noteStart = t + idx * 0.1;
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);
        
        oscGain.gain.setValueAtTime(0, noteStart);
        oscGain.gain.linearRampToValueAtTime(0.1 * this.volume, noteStart + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.001 * this.volume, noteStart + noteDur);
        
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + noteDur + 0.02);
      });
    } catch (e) {
      console.warn('Audio plinko cheer failed:', e);
    }
  }

  // Cute high-pitched bounce sound when plinko ball hits a peg
  playPlinkoBounce() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // High pitch drop
      const startFreq = 1600 + Math.random() * 400;
      const endFreq = 900 + Math.random() * 200;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.05);

      gain.gain.setValueAtTime(0.08 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, t + 0.06);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch (e) {
      console.warn('Audio plinko bounce failed:', e);
    }
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
