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
  const [voiceoverDelay, setVoiceoverDelay] = useState(60); // Delay in seconds before starting voiceover

  const audioEngineRef = useRef<AudioMixerEngine | null>(null);
  const backgroundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const voiceoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceoverDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to clear all timers
  const clearAllTimers = useCallback(() => {
    if (backgroundIntervalRef.current) {
      clearInterval(backgroundIntervalRef.current);
      backgroundIntervalRef.current = null;
    }
    if (voiceoverTimeoutRef.current) {
      clearTimeout(voiceoverTimeoutRef.current);
      voiceoverTimeoutRef.current = null;
    }
    if (voiceoverDelayTimeoutRef.current) {
      clearTimeout(voiceoverDelayTimeoutRef.current);
      voiceoverDelayTimeoutRef.current = null;
    }
  }, []);

  // Initialize audio engine
  useEffect(() => {
    audioEngineRef.current = new AudioMixerEngine();
    return () => {
      clearAllTimers();
      audioEngineRef.current?.destroy();
    };
  }, [clearAllTimers]);

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
        setVoiceoverPlayOrder(shuffleArray(Array.from(Array(voiceover.length).keys())));
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

    // Clear previous interval if exists
    if (backgroundIntervalRef.current) {
      clearInterval(backgroundIntervalRef.current);
    }

    // Set up listener for when background track ends
    backgroundIntervalRef.current = setInterval(() => {
      if (audioEngineRef.current && !audioEngineRef.current.isPlaying()) {
        if (backgroundIntervalRef.current) {
          clearInterval(backgroundIntervalRef.current);
          backgroundIntervalRef.current = null;
        }
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
        voiceoverTimeoutRef.current = setTimeout(() => playNextVoiceover(), 500);
      }
    });
  }, [voiceoverFiles, currentVoiceoverIndex, voiceoverPlayOrder, isPlaying]);

  const handlePlayPause = () => {
    if (!audioEngineRef.current) return;

    if (isPlaying) {
      // Stop playback
      clearAllTimers();
      audioEngineRef.current.stopAll();
      setIsPlaying(false);
    } else {
      // Start playback
      setIsPlaying(true);

      // Start background if available
      if (backgroundFiles.length > 0) {
        audioEngineRef.current.playBackground(backgroundFiles[currentBackgroundIndex].url, false);

        // Clear previous interval if exists
        if (backgroundIntervalRef.current) {
          clearInterval(backgroundIntervalRef.current);
        }

        // Set up auto-play for next background track
        backgroundIntervalRef.current = setInterval(() => {
          if (audioEngineRef.current && !audioEngineRef.current.isPlaying()) {
            if (backgroundIntervalRef.current) {
              clearInterval(backgroundIntervalRef.current);
              backgroundIntervalRef.current = null;
            }
            if (isPlaying) {
              playNextBackground();
            }
          }
        }, 1000);
      }

      // Start voiceover after delay if available
      if (voiceoverFiles.length > 0) {
        const delayMs = voiceoverDelay * 1000; // Convert seconds to milliseconds

        voiceoverDelayTimeoutRef.current = setTimeout(() => {
          if (!audioEngineRef.current || !isPlaying) return;

          audioEngineRef.current.playVoiceover(
            voiceoverFiles[voiceoverPlayOrder[0]].url,
            () => {
              if (isPlaying) {
                voiceoverTimeoutRef.current = setTimeout(() => playNextVoiceover(), 500);
              }
            }
          );
        }, delayMs);
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

            {/* Random Delay Input */}
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Start Delay (seconds)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={voiceoverDelay}
                  onChange={(e) => setVoiceoverDelay(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isPlaying}
                />
                <span className="text-sm text-purple-700 font-medium">{voiceoverDelay}s</span>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Voiceover will start {voiceoverDelay} seconds after pressing play
              </p>
            </div>

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
            <li>1. Upload MP3 files to Background Music (plays sequentially in loop) and Voice Over (plays sequentially in random order)</li>
            <li>2. Set the voiceover start delay (in seconds) to control when voiceover playback begins after pressing play</li>
            <li>3. Use the Mix Control slider to balance between background music and voice over</li>
            <li>4. Press the Play button to start mixing both audio streams - background music starts immediately, voiceover starts after the delay</li>
            <li>5. Watch the animated sound bars to see which file is currently playing in each column</li>
            <li>6. Press Stop to stop all playback in both columns</li>
            <li>7. Adjust master volume using the volume control in the audio player</li>
            <li>8. Delete files you no longer need using the Delete button</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
