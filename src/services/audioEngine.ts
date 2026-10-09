import { Track } from '../types/music';

export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;

  private currentTrack: Track | null = null;
  private isPlaying = false;
  private volume = 0.8;
  private isMuted = false;
  private previousVolume = 0.8;
  private currentLoadId = 0;

  private timeUpdateCallbacks: Set<(currentTime: number, duration: number) => void> = new Set();
  private stateChangeCallbacks: Set<(isPlaying: boolean) => void> = new Set();
  private trackEndedCallbacks: Set<() => void> = new Set();
  private trackLoadedCallbacks: Set<(track: Track) => void> = new Set();
  private errorCallbacks: Set<(errorMessage: string) => void> = new Set();

  private frequencyBuffer: Uint8Array<ArrayBuffer> | null = null;
  private isInitialized = false;

  // Bound event listeners for proper cleanup
  private boundOnTimeUpdate: () => void;
  private boundOnPlay: () => void;
  private boundOnPause: () => void;
  private boundOnEnded: () => void;
  private boundOnLoadedMetadata: () => void;
  private boundOnDurationChange: () => void;
  private boundOnError: (e: Event) => void;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    this.boundOnTimeUpdate = () => {
      const current = this.audio.currentTime || 0;
      const duration = isFinite(this.audio.duration) && this.audio.duration > 0
        ? this.audio.duration
        : this.currentTrack?.duration || 0;

      this.timeUpdateCallbacks.forEach((cb) => cb(current, duration));
    };

    this.boundOnPlay = () => {
      this.isPlaying = true;
      this.stateChangeCallbacks.forEach((cb) => cb(true));
    };

    this.boundOnPause = () => {
      this.isPlaying = false;
      this.stateChangeCallbacks.forEach((cb) => cb(false));
    };

    this.boundOnEnded = () => {
      this.isPlaying = false;
      this.stateChangeCallbacks.forEach((cb) => cb(false));
      this.trackEndedCallbacks.forEach((cb) => cb());
    };

    this.boundOnLoadedMetadata = () => {
      const duration = isFinite(this.audio.duration) && this.audio.duration > 0
        ? this.audio.duration
        : this.currentTrack?.duration || 0;
      const current = this.audio.currentTime || 0;
      this.timeUpdateCallbacks.forEach((cb) => cb(current, duration));
    };

    this.boundOnDurationChange = () => {
      const duration = isFinite(this.audio.duration) && this.audio.duration > 0
        ? this.audio.duration
        : this.currentTrack?.duration || 0;
      const current = this.audio.currentTime || 0;
      this.timeUpdateCallbacks.forEach((cb) => cb(current, duration));
    };

    this.boundOnError = () => {
      let message = 'An audio playback error occurred.';
      if (this.audio.error) {
        switch (this.audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            message = 'Audio playback was aborted.';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            message = 'A network error occurred while loading the audio file.';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            message = 'Failed to decode audio file. Format may be corrupt or unsupported.';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = 'Audio format or MIME type is not supported by this browser.';
            break;
          default:
            message = this.audio.error.message || 'Unknown audio error.';
            break;
        }
      }
      this.isPlaying = false;
      this.stateChangeCallbacks.forEach((cb) => cb(false));
      this.errorCallbacks.forEach((cb) => cb(message));
    };

    this.setupAudioListeners();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private initAudioContext(): void {
    if (this.isInitialized && this.audioCtx) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64; // Produces 32 frequency bins, ideal for visualizer bars
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.frequencyBuffer = new Uint8Array(new ArrayBuffer(this.analyserNode.frequencyBinCount));
      this.isInitialized = true;
    } catch (e) {
      console.warn('Could not initialize Web Audio context or source node:', e);
    }
  }

  private setupAudioListeners(): void {
    this.audio.addEventListener('timeupdate', this.boundOnTimeUpdate);
    this.audio.addEventListener('play', this.boundOnPlay);
    this.audio.addEventListener('pause', this.boundOnPause);
    this.audio.addEventListener('ended', this.boundOnEnded);
    this.audio.addEventListener('loadedmetadata', this.boundOnLoadedMetadata);
    this.audio.addEventListener('durationchange', this.boundOnDurationChange);
    this.audio.addEventListener('error', this.boundOnError);
  }

  private removeAudioListeners(): void {
    this.audio.removeEventListener('timeupdate', this.boundOnTimeUpdate);
    this.audio.removeEventListener('play', this.boundOnPlay);
    this.audio.removeEventListener('pause', this.boundOnPause);
    this.audio.removeEventListener('ended', this.boundOnEnded);
    this.audio.removeEventListener('loadedmetadata', this.boundOnLoadedMetadata);
    this.audio.removeEventListener('durationchange', this.boundOnDurationChange);
    this.audio.removeEventListener('error', this.boundOnError);
  }

  /**
   * Loads a track and begins playback. Handles rapid track switching and promise rejections.
   */
  public async loadAndPlayTrack(track: Track): Promise<boolean> {
    const loadId = ++this.currentLoadId;

    if (!track.audioUrl) {
      const errMsg = `Cannot play "${track.title}": No audio source available.`;
      this.errorCallbacks.forEach((cb) => cb(errMsg));
      return false;
    }

    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // AudioContext resume failed, continue with standard audio element
      }
    }

    this.currentTrack = track;

    // Reset audio source
    try {
      this.audio.pause();
    } catch {
      // Ignore pause errors
    }

    this.audio.src = track.audioUrl;
    this.audio.load();

    try {
      await this.audio.play();

      // Check if this request was superseded while waiting for play()
      if (loadId !== this.currentLoadId) {
        return false;
      }

      this.isPlaying = true;
      this.trackLoadedCallbacks.forEach((cb) => cb(track));
      this.stateChangeCallbacks.forEach((cb) => cb(true));
      return true;
    } catch (err: unknown) {
      if (loadId !== this.currentLoadId) {
        // Superseded request, ignore rejection
        return false;
      }

      this.isPlaying = false;
      this.stateChangeCallbacks.forEach((cb) => cb(false));

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Play request was interrupted by a new request or pause; not a user-facing error
          return false;
        }
        if (err.name === 'NotAllowedError') {
          const msg = 'Playback was prevented by browser autoplay policy. Please click play to begin.';
          this.errorCallbacks.forEach((cb) => cb(msg));
          return false;
        }
      }

      const message = err instanceof Error ? err.message : 'Playback failed to start';
      this.errorCallbacks.forEach((cb) => cb(`Error playing "${track.title}": ${message}`));
      return false;
    }
  }

  /**
   * Resumes or starts playback of current audio.
   */
  public async play(): Promise<boolean> {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // Ignore
      }
    }

    if (!this.audio.src && this.currentTrack) {
      return this.loadAndPlayTrack(this.currentTrack);
    }

    if (!this.audio.src) {
      return false;
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.stateChangeCallbacks.forEach((cb) => cb(true));
      return true;
    } catch (err: unknown) {
      this.isPlaying = false;
      this.stateChangeCallbacks.forEach((cb) => cb(false));

      if (err instanceof Error && err.name === 'AbortError') {
        return false;
      }

      if (err instanceof Error && err.name === 'NotAllowedError') {
        const msg = 'Playback prevented by browser autoplay policy. Click play to interact.';
        this.errorCallbacks.forEach((cb) => cb(msg));
        return false;
      }

      const message = err instanceof Error ? err.message : 'Playback error';
      this.errorCallbacks.forEach((cb) => cb(message));
      return false;
    }
  }

  /**
   * Pauses the audio element.
   */
  public pause(): void {
    try {
      this.audio.pause();
    } catch {
      // Ignore
    }
    this.isPlaying = false;
    this.stateChangeCallbacks.forEach((cb) => cb(false));
  }

  /**
   * Toggles play/pause state.
   */
  public async togglePlay(): Promise<void> {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  /**
   * Seeks to specified position in seconds.
   */
  public seek(seconds: number): void {
    if (isFinite(seconds)) {
      const maxDuration = isFinite(this.audio.duration) && this.audio.duration > 0
        ? this.audio.duration
        : this.currentTrack?.duration || seconds;
      const targetTime = Math.max(0, Math.min(seconds, maxDuration));
      this.audio.currentTime = targetTime;
    }
  }

  /**
   * Sets volume level between 0 and 1.
   */
  public setVolume(val: number): void {
    const clamped = Math.max(0, Math.min(1, val));
    this.volume = clamped;
    this.audio.volume = clamped;

    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : clamped, this.audioCtx.currentTime);
    }

    if (clamped > 0 && this.isMuted) {
      this.isMuted = false;
      this.audio.muted = false;
    }
  }

  /**
   * Toggles mute state.
   */
  public toggleMute(): void {
    if (this.isMuted) {
      this.isMuted = false;
      this.audio.muted = false;
      const restoredVol = this.previousVolume > 0 ? this.previousVolume : 0.8;
      this.setVolume(restoredVol);
    } else {
      this.previousVolume = this.volume > 0 ? this.volume : 0.8;
      this.isMuted = true;
      this.audio.muted = true;
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      }
    }
  }

  public setAnalyserSmoothing(smoothing: number): void {
    if (this.analyserNode) {
      this.analyserNode.smoothingTimeConstant = Math.max(0, Math.min(0.95, smoothing));
    }
  }

  public setAnalyserFftSize(size: number): void {
    if (this.analyserNode) {
      this.analyserNode.fftSize = size;
      this.frequencyBuffer = new Uint8Array(new ArrayBuffer(this.analyserNode.frequencyBinCount));
    }
  }

  /**
   * Retrieves real frequency data from the AnalyserNode for visualizer bars.
   */
  public getFrequencyData(): Uint8Array | null {
    if (!this.analyserNode || !this.frequencyBuffer || !this.isPlaying) {
      return null;
    }
    this.analyserNode.getByteFrequencyData(this.frequencyBuffer);
    return this.frequencyBuffer;
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  public getDuration(): number {
    if (isFinite(this.audio.duration) && this.audio.duration > 0) {
      return this.audio.duration;
    }
    return this.currentTrack?.duration || 0;
  }

  // Event subscription helpers
  public onTimeUpdate(cb: (current: number, duration: number) => void): () => void {
    this.timeUpdateCallbacks.add(cb);
    return () => this.timeUpdateCallbacks.delete(cb);
  }

  public onStateChange(cb: (isPlaying: boolean) => void): () => void {
    this.stateChangeCallbacks.add(cb);
    return () => this.stateChangeCallbacks.delete(cb);
  }

  public onTrackEnded(cb: () => void): () => void {
    this.trackEndedCallbacks.add(cb);
    return () => this.trackEndedCallbacks.delete(cb);
  }

  public onTrackLoaded(cb: (track: Track) => void): () => void {
    this.trackLoadedCallbacks.add(cb);
    return () => this.trackLoadedCallbacks.delete(cb);
  }

  public onError(cb: (errorMessage: string) => void): () => void {
    this.errorCallbacks.add(cb);
    return () => this.errorCallbacks.delete(cb);
  }

  /**
   * Cleans up all listeners, stops audio, and closes audio context.
   */
  public dispose(): void {
    this.pause();
    this.removeAudioListeners();
    this.audio.src = '';
    this.currentTrack = null;

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // Ignore
      }
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect();
      } catch {
        // Ignore
      }
      this.analyserNode = null;
    }

    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // Ignore
      }
      this.gainNode = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }

    this.isInitialized = false;
  }
}
