import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReviewHistoryOverlay } from './ReviewHistoryOverlay';
import { ReviewResult } from '../game/types';

const reviews: ReviewResult[] = [
  { stars: 5, comments: [], summary: 'Café com açúcar' },
  { stars: 3, comments: ['missing_sugar', 'too_slow'], summary: 'Café' },
];

test('shows each review, most recent first, with a friendly reason', async () => {
  await render(<ReviewHistoryOverlay reviews={reviews} onClose={jest.fn()} />);
  expect(screen.getByText('Tudo certo!')).toBeTruthy();
  expect(screen.getByText('Esqueceu o açúcar, Demorou demais')).toBeTruthy();
});

test('shows an empty state and closes', async () => {
  const onClose = jest.fn();
  await render(<ReviewHistoryOverlay reviews={[]} onClose={onClose} />);
  expect(screen.getByText('Nenhum cliente atendido ainda')).toBeTruthy();
  await fireEvent.press(screen.getByText('Voltar'));
  expect(onClose).toHaveBeenCalled();
});
