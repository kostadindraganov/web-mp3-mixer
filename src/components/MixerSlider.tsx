'use client';

interface MixerSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function MixerSlider({ value, onChange }: MixerSliderProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-2 flex justify-between text-sm font-medium">
        <span className="text-blue-600">Background Music</span>
        <span className="text-purple-600">Voice Over</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="mt-2 text-center text-sm text-gray-600">
          Background: {100 - value}% | Voice Over: {value}%
        </div>
      </div>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
