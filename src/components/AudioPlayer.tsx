'use client';

interface AudioPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  masterVolume: number;
  onVolumeChange: (volume: number) => void;
}

export default function AudioPlayer({
  isPlaying,
  onPlayPause,
  masterVolume,
  onVolumeChange,
}: AudioPlayerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-8">
      <div className="flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-white">MP3 Audio Mixer</h1>

        <div className="flex items-center space-x-6">
          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            className="w-20 h-20 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          >
            {isPlaying ? (
              <svg
                className="w-10 h-10 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-blue-600 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg px-6 py-3">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-32 h-2 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer volume-slider"
            />
            <span className="text-white font-medium w-12 text-right">
              {masterVolume}%
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-white text-sm">
          {isPlaying ? (
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Playing</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span>Stopped</span>
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
