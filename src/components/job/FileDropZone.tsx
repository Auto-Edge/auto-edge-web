import React, { useCallback, useState, DragEvent, ChangeEvent } from 'react';
import { validateFile, formatFileSize } from '../../utils/fileValidation';

interface FileDropZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onError: (error: string | null) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  file,
  onFileSelect,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    const validation = validateFile(droppedFile);

    if (validation.valid) {
      onFileSelect(droppedFile);
      onError(null);
    } else {
      onError(validation.error);
    }
  }, [onFileSelect, onError]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (validation.valid) {
        onFileSelect(selectedFile);
        onError(null);
      } else {
        onError(validation.error);
      }
    }
  }, [onFileSelect, onError]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border border-dashed rounded-lg p-6 text-center cursor-pointer mb-4 transition-colors
        ${isDragging ? 'border-slate-400 bg-slate-800/50' : 'border-slate-700 hover:border-slate-600'}
      `}
    >
      <input
        type="file"
        accept=".pt,.pth"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {file ? (
        <div>
          <p className="text-white text-sm">{file.name}</p>
          <p className="text-slate-500 text-xs mt-1">{formatFileSize(file.size)}</p>
        </div>
      ) : (
        <div>
          <p className="text-slate-400 text-sm">Drop .pt or .pth file here</p>
          <p className="text-slate-600 text-xs mt-1">or click to browse</p>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
