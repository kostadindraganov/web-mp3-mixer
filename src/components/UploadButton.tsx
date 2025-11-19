'use client';

import { useRef, useState } from 'react';

interface UploadButtonProps {
  type: 'background' | 'voiceover';
  onUploadComplete: () => void;
}

export default function UploadButton({ type, onUploadComplete }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        onUploadComplete();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
        id={`upload-${type}`}
      />
      <label
        htmlFor={`upload-${type}`}
        className={`block w-full px-4 py-3 text-center rounded-lg font-semibold cursor-pointer transition-colors ${
          uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {uploading ? `Uploading... ${progress}%` : 'Upload MP3'}
      </label>
      {uploading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
