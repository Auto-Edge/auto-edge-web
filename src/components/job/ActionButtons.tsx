import React from 'react';

interface ActionButtonsProps {
  file?: File | null;
  isUploading?: boolean;
  isComplete?: boolean;
  onUpload?: () => void;
  onDemo?: () => void;
  onDownload?: () => void;
  onReset?: () => void;
  onRegister?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  file,
  isUploading = false,
  isComplete = false,
  onUpload,
  onDemo,
  onDownload,
  onReset,
  onRegister,
}) => {
  if (isComplete) {
    return (
      <div className="action-buttons-vertical">
        {onRegister && (
          <button
            onClick={onRegister}
            className="btn btn-primary btn-full btn-sm"
          >
            Register to Models
          </button>
        )}
        <button
          onClick={onDownload}
          className="btn btn-white btn-full btn-sm"
        >
          Download .mlmodel
        </button>
        <button
          onClick={onReset}
          className="btn btn-ghost btn-full btn-sm"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="action-buttons">
      <button
        onClick={onUpload}
        disabled={!file || isUploading}
        className="btn btn-white btn-flex-1 btn-sm"
      >
        {isUploading ? 'Uploading...' : 'Convert'}
      </button>
      <button
        onClick={onDemo}
        disabled={isUploading}
        className="btn btn-outline btn-sm"
      >
        Demo
      </button>
    </div>
  );
};

export default ActionButtons;
