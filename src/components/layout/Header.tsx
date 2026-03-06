import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <span className="header-title">AutoEdge</span>
          <span className="header-tagline">PyTorch → CoreML</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
