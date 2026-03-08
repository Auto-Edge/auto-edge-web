import React from 'react';

import StatsCard from '../components/analytics/StatsCard';
import DevicePieChart from '../components/analytics/DevicePieChart';
import MetricsChart from '../components/analytics/MetricsChart';
import { useDashboardSummary } from '../hooks/api/useAnalytics';

const AnalyticsPage: React.FC = () => {
  const { data: summary, isLoading, error, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="loading-center">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <p className="text-red-400 mb-4">{error instanceof Error ? error.message : 'Failed to load analytics'}</p>
        <button
          onClick={() => refetch()}
          className="btn btn-secondary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-description">
          Monitor your models, devices, and inference metrics.
        </p>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-2 grid-md-cols-4 gap-4 mb-8">
            <StatsCard
              label="Total Models"
              value={summary.total_models}
              icon={
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
            <StatsCard
              label="Total Versions"
              value={summary.total_versions}
              icon={
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />
            <StatsCard
              label="Total Devices"
              value={summary.total_devices}
              icon={
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatsCard
              label="Active (24h)"
              value={summary.active_devices_24h}
              icon={
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              highlight
            />
          </div>

          <div className="grid grid-cols-2 grid-md-cols-3 gap-4 mb-8">
            <StatsCard
              label="Total Inferences"
              value={summary.total_inferences.toLocaleString()}
              large
            />
            <StatsCard
              label="Total Downloads"
              value={summary.total_downloads.toLocaleString()}
              large
            />
            <StatsCard
              label="Event Types"
              value={Object.keys(summary.event_counts_by_type).length}
              large
            />
          </div>

          <div className="grid grid-cols-1 grid-lg-cols-2 gap-4">
            <div className="card">
              <h2 className="card-title">Events by Type</h2>
              <MetricsChart data={summary.event_counts_by_type} />
            </div>

            <div className="card">
              <h2 className="card-title">Device Distribution</h2>
              <DevicePieChart data={summary.device_type_distribution} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
