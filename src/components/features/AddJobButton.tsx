import React from 'react';

interface AddJobButtonProps {
  onClick: () => void;
}

export const AddJobButton: React.FC<AddJobButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="border border-dashed border-slate-700 rounded-lg p-4 flex items-center justify-center text-slate-500 hover:text-slate-400 hover:border-slate-600 transition-colors min-h-[180px]"
    >
      <span className="text-sm">+ Add job</span>
    </button>
  );
};

export default AddJobButton;
