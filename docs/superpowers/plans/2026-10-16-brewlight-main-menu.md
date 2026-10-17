# Brewlight Main Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a main menu (Iniciar / Salvar / Sair) and a placeholder screen, with progress hydrated at app launch.

**Architecture:** `App.tsx` switches between screens with `useState` (no router, no native deps). Menu and placeholder are plain React Native views. Hydration moves to `App.tsx` so Salvar can never overwrite real progress with defaults.

**Tech Stack:** Expo SDK 58, RN 0.88, zustand, `@react-native-async-storage/async-storage`, `@expo-google-fonts/figtree`, `@testing-library/react-native`.

**Spec:** `docs/superpowers/specs/2026-10-16-brewlight-main-menu-design.md`

## Global Constraints

- Never stressful: no timers, no alarming feedback (a failed save shows nothing scary).
- All text is plain RN `<Text>`; nothing inside `<Canvas>`.
- Do not touch reanimated (stays 4.7.1). No new native dependencies.
- `jest.config.js`: `react-tests` matches `*.test.tsx` only. Pure `.ts` tests go in `logic-tests`' `testMatch`.
- Palette: Carvão `#2B2729`, Nogueira `#4A2F1F`, Âmbar `#F3B45A`, Creme `#F6E3C7`, button text `#2B1A10`. Font: Figtree 600 (`Figtree_600SemiBold`).
- Menu buttons must render even before fonts load.
- Sair shows on Android only (`BackHandler.exitApp()`).
- Fraunces for the logo is optional polish and out of this plan. The logo uses Figtree.

---

### Task 1: PlaceholderScreen

**Files:**
- Create: `src/screens/PlaceholderScreen.tsx`
- Test: `src/screens/PlaceholderScreen.test.tsx`

**Interfaces:**
- Produces: `PlaceholderScreen({ onBack }: { onBack: () => void })`

- [ ] **Step 1: Write the failing test**

```tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PlaceholderScreen } from './PlaceholderScreen';

test('shows coming soon and calls onBack', () => {
  const onBack = jest.fn();
  render(<PlaceholderScreen onBack={onBack} />);
  expect(screen.getByText('Coming soon')).toBeTruthy();
  fireEvent.press(screen.getByText('Back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx jest src/screens/PlaceholderScreen.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement**

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function PlaceholderScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coming soon</Text>
      <Pressable style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2729', alignItems: 'center', justifyContent: 'center', gap: 24 },
  title: { color: '#F6E3C7', fontSize: 28 },
  button: { backgroundColor: '#4A2F1F', borderRadius: 14, height: 52, minWidth: 200, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#F6E3C7', fontSize: 16 },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/screens/PlaceholderScreen.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/screens/PlaceholderScreen.tsx src/screens/PlaceholderScreen.test.tsx
git commit -m "feat: add placeholder screen"
```

---

### Task 2: MainMenuScreen

**Files:**
- Create: `src/screens/MainMenuScreen.tsx`
- Test: `src/screens/MainMenuScreen.test.tsx`

**Interfaces:**
- Consumes: `saveProgress({ day, money })` from `src/game/persistence.ts`; `useGameStore` (`day`, `money`) from `src/state/gameStore.ts`.
- Produces: `MainMenuScreen({ onStart, ready }: { onStart: () => void; ready: boolean })`. Salvar is disabled while `ready` is false.

- [ ] **Step 1: Write the failing tests**

```tsx
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

beforeEach(() => {
  (saveProgress as jest.Mock).mockClear();
});

test('Iniciar calls onStart', () => {
  const onStart = jest.fn();
  render(<MainMenuScreen onStart={onStart} ready />);
  fireEvent.press(screen.getByText('Iniciar'));
  expect(onStart).toHaveBeenCalledTimes(1);
});

test('Salvar saves current day/money and shows Saved', async () => {
  useGameStore.setState({ day: 3, money: 42 } as never);
  render(<MainMenuScreen onStart={jest.fn()} ready />);
  fireEvent.press(screen.getByText('Salvar'));
  expect(saveProgress).toHaveBeenCalledWith({ day: 3, money: 42 });
  await waitFor(() => expect(screen.getByText('Saved')).toBeTruthy());
});

test('Salvar does nothing until ready', () => {
  render(<MainMenuScreen onStart={jest.fn()} ready={false} />);
  fireEvent.press(screen.getByText('Salvar'));
  expect(saveProgress).not.toHaveBeenCalled();
});

test('Sair exits on Android', () => {
  Platform.OS = 'android';
  const exit = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => true);
  render(<MainMenuScreen onStart={jest.fn()} ready />);
  fireEvent.press(screen.getByText('Sair'));
  expect(exit).toHaveBeenCalled();
});

test('Sair is hidden on iOS', () => {
  Platform.OS = 'ios';
  render(<MainMenuScreen onStart={jest.fn()} ready />);
  expect(screen.queryByText('Sair')).toBeNull();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx jest src/screens/MainMenuScreen.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFonts, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { useGameStore } from '../state/gameStore';
import { saveProgress } from '../game/persistence';

export function MainMenuScreen({ onStart, ready }: { onStart: () => void; ready: boolean }) {
  // Font loading never gates the buttons; fall back to the system font.
  const [fontsLoaded] = useFonts({ Figtree_600SemiBold });
  const font = fontsLoaded ? { fontFamily: 'Figtree_600SemiBold' } : undefined;
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleSave = () => {
    if (!ready) return;
    const { day, money } = useGameStore.getState();
    saveProgress({ day, money });
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, font]}>Brewlight</Text>
      <Text style={[styles.subtitle, font]}>SUA CAFETERIA ACONCHEGANTE</Text>
      <Pressable style={styles.primary} onPress={onStart}>
        <Text style={[styles.primaryText, font]}>Iniciar</Text>
      </Pressable>
      <Pressable style={[styles.secondary, !ready && styles.disabled]} onPress={handleSave}>
        <Text style={[styles.secondaryText, font]}>Salvar</Text>
      </Pressable>
      {Platform.OS === 'android' && (
        <Pressable style={styles.secondary} onPress={() => BackHandler.exitApp()}>
          <Text style={[styles.secondaryText, font]}>Sair</Text>
        </Pressable>
      )}
      <Text style={[styles.saved, font, { opacity: saved ? 1 : 0 }]}>{saved ? 'Saved' : ' '}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2729', alignItems: 'center', justifyContent: 'center', gap: 14 },
  logo: { color: '#F6E3C7', fontSize: 44, fontWeight: '700' },
  subtitle: { color: '#F3B45A', fontSize: 12, letterSpacing: 2.5, marginBottom: 24 },
  primary: { backgroundColor: '#F3B45A', borderRadius: 14, height: 52, width: 240, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#2B1A10', fontSize: 17 },
  secondary: { backgroundColor: '#4A2F1F', borderRadius: 14, height: 52, width: 240, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#F6E3C7', fontSize: 17 },
  disabled: { opacity: 0.5 },
  saved: { color: '#F6E3C7', fontSize: 14, marginTop: 8 },
});
```

