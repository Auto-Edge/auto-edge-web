
import { createBrowserRouter, Navigate } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import ConvertPage from '../pages/ConvertPage';
import ModelsPage from '../pages/ModelsPage';
import ModelDetailPage from '../pages/ModelDetailPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import SDKPage from '../pages/SDKPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/convert" replace />,
      },
      {
        path: 'convert',
        element: <ConvertPage />,
      },
      {
        path: 'models',
        element: <ModelsPage />,
      },
      {
        path: 'models/:modelId',
        element: <ModelDetailPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'sdk',
        element: <SDKPage />,
      },
    ],
  },
]);
