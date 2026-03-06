import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
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
