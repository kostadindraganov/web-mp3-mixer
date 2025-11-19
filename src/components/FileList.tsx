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
            className={`p-3 rounded-lg border transition-colors ${
              currentPlayingIndex === index
                ? 'bg-blue-50 border-blue-400'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {currentPlayingIndex === index && (
                    <span className="text-blue-600 text-sm">▶</span>
                  )}
                  <p className="text-sm font-medium text-gray-900 truncate">
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
    </div>
  );
}
