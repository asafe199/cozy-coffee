import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'brewlight.settings';

interface SettingsState {
  // In-game tips that fade in briefly on each scene.
  hints: boolean;
  setHints: (hints: boolean) => void;
  hydrateSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hints: true,
  setHints: (hints) => {
    set({ hints });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ hints })).catch(() => {});
  },
  hydrateSettings: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = json ? JSON.parse(json) : null;
      if (parsed && typeof parsed.hints === 'boolean') {
        set({ hints: parsed.hints });
      }
    } catch {
      // keep defaults
    }
  },
}));
