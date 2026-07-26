import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PlaceOrderButton from '../src/components/orders/PlaceOrderButton';
import orderService from '../src/services/orderService';

vi.mock('../src/services/orderService', () => ({
  default: {
    create: vi.fn(),
  },
}));

const product = {
  _id: 'product-123',
  variety: 'Nadu',
  quantity_kg: 250,
  price_per_kg: 120,
};

describe('PlaceOrderButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates and sends the product id with the order payload', async () => {
    orderService.create.mockResolvedValueOnce({
      _id: 'order-456',
      total_price: 1200,
    });

    render(<PlaceOrderButton product={product} />);

    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    fireEvent.change(screen.getByLabelText('Quantity (kg)'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText('Delivery address'), {
      target: { value: 'Main Road, Colombo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm order/i }));

    await waitFor(() => {
      expect(orderService.create).toHaveBeenCalledWith({
        product_id: 'product-123',
        quantity_kg: 10,
        delivery_address: 'Main Road, Colombo',
        payment_method: 'cash_on_delivery',
        notes: undefined,
      });
      expect(screen.getByText('Order placed successfully')).toBeInTheDocument();
    });
  });

  it('blocks invalid quantities before calling the API', async () => {
    render(<PlaceOrderButton product={product} />);

    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    fireEvent.change(screen.getByLabelText('Quantity (kg)'), {
      target: { value: '300' },
    });
    fireEvent.change(screen.getByLabelText('Delivery address'), {
      target: { value: 'Main Road, Colombo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm order/i }));

    await waitFor(() => {
      expect(screen.getByText('Only 250 kg is available.')).toBeInTheDocument();
    });
    expect(orderService.create).not.toHaveBeenCalled();
  });
});
