import { renderHook } from '@testing-library/react-native';
import { useOrderArrivals } from './useOrderArrivals';
import { useGameStore } from './gameStore';
import { initialClock } from '../game/shift';
import { PEAK_INTERVAL_MS } from '../game/queue';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(() => {
  jest.useFakeTimers();
  useGameStore.setState({ queue: [], currentOrder: null, dayOver: false, clock: initialClock() } as never);
});

afterEach(() => {
  jest.useRealTimers();
});

test('first order arrives immediately, then one per interval up to the cap', async () => {
  await renderHook(() => useOrderArrivals());
  expect(useGameStore.getState().queue).toHaveLength(1);
  jest.advanceTimersByTime(PEAK_INTERVAL_MS);
  expect(useGameStore.getState().queue).toHaveLength(2);
  jest.advanceTimersByTime(PEAK_INTERVAL_MS * 5);
  expect(useGameStore.getState().queue).toHaveLength(3);
});

test('no arrivals while the day is over', async () => {
  useGameStore.setState({ dayOver: true } as never);
  await renderHook(() => useOrderArrivals());
  jest.advanceTimersByTime(PEAK_INTERVAL_MS * 3);
  expect(useGameStore.getState().queue).toHaveLength(0);
});
