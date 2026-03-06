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
      className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
    >
      <input
        type="file"
        accept=".pt,.pth"
        onChange={handleFileSelect}
      />

      {file ? (
        <div>
          <p className="file-name">{file.name}</p>
          <p className="file-size">{formatFileSize(file.size)}</p>
        </div>
      ) : (
        <div>
          <p className="file-drop-text">Drop .pt or .pth file here</p>
          <p className="file-drop-subtext">or click to browse</p>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
