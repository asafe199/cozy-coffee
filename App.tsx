import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { InstructionsScreen } from './src/screens/InstructionsScreen';
import { LevelSelectScreen } from './src/screens/LevelSelectScreen';
import { GameScreen } from './src/screens/GameScreen';
import { loadProgress } from './src/game/persistence';
import { useGameStore } from './src/state/gameStore';

type Screen = 'menu' | 'instructions' | 'levels' | 'game';

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
      {screen === 'menu' && <MainMenuScreen ready={ready} onStart={() => setScreen('instructions')} />}
      {screen === 'instructions' && (
        <InstructionsScreen onContinue={() => setScreen('levels')} onBack={() => setScreen('menu')} />
      )}
      {screen === 'levels' && (
        <LevelSelectScreen onSelectLevel={() => setScreen('game')} onBack={() => setScreen('instructions')} />
      )}
      {screen === 'game' && <GameScreen onExit={() => setScreen('menu')} />}
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
