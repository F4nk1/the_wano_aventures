import React from 'react';
import { WaitingRoom } from '../components/lobby/WaitingRoom';

export const WaitingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl">
        <WaitingRoom />
      </div>
    </div>
  );
};
export default WaitingScreen;
