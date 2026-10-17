import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { LevelSelectScreen } from './LevelSelectScreen';

jest.mock('@expo-google-fonts/figtree', () => ({
  useFonts: () => [false],
  Figtree_600SemiBold: 'x',
}));

test('pressing Nível 1 selects level 1', async () => {
  const onSelectLevel = jest.fn();
  await render(<LevelSelectScreen onSelectLevel={onSelectLevel} onBack={jest.fn()} />);
  await fireEvent.press(screen.getByText('Nível 1'));
  expect(onSelectLevel).toHaveBeenCalledWith(1);
});

test('pressing a locked level does nothing', async () => {
  const onSelectLevel = jest.fn();
  await render(<LevelSelectScreen onSelectLevel={onSelectLevel} onBack={jest.fn()} />);
  await fireEvent.press(screen.getByText('Nível 3'));
  expect(onSelectLevel).not.toHaveBeenCalled();
});

test('Voltar calls onBack', async () => {
  const onBack = jest.fn();
  await render(<LevelSelectScreen onSelectLevel={jest.fn()} onBack={onBack} />);
  await fireEvent.press(screen.getByText('Voltar'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('shows 4 Bloqueado labels', async () => {
  await render(<LevelSelectScreen onSelectLevel={jest.fn()} onBack={jest.fn()} />);
  expect(screen.getAllByText('Bloqueado')).toHaveLength(4);
});
