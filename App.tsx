import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameScreen />
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
