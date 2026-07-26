import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import FarmForm from '../src/components/farms/FarmForm';

describe('FarmForm', () => {
  it('rejects numbers in the farm name field', () => {
    const onSubmit = vi.fn();
    render(<FarmForm onSubmit={onSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText('Farm name'), {
      target: { value: 'Field 1' },
    });
    fireEvent.change(screen.getByLabelText('Location'), {
      target: { value: 'Main Road' },
    });
    fireEvent.change(screen.getByLabelText('Area (acres)'), {
      target: { value: '2.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save farm/i }));

    expect(
      screen.getByText('Farm name cannot contain numbers.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
