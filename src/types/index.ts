export interface AudioFile {
  key: string;
  name: string;
  url: string;
  size: number;
  lastModified: Date;
  type: 'background' | 'voiceover';
}

export interface PlaybackState {
  isPlaying: boolean;
  currentBackgroundIndex: number;
  currentVoiceoverIndex: number;
  mixRatio: number; // 0-100, where 0 = all background, 100 = all voiceover
  masterVolume: number; // 0-100
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  type: 'background' | 'voiceover';
}
