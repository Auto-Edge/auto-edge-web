import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">AutoEdge</span>
          <span className="text-slate-500 text-sm">PyTorch → CoreML</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
