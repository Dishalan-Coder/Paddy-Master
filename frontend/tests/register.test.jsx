import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../src/components/auth/RegisterForm';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ register: vi.fn(), user: null, logout: vi.fn(), login: vi.fn() }),
}));

describe('RegisterForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows validation errors', async () => {
    render(<BrowserRouter><RegisterForm /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText('Full name is required.')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(screen.getByText('District is required.')).toBeInTheDocument();
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
      expect(screen.getByText('Confirm your password.')).toBeInTheDocument();
      expect(screen.getByText('You must agree to the terms.')).toBeInTheDocument();
    });
  });

  it('shows invalid format and password mismatch errors', async () => {
    render(<BrowserRouter><RegisterForm /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: 'phone' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad-email' } });
    fireEvent.change(screen.getByLabelText('District / Region'), { target: { value: 'Anuradhapura' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'secret2' } });
    fireEvent.click(screen.getByLabelText(/I agree to the Terms/i));
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('Full name must be at least 2 characters.')).toBeInTheDocument();
      expect(screen.getByText('Only numbers can be entered.')).toBeInTheDocument();
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('toggles both password fields', () => {
    render(<BrowserRouter><RegisterForm /></BrowserRouter>);
    const password = screen.getByLabelText('Password');
    const confirm = screen.getByLabelText('Confirm password');

    expect(password).toHaveAttribute('type', 'password');
    expect(confirm).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: /^show password$/i }));
    fireEvent.click(screen.getByRole('button', { name: /show confirm password/i }));

    expect(password).toHaveAttribute('type', 'text');
    expect(confirm).toHaveAttribute('type', 'text');
  });
});
