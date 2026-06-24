import { useAuthContext } from './context/AuthContext';
import { useGameContext } from './context/GameContext';
import { AuthScreen } from './screens/AuthScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { WaitingScreen } from './screens/WaitingScreen';
import { GameScreen } from './screens/GameScreen';

export function App() {
  const { token, user } = useAuthContext();
  const { gameState } = useGameContext();

  if (!token || !user) {
    return <AuthScreen />;
  }

  if (!gameState) {
    return <LobbyScreen />;
  }

  if (gameState.status === 'lobby') {
    return <WaitingScreen />;
  }

  return <GameScreen />;
}

export default App;
