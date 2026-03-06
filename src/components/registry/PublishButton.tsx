import React from 'react';

interface PublishButtonProps {
  isPublished: boolean;
  onClick: () => void;
}

const PublishButton: React.FC<PublishButtonProps> = ({ isPublished, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`publish-btn ${
        isPublished ? 'publish-btn-published' : 'publish-btn-draft'
      }`}
    >
      {isPublished ? 'Published' : 'Draft'}
    </button>
  );
};

export default PublishButton;
