import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../src/components/auth/LoginForm';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn(), user: null, logout: vi.fn(), register: vi.fn() }),
}));

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders fields', () => {
    render(<BrowserRouter><LoginForm /></BrowserRouter>);
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('shows error on empty', async () => {
    render(<BrowserRouter><LoginForm /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText('Phone number or email is required.')).toBeInTheDocument();
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(<BrowserRouter><LoginForm /></BrowserRouter>);
    const password = screen.getByLabelText('Password');

    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(password).toHaveAttribute('type', 'password');
  });
});
