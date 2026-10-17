import { useSettingsStore } from './settings';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      setItem: jest.fn(async (k: string, v: string) => {
        store[k] = v;
      }),
      getItem: jest.fn(async (k: string) => store[k] ?? null),
    },
  };
});

test('hints default on, persist when toggled, and hydrate back', async () => {
  expect(useSettingsStore.getState().hints).toBe(true);
  useSettingsStore.getState().setHints(false);
  expect(useSettingsStore.getState().hints).toBe(false);
  useSettingsStore.setState({ hints: true });
  await useSettingsStore.getState().hydrateSettings();
  expect(useSettingsStore.getState().hints).toBe(false);
});
