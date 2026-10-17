import React from 'react';
import { BackHandler, Platform } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MainMenuScreen } from './MainMenuScreen';
import { useGameStore } from '../state/gameStore';
import { saveProgress } from '../game/persistence';

jest.mock('../game/persistence', () => ({
  saveProgress: jest.fn().mockResolvedValue(undefined),
  loadProgress: jest.fn().mockResolvedValue(null),
}));

jest.mock('@expo-google-fonts/figtree', () => ({
  useFonts: () => [false],
  Figtree_600SemiBold: 'x',
}));

beforeEach(() => {
  (saveProgress as jest.Mock).mockClear();
});

test('Iniciar calls onStart', async () => {
  const onStart = jest.fn();
  await render(<MainMenuScreen onStart={onStart} ready />);
  await fireEvent.press(screen.getByText('Iniciar'));
  expect(onStart).toHaveBeenCalledTimes(1);
});

test('Iniciar does nothing until ready', async () => {
  const onStart = jest.fn();
  await render(<MainMenuScreen onStart={onStart} ready={false} />);
  await fireEvent.press(screen.getByText('Iniciar'));
  expect(onStart).not.toHaveBeenCalled();
});

test('Salvar saves current day/money and shows Saved', async () => {
  useGameStore.setState({ day: 3, money: 42 } as never);
  await render(<MainMenuScreen onStart={jest.fn()} ready />);
  await fireEvent.press(screen.getByText('Salvar'));
  expect(saveProgress).toHaveBeenCalledWith({ day: 3, money: 42 });
  await waitFor(() => expect(screen.getByText('Salvo')).toBeTruthy());
});

test('Salvar does nothing until ready', async () => {
  await render(<MainMenuScreen onStart={jest.fn()} ready={false} />);
  await fireEvent.press(screen.getByText('Salvar'));
  expect(saveProgress).not.toHaveBeenCalled();
});

test('Sair exits on Android', async () => {
  Platform.OS = 'android';
  const exit = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => true);
  await render(<MainMenuScreen onStart={jest.fn()} ready />);
  await fireEvent.press(screen.getByText('Sair'));
  expect(exit).toHaveBeenCalled();
});

test('Sair is hidden on iOS', async () => {
  Platform.OS = 'ios';
  await render(<MainMenuScreen onStart={jest.fn()} ready />);
  expect(screen.queryByText('Sair')).toBeNull();
});
