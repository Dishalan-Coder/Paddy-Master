import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AppErrorBoundary from '../src/components/common/AppErrorBoundary';
import ErrorPage from '../src/pages/ErrorPage';
import LoadingPage from '../src/pages/LoadingPage';
import NetworkSlowPage from '../src/pages/NetworkSlowPage';

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('status pages', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the loading page steps', () => {
    renderWithRouter(<LoadingPage actions={false} />);

    expect(
      screen.getByRole('heading', { name: /getting everything ready/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Checking session')).toBeInTheDocument();
    expect(screen.getByText('Loading records')).toBeInTheDocument();
    expect(screen.getByText('Preparing views')).toBeInTheDocument();
  });

  it('renders the error page with a useful message', () => {
    renderWithRouter(<ErrorPage error={new Error('Broken screen')} />);

    expect(
      screen.getByRole('heading', { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Broken screen')).toBeInTheDocument();
  });

  it('renders the slow network page with connection details', () => {
    renderWithRouter(<NetworkSlowPage actions={false} />);

    expect(
      screen.getByRole('heading', { name: /the network is taking longer/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('uses the error boundary fallback when a screen crashes', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const BrokenScreen = () => {
      throw new Error('Boundary failure');
    };

    renderWithRouter(
      <AppErrorBoundary>
        <BrokenScreen />
      </AppErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Boundary failure')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });
});
