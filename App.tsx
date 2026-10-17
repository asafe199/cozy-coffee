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
