import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { InstructionsScreen } from './InstructionsScreen';

jest.mock('@expo-google-fonts/figtree', () => ({
  useFonts: () => [false],
  Figtree_600SemiBold: 'x',
}));

test('shows the title', async () => {
  await render(<InstructionsScreen onContinue={jest.fn()} onBack={jest.fn()} />);
  expect(screen.getByText('Como jogar')).toBeTruthy();
});

test('Continuar calls onContinue', async () => {
  const onContinue = jest.fn();
  await render(<InstructionsScreen onContinue={onContinue} onBack={jest.fn()} />);
  await fireEvent.press(screen.getByText('Continuar'));
  expect(onContinue).toHaveBeenCalledTimes(1);
});

test('Voltar calls onBack', async () => {
  const onBack = jest.fn();
  await render(<InstructionsScreen onContinue={jest.fn()} onBack={onBack} />);
  await fireEvent.press(screen.getByText('Voltar'));
  expect(onBack).toHaveBeenCalledTimes(1);
});
