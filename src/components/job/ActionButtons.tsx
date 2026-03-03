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
      <div className="space-y-2 mt-4">
        {onRegister && (
          <button
            onClick={onRegister}
            className="w-full py-2 px-3 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Register to Models
          </button>
        )}
        <button
          onClick={onDownload}
          className="w-full py-2 px-3 bg-white text-slate-900 font-medium rounded text-sm hover:bg-slate-200 transition-colors"
        >
          Download .mlmodel
        </button>
        <button
          onClick={onReset}
          className="w-full py-2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={onUpload}
        disabled={!file || isUploading}
        className="flex-1 py-2 px-3 bg-white text-slate-900 font-medium rounded text-sm
          hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? 'Uploading...' : 'Convert'}
      </button>
      <button
        onClick={onDemo}
        disabled={isUploading}
        className="py-2 px-3 border border-slate-700 text-slate-300 rounded text-sm
          hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Demo
      </button>
    </div>
  );
};

export default ActionButtons;
