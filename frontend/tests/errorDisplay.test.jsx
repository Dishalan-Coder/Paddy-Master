import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorAlert from '../src/components/common/ErrorAlert';
describe('ErrorAlert', () => {
  it('renders null if no msg', () => {
    const { container } = render(<ErrorAlert message={null} />);
    expect(container.firstChild).toBeNull();
  });
  it('renders msg', () => {
    render(<ErrorAlert message="Err" />);
    expect(screen.getByText('Err')).toBeInTheDocument();
  });
  it('calls dismiss', () => {
    const fn = vi.fn();
    render(<ErrorAlert message="E" onDismiss={fn} />);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalled();
  });
});
