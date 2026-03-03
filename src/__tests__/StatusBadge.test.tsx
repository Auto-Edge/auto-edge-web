/**
 * StatusBadge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/common/StatusBadge';

describe('StatusBadge', () => {
  it('renders nothing when status is null', () => {
    const { container } = render(<StatusBadge status={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Completed status correctly', () => {
    render(<StatusBadge status="Completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders Failed status correctly', () => {
    render(<StatusBadge status="Failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders Processing status correctly', () => {
    render(<StatusBadge status="Processing" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders Pending status correctly', () => {
    render(<StatusBadge status="Pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
