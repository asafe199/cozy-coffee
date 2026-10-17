import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PersistedProgress {
  day: number;
  money: number;
}

const STORAGE_KEY = 'brewlight.progress';

export async function saveProgress(data: PersistedProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save progress:', error);
  }
}

export async function loadProgress(): Promise<PersistedProgress | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json === null) {
      return null;
    }

    const parsed = JSON.parse(json);

    // Type guard: ensure both day and money are numbers
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.day === 'number' &&
      typeof parsed.money === 'number'
    ) {
      return parsed;
    }

    return null;
  } catch (error) {
    return null;
  }
}
