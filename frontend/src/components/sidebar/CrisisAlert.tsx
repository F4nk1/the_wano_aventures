import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { ShieldAlert } from 'lucide-react';

export const CrisisAlert: React.FC = () => {
  const { gameState } = useGameContext();

  if (!gameState || !gameState.activeCrisis) return null;

  const crisis = gameState.activeCrisis;

  return (
    <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-xl p-3 flex gap-2.5 items-start mt-2 animate-in slide-in-from-top duration-300">
      <ShieldAlert className="text-[var(--danger)] shrink-0 mt-0.5" size={16} />
      <div>
        <h4 className="text-xs font-black text-[var(--danger)] uppercase tracking-wide">
          CRISIS: {crisis.name}
        </h4>
        <p className="text-[10px] text-[var(--text-secondary)] leading-normal mt-0.5">
          {crisis.text}
        </p>
        <span className="text-[8px] font-bold text-[var(--danger)] bg-[var(--danger)]/5 px-2 py-0.5 rounded mt-1.5 inline-block uppercase tracking-wider">
          Quedan {crisis.remainingTurns} turnos
        </span>
      </div>
    </div>
  );
};
export default CrisisAlert;
