import React from 'react';

interface AddJobButtonProps {
  onClick: () => void;
}

export const AddJobButton: React.FC<AddJobButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="add-job-btn"
    >
      <span>+ Add job</span>
    </button>
  );
};

export default AddJobButton;
