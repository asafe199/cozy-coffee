import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { OptionsScreen } from './OptionsScreen';
import { useSettingsStore } from '../game/settings';

jest.mock('../game/settings', () => jest.requireActual('../game/settings'));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { setItem: jest.fn().mockResolvedValue(undefined), getItem: jest.fn().mockResolvedValue(null) },
}));
jest.mock('@expo-google-fonts/figtree', () => ({
  useFonts: () => [false],
  Figtree_600SemiBold: 'x',
}));

test('toggles hints and goes back', async () => {
  useSettingsStore.setState({ hints: true });
  const onBack = jest.fn();
  await render(<OptionsScreen onBack={onBack} />);
  expect(screen.getByText('Ativadas')).toBeTruthy();
  await fireEvent.press(screen.getByText('Dicas'));
  expect(screen.getByText('Desativadas')).toBeTruthy();
  expect(useSettingsStore.getState().hints).toBe(false);
  await fireEvent.press(screen.getByText('Voltar'));
  expect(onBack).toHaveBeenCalled();
});