- [ ] **Step 4: Run to verify pass**

Run: `npx jest src/screens/MainMenuScreen.test.tsx`
Expected: PASS. If font loading breaks the test environment, mock `@expo-google-fonts/figtree` in the test: `jest.mock('@expo-google-fonts/figtree', () => ({ useFonts: () => [false], Figtree_600SemiBold: 'x' }))`.

- [ ] **Step 5: Commit**

```bash
git add src/screens/MainMenuScreen.tsx src/screens/MainMenuScreen.test.tsx
git commit -m "feat: add main menu screen"
```

---

### Task 3: Wire App.tsx and hydrate at launch

**Files:**
- Modify: `App.tsx`
- Test: `App.test.tsx`

**Interfaces:**
- Consumes: `MainMenuScreen`, `PlaceholderScreen`, `loadProgress()` (returns `PersistedProgress | null`), `useGameStore.getState().hydrateProgress(data)`.
- Produces: `App` showing the menu first. Iniciar goes to the placeholder, and Back returns to the menu. The `ready` flag becomes true after `loadProgress` settles.

- [ ] **Step 1: Write the failing test**

```tsx
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import App from './App';
import { useGameStore } from './src/state/gameStore';
import { loadProgress } from './src/game/persistence';

jest.mock('./src/game/persistence', () => ({
  saveProgress: jest.fn().mockResolvedValue(undefined),
  loadProgress: jest.fn(),
}));

test('hydrates saved progress and navigates menu <-> placeholder', async () => {
  (loadProgress as jest.Mock).mockResolvedValue({ day: 5, money: 99 });
  render(<App />);
  await waitFor(() => expect(useGameStore.getState().day).toBe(5));
  expect(useGameStore.getState().money).toBe(99);
  fireEvent.press(screen.getByText('Iniciar'));
  expect(screen.getByText('Coming soon')).toBeTruthy();
  fireEvent.press(screen.getByText('Back'));
  expect(screen.getByText('Iniciar')).toBeTruthy();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx jest App.test.tsx`
Expected: FAIL (App still renders GameScreen)

- [ ] **Step 3: Implement `App.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { loadProgress } from './src/game/persistence';
import { useGameStore } from './src/state/gameStore';

type Screen = 'menu' | 'placeholder';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadProgress()
      .then((data) => {
        if (data) useGameStore.getState().hydrateProgress(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {screen === 'menu' ? (
        <MainMenuScreen ready={ready} onStart={() => setScreen('placeholder')} />
      ) : (
        <PlaceholderScreen onBack={() => setScreen('menu')} />
      )}
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
```

`GameScreen` is no longer rendered. It stays in the repo for the upcoming level-select to reuse.

- [ ] **Step 4: Run the full suite and typecheck**

Run: `npx jest && npx tsc --noEmit`
Expected: all pass, typecheck clean.

- [ ] **Step 5: Update CLAUDE.md and commit**

In `CLAUDE.md` "Current state", add a line: main menu + placeholder done, hydration lives in `App.tsx` (persistence Task 3 is superseded by this), Iniciar currently goes to the placeholder, not the game.

```bash
git add App.tsx App.test.tsx CLAUDE.md
git commit -m "feat: wire main menu into App and hydrate progress at launch"
```

---

## Self-Review

- Spec coverage: Iniciar → placeholder (T3), Salvar with "Saved" and disabled-until-hydrated (T2), Sair Android-only (T2), `useState` navigation (T3), hydration in `App.tsx` (T3), tests (all). The Fraunces font is explicitly deferred (Global Constraints).
- Types: `ready: boolean`, `onStart`, `onBack` are consistent across tasks.
