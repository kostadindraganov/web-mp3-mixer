'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import AudioPlayer from '@/components/AudioPlayer';
import FileList from '@/components/FileList';
import MixerSlider from '@/components/MixerSlider';
import UploadButton from '@/components/UploadButton';
import { AudioFile } from '@/types';
import { AudioMixerEngine } from '@/lib/audio-engine';

export default function Home() {
  const [backgroundFiles, setBackgroundFiles] = useState<AudioFile[]>([]);
  const [voiceoverFiles, setVoiceoverFiles] = useState<AudioFile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mixRatio, setMixRatio] = useState(50); // 0-100
  const [masterVolume, setMasterVolume] = useState(80);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [currentVoiceoverIndex, setCurrentVoiceoverIndex] = useState(0);
  const [voiceoverPlayOrder, setVoiceoverPlayOrder] = useState<number[]>([]);

  const audioEngineRef = useRef<AudioMixerEngine | null>(null);

  // Initialize audio engine
  useEffect(() => {
    audioEngineRef.current = new AudioMixerEngine();
    return () => {
      audioEngineRef.current?.destroy();
    };
  }, []);

  // Fetch files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();

      // Check if the response was successful and has files
      if (!response.ok || !data.files) {
        console.error('Failed to fetch files:', data.error || 'Unknown error');
        return;
      }

      const background = data.files.filter((f: AudioFile) => f.type === 'background');
      const voiceover = data.files.filter((f: AudioFile) => f.type === 'voiceover');

      setBackgroundFiles(background);
      setVoiceoverFiles(voiceover);

      // Initialize random play order for voiceovers
      if (voiceover.length > 0) {
        setVoiceoverPlayOrder(shuffleArray([...Array(voiceover.length).keys()]));
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playNextBackground = useCallback(() => {
    if (backgroundFiles.length === 0 || !audioEngineRef.current) return;

    const nextIndex = (currentBackgroundIndex + 1) % backgroundFiles.length;
    setCurrentBackgroundIndex(nextIndex);

    audioEngineRef.current.playBackground(backgroundFiles[nextIndex].url, false);

    // Set up listener for when background track ends
    const checkEnded = setInterval(() => {
      if (audioEngineRef.current && !audioEngineRef.current.isPlaying()) {
        clearInterval(checkEnded);
        if (isPlaying) {
          playNextBackground();
        }
      }
    }, 1000);
  }, [backgroundFiles, currentBackgroundIndex, isPlaying]);

  const playNextVoiceover = useCallback(() => {
    if (voiceoverFiles.length === 0 || !audioEngineRef.current) return;

    const currentOrderIndex = voiceoverPlayOrder.findIndex(
      (index) => index === currentVoiceoverIndex
    );
    const nextOrderIndex = (currentOrderIndex + 1) % voiceoverPlayOrder.length;
    const nextFileIndex = voiceoverPlayOrder[nextOrderIndex];

    setCurrentVoiceoverIndex(nextFileIndex);

    audioEngineRef.current.playVoiceover(voiceoverFiles[nextFileIndex].url, () => {
      if (isPlaying) {
        setTimeout(() => playNextVoiceover(), 500);
      }
    });
  }, [voiceoverFiles, currentVoiceoverIndex, voiceoverPlayOrder, isPlaying]);

  const handlePlayPause = () => {
    if (!audioEngineRef.current) return;

    if (isPlaying) {
      // Stop playback
      audioEngineRef.current.stopAll();
      setIsPlaying(false);
    } else {
      // Start playback
      setIsPlaying(true);

      // Start background if available
      if (backgroundFiles.length > 0) {
        audioEngineRef.current.playBackground(backgroundFiles[currentBackgroundIndex].url, false);

        // Set up auto-play for next background track
        const checkEnded = setInterval(() => {
          if (audioEngineRef.current && !audioEngineRef.current.isPlaying()) {
            clearInterval(checkEnded);
            if (isPlaying) {
              playNextBackground();
            }
          }
        }, 1000);
      }

      // Start voiceover if available
      if (voiceoverFiles.length > 0) {
        audioEngineRef.current.playVoiceover(
          voiceoverFiles[voiceoverPlayOrder[0]].url,
          () => {
            setTimeout(() => playNextVoiceover(), 500);
          }
        );
      }
    }
  };

  const handleMixRatioChange = (ratio: number) => {
    setMixRatio(ratio);
    audioEngineRef.current?.setMixRatio(ratio);
  };

  const handleVolumeChange = (volume: number) => {
    setMasterVolume(volume);
    audioEngineRef.current?.setMasterVolume(volume);
  };

  const handleDeleteFile = (key: string) => {
    setBackgroundFiles((prev) => prev.filter((f) => f.key !== key));
    setVoiceoverFiles((prev) => prev.filter((f) => f.key !== key));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Audio Player */}
        <AudioPlayer
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          masterVolume={masterVolume}
          onVolumeChange={handleVolumeChange}
        />

        {/* Mixer Slider */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Audio Mix Control
          </h2>
          <MixerSlider value={mixRatio} onChange={handleMixRatioChange} />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Background Music Column */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-600">
                Background Music
              </h2>
              <span className="text-sm text-gray-500">
                {backgroundFiles.length} files
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Plays continuously in loop
            </p>
            <FileList
              files={backgroundFiles}
              type="background"
              onDelete={handleDeleteFile}
              currentPlayingIndex={isPlaying ? currentBackgroundIndex : undefined}
            />
            <div className="mt-4">
              <UploadButton type="background" onUploadComplete={fetchFiles} />
            </div>
          </div>

          {/* Voice Over Column */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-600">Voice Over</h2>
              <span className="text-sm text-gray-500">
                {voiceoverFiles.length} files
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Plays one by one in random order
            </p>
            <FileList
              files={voiceoverFiles}
              type="voiceover"
              onDelete={handleDeleteFile}
              currentPlayingIndex={isPlaying ? currentVoiceoverIndex : undefined}
            />
            <div className="mt-4">
              <UploadButton type="voiceover" onUploadComplete={fetchFiles} />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">How to Use</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>1. Upload MP3 files to Background Music (plays in loop) and Voice Over (plays in random order)</li>
            <li>2. Use the Mix Control slider to balance between background music and voice over</li>
            <li>3. Press the Play button to start mixing both audio streams</li>
            <li>4. Adjust master volume using the volume control in the audio player</li>
            <li>5. Delete files you no longer need using the Delete button</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
