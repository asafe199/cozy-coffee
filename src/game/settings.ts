import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Lang, getLang, setLang } from '../i18n';

const STORAGE_KEY = 'brewlight.settings';

interface SettingsState {
  // In-game tips that fade in briefly on each scene.
  hints: boolean;
  lang: Lang;
  setHints: (hints: boolean) => void;
  setLanguage: (lang: Lang) => void;
  hydrateSettings: () => Promise<void>;
}

function persist(state: SettingsState) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ hints: state.hints, lang: state.lang })).catch(() => {});
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hints: true,
  lang: getLang(),
  setHints: (hints) => {
    set({ hints });
    persist(get());
  },
  setLanguage: (lang) => {
    setLang(lang);
    set({ lang });
    persist(get());
  },
  hydrateSettings: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = json ? JSON.parse(json) : null;
      if (parsed && typeof parsed.hints === 'boolean') {
        set({ hints: parsed.hints });
      }
      if (parsed && (parsed.lang === 'pt' || parsed.lang === 'en' || parsed.lang === 'es')) {
        setLang(parsed.lang);
        set({ lang: parsed.lang });
      }
    } catch {
      // keep defaults
    }
  },
}));
