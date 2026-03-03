import React from 'react';

interface PublishButtonProps {
  isPublished: boolean;
  onClick: () => void;
}

const PublishButton: React.FC<PublishButtonProps> = ({ isPublished, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
        isPublished
          ? 'bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50'
          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
      }`}
    >
      {isPublished ? 'Published' : 'Draft'}
    </button>
  );
};

export default PublishButton;
