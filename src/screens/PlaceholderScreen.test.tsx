import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PlaceholderScreen } from './PlaceholderScreen';

test('shows coming soon and calls onBack', async () => {
  const onBack = jest.fn();
  await render(<PlaceholderScreen onBack={onBack} />);
  expect(screen.getByText('Coming soon')).toBeTruthy();
  await fireEvent.press(screen.getByText('Back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});
