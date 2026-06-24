import React, { useEffect, useRef } from 'react';
import { useGameContext } from '../../context/GameContext';

export const GameLog: React.FC = () => {
  const { gameState } = useGameContext();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.log]);

  if (!gameState) return null;

  return (
    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col h-40">
      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        Registro de la Partida
      </h3>
      <div className="flex-grow overflow-y-auto space-y-1 text-[10px] font-mono text-[var(--text-primary)] pr-1">
        {gameState.log.map((log, idx) => (
          <div key={idx} className="border-b border-[var(--border-subtle)]/50 pb-1">
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
export default GameLog;
