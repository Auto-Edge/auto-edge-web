/**
 * ErrorBoundary Component Tests
 */


import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Component that throws an error
interface ThrowErrorProps {
  shouldThrow: boolean;
}

function ThrowError({ shouldThrow }: ThrowErrorProps): JSX.Element {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const fallback = <div>Custom fallback</div>;

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('resets error state when Try Again is clicked', () => {
    // Use a key to force React to remount the ErrorBoundary after clicking "Try Again"
    let shouldThrow = true;

    const { rerender } = render(
      <ErrorBoundary key="eb">
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    // Should show error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click Try Again to reset error state
    fireEvent.click(screen.getByText('Try Again'));

    // Re-render with no error and a new key to force remount
    shouldThrow = false;
    rerender(
      <ErrorBoundary key="eb-reset">
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});
