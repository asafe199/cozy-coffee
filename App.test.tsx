import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import App from './App';
import { useGameStore } from './src/state/gameStore';
import { loadProgress } from './src/game/persistence';

jest.mock('./src/game/persistence', () => ({
  saveProgress: jest.fn().mockResolvedValue(undefined),
  loadProgress: jest.fn(),
}));

jest.mock('./src/screens/GameScreen', () => ({
  GameScreen: () => {
    const { Text } = require('react-native');
    return <Text>GAME</Text>;
  },
}));

jest.mock('@expo-google-fonts/figtree', () => ({
  useFonts: () => [false],
  Figtree_600SemiBold: 'x',
}));

test('hydrates saved progress and navigates menu <-> placeholder', async () => {
  (loadProgress as jest.Mock).mockResolvedValue({ day: 5, money: 99 });
  await render(<App />);
  await waitFor(() => expect(useGameStore.getState().day).toBe(5));
  expect(useGameStore.getState().money).toBe(99);
  await fireEvent.press(screen.getByText('Iniciar'));
  expect(screen.getByText('Como jogar')).toBeTruthy();
  await fireEvent.press(screen.getByText('Continuar'));
  await fireEvent.press(screen.getByText('Voltar'));
  expect(screen.getByText('Como jogar')).toBeTruthy();
  await fireEvent.press(screen.getByText('Continuar'));
  await fireEvent.press(screen.getByText('Nível 1'));
  expect(screen.getByText('GAME')).toBeTruthy();
});
