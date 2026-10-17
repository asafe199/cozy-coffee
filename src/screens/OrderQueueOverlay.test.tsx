import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { OrderQueueOverlay } from './OrderQueueOverlay';
import { Order } from '../game/types';

const orders: Order[] = [
  { id: 'a', items: [{ recipe: 'coffee', wantsSugar: true }] },
  { id: 'b', items: [{ recipe: 'toast', wantsButter: false }] },
];

test('shows each pending order and lets the player pick any of them', async () => {
  const onPick = jest.fn();
  await render(<OrderQueueOverlay orders={orders} onPick={onPick} />);
  expect(screen.getByText('Café com açúcar')).toBeTruthy();
  await fireEvent.press(screen.getByText('Torrada'));
  expect(onPick).toHaveBeenCalledWith('b');
});

test('renders nothing when there are no orders', async () => {
  await render(<OrderQueueOverlay orders={[]} onPick={jest.fn()} />);
  expect(screen.queryByText('1')).toBeNull();
});
