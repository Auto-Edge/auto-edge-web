import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />
      <Sidebar />

      <div className="main-content-wrapper">
        <main className="main-content">
          <Outlet />
        </main>

        <footer className="layout-footer">
          <p className="layout-footer-text">
            AutoEdge - Edge ML Deployment Platform
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
