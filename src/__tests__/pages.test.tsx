import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { server } from './mocks/server';
import { renderWithProviders } from './testUtils';
import ModelsPage from '../pages/ModelsPage';
import AnalyticsPage from '../pages/AnalyticsPage';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ModelsPage', () => {
  it('renders model list from API', async () => {
    renderWithProviders(<ModelsPage />);

    await waitFor(() => {
      expect(screen.getByText('MobileNetV2')).toBeInTheDocument();
    });
  });

  it('shows create modal on button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ModelsPage />);

    await waitFor(() => {
      expect(screen.getByText('MobileNetV2')).toBeInTheDocument();
    });

    await user.click(screen.getByText('New Model'));
    expect(screen.getByText('Create New Model')).toBeInTheDocument();
  });

  it('shows empty state when no models', async () => {
    const { HttpResponse, http } = await import('msw');
    server.use(
      http.get('http://localhost:8000/api/v1/registry/models', () => {
        return HttpResponse.json({ models: [], total: 0 });
      }),
    );

    renderWithProviders(<ModelsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('No models yet. Create your first model to get started.'),
      ).toBeInTheDocument();
    });
  });
});

describe('AnalyticsPage', () => {
  it('renders dashboard stats from API', async () => {
    renderWithProviders(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Models')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    renderWithProviders(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Events by Type')).toBeInTheDocument();
      expect(screen.getByText('Device Distribution')).toBeInTheDocument();
    });
  });
});
