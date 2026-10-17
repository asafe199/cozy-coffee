jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveProgress, loadProgress, PersistedProgress } from './persistence';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('loadProgress returns null when nothing has been saved yet', async () => {
  expect(await loadProgress()).toBeNull();
});

test('saveProgress then loadProgress round-trips day and money', async () => {
  await saveProgress({ day: 3, money: 42 });
  expect(await loadProgress()).toEqual({ day: 3, money: 42 });
});

test('loadProgress returns null for malformed stored JSON', async () => {
  await AsyncStorage.setItem('brewlight.progress', 'not json');
  expect(await loadProgress()).toBeNull();
});

test('loadProgress returns null when stored fields have the wrong type', async () => {
  await AsyncStorage.setItem('brewlight.progress', JSON.stringify({ day: '3', money: 42 }));
  expect(await loadProgress()).toBeNull();
});

test('saveProgress does not throw when AsyncStorage.setItem rejects', async () => {
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
  await expect(saveProgress({ day: 1, money: 0 })).resolves.toBeUndefined();
});

test('loadProgress does not throw when AsyncStorage.getItem rejects', async () => {
  jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('io error'));
  await expect(loadProgress()).resolves.toBeNull();
});
