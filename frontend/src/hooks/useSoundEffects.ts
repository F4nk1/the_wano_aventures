import { useEffect, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';
import { SoundEffects } from '../utils/soundEffects';

export const useSoundEffects = () => {
  const { user } = useAuthContext();
  const { gameState } = useGameContext();

  const prevPositionRef = useRef<number>(-1);
  const prevCashRef = useRef<number>(-1);
  const prevInJailRef = useRef<boolean>(false);
  const prevCrisisRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gameState || !user) return;

    const self = gameState.players.find(p => p.username === user.username);
    if (!self) return;

    if (gameState.hasRolled && prevPositionRef.current !== self.position) {
      SoundEffects.playDice();
    }

    if (prevPositionRef.current !== -1 && prevPositionRef.current !== self.position) {
      SoundEffects.playStep();
    }
    prevPositionRef.current = self.position;

    if (prevCashRef.current !== -1 && prevCashRef.current !== self.cash) {
      SoundEffects.playCash();
    }
    prevCashRef.current = self.cash;

    if (self.inJail && !prevInJailRef.current) {
      SoundEffects.playSiren();
    }
    prevInJailRef.current = self.inJail;

    if (self.isBankrupt && prevCashRef.current !== 0) {
      SoundEffects.playExplode();
    }

    if (gameState.activeCrisis && prevCrisisRef.current !== gameState.activeCrisis.name) {
      SoundEffects.playSiren();
    }
    prevCrisisRef.current = gameState.activeCrisis ? gameState.activeCrisis.name : null;
  }, [gameState, user]);
};
