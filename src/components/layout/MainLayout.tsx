import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>

        <footer className="border-t border-slate-800 px-8 py-4">
          <p className="text-xs text-slate-600">
            AutoEdge - Edge ML Deployment Platform
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
