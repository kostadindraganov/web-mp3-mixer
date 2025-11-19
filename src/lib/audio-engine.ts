import { AudioFile } from '@/types';

export class AudioMixerEngine {
  private audioContext: AudioContext | null = null;
  private backgroundSource: AudioBufferSourceNode | null = null;
  private voiceoverSource: AudioBufferSourceNode | null = null;
  private backgroundGain: GainNode | null = null;
  private voiceoverGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private backgroundBuffer: AudioBuffer | null = null;
  private voiceoverBuffer: AudioBuffer | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.backgroundGain = this.audioContext.createGain();
      this.voiceoverGain = this.audioContext.createGain();
      this.masterGain = this.audioContext.createGain();

      // Connect gain nodes
      this.backgroundGain.connect(this.masterGain);
      this.voiceoverGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // Set initial gains
      this.backgroundGain.gain.value = 0.5;
      this.voiceoverGain.gain.value = 0.5;
      this.masterGain.gain.value = 1.0;
    }
  }

  async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'default',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error loading audio from URL:', url, error);
      throw new Error(`Failed to load audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async playBackground(url: string, loop: boolean = true) {
    if (!this.audioContext || !this.backgroundGain) return;

    try {
      // Stop current background if playing
      this.stopBackground();

      this.backgroundBuffer = await this.loadAudio(url);
      this.backgroundSource = this.audioContext.createBufferSource();
      this.backgroundSource.buffer = this.backgroundBuffer;
      this.backgroundSource.loop = loop;
      this.backgroundSource.connect(this.backgroundGain);
      this.backgroundSource.start(0);
    } catch (error) {
      console.error('Error playing background audio:', error);
      // Don't throw - allow the app to continue
    }
  }

  async playVoiceover(url: string, onEnded?: () => void) {
    if (!this.audioContext || !this.voiceoverGain) return;

    try {
      // Stop current voiceover if playing
      this.stopVoiceover();

      this.voiceoverBuffer = await this.loadAudio(url);
      this.voiceoverSource = this.audioContext.createBufferSource();
      this.voiceoverSource.buffer = this.voiceoverBuffer;
      this.voiceoverSource.connect(this.voiceoverGain);

      if (onEnded) {
        this.voiceoverSource.onended = onEnded;
      }

      this.voiceoverSource.start(0);
    } catch (error) {
      console.error('Error playing voiceover audio:', error);
      // If loading failed, still call onEnded callback to continue the queue
      if (onEnded) {
        setTimeout(onEnded, 100);
      }
    }
  }

  stopBackground() {
    if (this.backgroundSource) {
      try {
        this.backgroundSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.backgroundSource = null;
    }
  }

  stopVoiceover() {
    if (this.voiceoverSource) {
      try {
        this.voiceoverSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.voiceoverSource = null;
    }
  }

  stopAll() {
    this.stopBackground();
    this.stopVoiceover();
  }

  setMixRatio(ratio: number) {
    // ratio: 0-100
    // 0 = all background (100% background, 0% voiceover)
    // 50 = equal mix (50% background, 50% voiceover)
    // 100 = all voiceover (0% background, 100% voiceover)

    if (!this.backgroundGain || !this.voiceoverGain) return;

    const backgroundVolume = (100 - ratio) / 100;
    const voiceoverVolume = ratio / 100;

    this.backgroundGain.gain.value = backgroundVolume;
    this.voiceoverGain.gain.value = voiceoverVolume;
  }

  setMasterVolume(volume: number) {
    // volume: 0-100
    if (!this.masterGain) return;
    this.masterGain.gain.value = volume / 100;
  }

  getContext() {
    return this.audioContext;
  }

  isPlaying(): boolean {
    return !!(this.backgroundSource || this.voiceoverSource);
  }

  isBackgroundPlaying(): boolean {
    return !!this.backgroundSource;
  }

  isVoiceoverPlaying(): boolean {
    return !!this.voiceoverSource;
  }

  destroy() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
