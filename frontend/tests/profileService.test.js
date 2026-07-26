import { describe, expect, it, vi } from 'vitest';
import api from '../src/services/api';
import profileService, { buildProfileUpdatePayload } from '../src/services/profileService';

vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

describe('profileService', () => {
  it('builds a trimmed profile update payload', () => {
    expect(buildProfileUpdatePayload({
      full_name: '  Jane Farmer  ',
      phone: ' 0771234567 ',
      email: ' JANE@example.COM ',
      district: ' Colombo ',
      address: '  Main Road ',
      bio: '  Seed paddy supplier. ',
      role: 'admin',
    })).toEqual({
      full_name: 'Jane Farmer',
      phone: '0771234567',
      email: 'jane@example.com',
      district: 'Colombo',
      address: 'Main Road',
      bio: 'Seed paddy supplier.',
    });
  });

  it('sends sanitized data when updating a profile', async () => {
    api.put.mockResolvedValueOnce({ data: { ok: true } });

    const result = await profileService.update({
      full_name: '  Jane Farmer  ',
      phone: ' 0771234567 ',
      email: ' JANE@example.COM ',
      district: ' Colombo ',
      address: '  Main Road ',
      bio: '  Seed paddy supplier. ',
      ignored: 'value',
    });

    expect(api.put).toHaveBeenCalledWith('/users/me', {
      full_name: 'Jane Farmer',
      phone: '0771234567',
      email: 'jane@example.com',
      district: 'Colombo',
      address: 'Main Road',
      bio: 'Seed paddy supplier.',
    });
    expect(result).toEqual({ ok: true });
  });
});
