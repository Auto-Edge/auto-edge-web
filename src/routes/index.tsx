
import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import RouteError from '../components/common/RouteError';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ConvertPage = lazy(() => import('../pages/ConvertPage'));
const ModelsPage = lazy(() => import('../pages/ModelsPage'));
const ModelDetailPage = lazy(() => import('../pages/ModelDetailPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const SDKPage = lazy(() => import('../pages/SDKPage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="loading-center">
          <LoadingSpinner className="spinner-lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <Navigate to="/convert" replace />,
      },
      {
        path: 'convert',
        element: <SuspenseWrapper><ConvertPage /></SuspenseWrapper>,
      },
      {
        path: 'models',
        element: <SuspenseWrapper><ModelsPage /></SuspenseWrapper>,
      },
      {
        path: 'models/:modelId',
        element: <SuspenseWrapper><ModelDetailPage /></SuspenseWrapper>,
      },
      {
        path: 'analytics',
        element: <SuspenseWrapper><AnalyticsPage /></SuspenseWrapper>,
      },
      {
        path: 'sdk',
        element: <SuspenseWrapper><SDKPage /></SuspenseWrapper>,
      },
    ],
  },
]);
