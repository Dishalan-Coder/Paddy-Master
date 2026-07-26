import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfilePage, { getChangedProfilePayload, validateProfileForm } from '../src/pages/ProfilePage';
import profileService from '../src/services/profileService';

const mocks = vi.hoisted(() => {
  const profileFields = ['full_name', 'phone', 'email', 'district', 'address', 'bio'];
  const buildProfileUpdatePayload = (data = {}) => (
    profileFields.reduce((payload, field) => {
      if (!(field in data)) return payload;

      const value = data[field];
      if (typeof value === 'string') {
        payload[field] = field === 'email' ? value.trim().toLowerCase() : value.trim();
      } else if (value !== undefined && value !== null) {
        payload[field] = value;
      }

      return payload;
    }, {})
  );

  return {
    refreshProfile: vi.fn(),
    setUser: vi.fn(),
    user: {
      id: 'user-1',
      role: 'farmer',
      full_name: 'Test Farmer',
      phone: '0771234567',
      email: 'farmer@example.com',
      district: 'Anuradhapura',
      address: '',
      bio: '',
      profile_image_url: '',
      is_verified: false,
      rating: 4,
      wallet_balance: 2500,
    },
    update: vi.fn(),
    uploadPhoto: vi.fn(),
    profileFields,
    buildProfileUpdatePayload,
  };
});

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: mocks.user,
    refreshProfile: mocks.refreshProfile,
    setUser: mocks.setUser,
  }),
}));

vi.mock('../src/services/profileService', () => ({
  PROFILE_FIELDS: mocks.profileFields,
  buildProfileUpdatePayload: mocks.buildProfileUpdatePayload,
  default: {
    update: mocks.update,
    uploadPhoto: mocks.uploadPhoto,
  },
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates normalized profile values', () => {
    expect(validateProfileForm({
      full_name: ' A ',
      phone: '+94771234567',
      email: 'bad-email',
      district: 'Invalid district',
      address: 'x'.repeat(301),
      bio: 'x'.repeat(501),
    })).toEqual({
      full_name: 'Full name must be at least 2 characters.',
      phone: 'Only numbers can be entered.',
      email: 'Enter a valid email address.',
      district: 'Select a valid district.',
      address: 'Address must be 300 characters or less.',
      bio: 'Profile description must be 500 characters or less.',
    });
  });

  it('requires profile phone numbers to start with 07', () => {
    expect(validateProfileForm({
      full_name: 'Test Farmer',
      phone: '0812345678',
      email: 'farmer@example.com',
      district: 'Anuradhapura',
      address: '',
      bio: '',
    })).toEqual({
      phone: 'Phone number must start with 07.',
    });
  });

  it('rejects numbers in profile full names', () => {
    expect(validateProfileForm({
      full_name: 'Farmer 1',
      phone: '0771234567',
      email: 'farmer@example.com',
      district: 'Anuradhapura',
      address: '',
      bio: '',
    })).toEqual({
      full_name: 'Full name cannot contain numbers.',
    });
  });

  it('builds an update payload with only changed profile values', () => {
    expect(getChangedProfilePayload(mocks.user, {
      full_name: ' Test Farmer ',
      phone: '0771234567',
      email: ' FARMER@example.com ',
      district: 'Polonnaruwa',
      address: ' Main Road ',
      bio: '',
    })).toEqual({
      district: 'Polonnaruwa',
      address: 'Main Road',
    });
  });

  it('shows field validation errors before updating', async () => {
    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: 'phone' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'bad-email' } });
    fireEvent.change(screen.getByLabelText('District'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(screen.getByText('Full name must be at least 2 characters.')).toBeInTheDocument();
      expect(screen.getByText('Only numbers can be entered.')).toBeInTheDocument();
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      expect(screen.getByText('District is required.')).toBeInTheDocument();
    });
    expect(profileService.update).not.toHaveBeenCalled();
  });

  it('shows a numbers-only error as letters are typed in the phone field', () => {
    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '077abc' } });

    expect(screen.getByText('Only numbers can be entered.')).toBeInTheDocument();
  });

  it('shows a no-numbers error as numbers are typed in the full name field', () => {
    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Farmer 1' } });

    expect(screen.getByText('Full name cannot contain numbers.')).toBeInTheDocument();
  });

  it('updates auth state with the saved profile response', async () => {
    const updatedProfile = {
      ...mocks.user,
      full_name: 'Updated Farmer',
      email: 'updated@example.com',
      address: 'Main Road',
      bio: 'Organic paddy supplier.',
    };
    mocks.update.mockResolvedValueOnce(updatedProfile);
    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: ' Updated Farmer ' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: ' UPDATED@example.com ' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: ' Main Road ' } });
    fireEvent.change(screen.getByLabelText('Short profile description'), { target: { value: ' Organic paddy supplier. ' } });
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(mocks.update).toHaveBeenCalledWith({
        full_name: 'Updated Farmer',
        email: 'updated@example.com',
        address: 'Main Road',
        bio: 'Organic paddy supplier.',
      });
      expect(mocks.setUser).toHaveBeenCalledWith(updatedProfile);
      expect(screen.getByText('Profile updated successfully.')).toBeInTheDocument();
    });
  });

  it('does not call update when sanitized values are unchanged', async () => {
    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: ' Test Farmer ' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: ' FARMER@example.com ' } });
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(screen.getByText('No profile changes to save.')).toBeInTheDocument();
    });
    expect(profileService.update).not.toHaveBeenCalled();
  });
});
