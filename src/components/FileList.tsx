'use client';

import { AudioFile } from '@/types';

interface FileListProps {
  files: AudioFile[];
  type: 'background' | 'voiceover';
  onDelete: (key: string) => void;
  currentPlayingIndex?: number;
}

export default function FileList({ files, type, onDelete, currentPlayingIndex }: FileListProps) {
  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      onDelete(key);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No files uploaded yet
        </div>
      ) : (
        files.map((file, index) => (
          <div
            key={file.key}
            className={`p-3 rounded-lg border transition-all duration-300 ${
              currentPlayingIndex === index
                ? type === 'background'
                  ? 'bg-blue-50 border-blue-400 shadow-md'
                  : 'bg-purple-50 border-purple-400 shadow-md'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {currentPlayingIndex === index && (
                    <div className="flex items-center gap-1">
                      {/* Animated sound bars */}
                      <div className="flex items-end gap-0.5 h-4">
                        <div className={`w-1 ${type === 'background' ? 'bg-blue-600' : 'bg-purple-600'} rounded-sm animate-sound-bar-1`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`w-1 ${type === 'background' ? 'bg-blue-600' : 'bg-purple-600'} rounded-sm animate-sound-bar-2`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`w-1 ${type === 'background' ? 'bg-blue-600' : 'bg-purple-600'} rounded-sm animate-sound-bar-3`} style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                  <p className={`text-sm font-medium truncate ${
                    currentPlayingIndex === index
                      ? type === 'background' ? 'text-blue-900' : 'text-purple-900'
                      : 'text-gray-900'
                  }`}>
                    {file.name}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(file.key)}
                className="ml-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete file"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      <style jsx>{`
        @keyframes soundBar1 {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        @keyframes soundBar2 {
          0%, 100% { height: 8px; }
          50% { height: 16px; }
        }
        @keyframes soundBar3 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
        }
        .animate-sound-bar-1 {
          animation: soundBar1 0.6s ease-in-out infinite;
        }
        .animate-sound-bar-2 {
          animation: soundBar2 0.6s ease-in-out infinite;
        }
        .animate-sound-bar-3 {
          animation: soundBar3 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
