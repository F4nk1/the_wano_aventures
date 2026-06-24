import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { useAuthContext } from '../context/AuthContext';
import { GameBoard } from '../components/board/GameBoard';
import { GameSidebar } from '../components/sidebar/GameSidebar';
import { TradeModal } from '../components/trade/TradeModal';
import { TradeOffer } from '../components/trade/TradeOffer';
import { AuctionPanel } from '../components/auction/AuctionPanel';
import type { Tile } from '../types';
import { SoundEffects } from '../utils/soundEffects';

export const GameScreen: React.FC = () => {
  const { gameState } = useGameContext();
  const { user } = useAuthContext();
  
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeTarget, setTradeTarget] = useState('');

  // References for sound triggers
  const prevPositionRef = useRef<number>(-1);
  const prevCashRef = useRef<number>(-1);
  const prevInJailRef = useRef<boolean>(false);

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
  }, [gameState, user]);

  if (!gameState || !user) return null;

  const handleProposeTrade = (targetUser: string) => {
    setTradeTarget(targetUser);
    setShowTradeModal(true);
  };

  return (
    <div className="min-h-screen bg-[#03100a] text-slate-100 flex flex-col xl:flex-row h-screen overflow-hidden">
      {/* LEFT PANEL: Nodal Board Viewport */}
      <div className="flex-1 flex justify-center items-center bg-[#05170f] p-4 overflow-auto relative">
        <GameBoard 
          selectedTile={selectedTile} 
          onSelectTile={setSelectedTile} 
        />
        
        {/* Floating Trade Offer Overlay */}
        <div className="absolute bottom-6 left-6 z-40 max-w-sm">
          <TradeOffer />
        </div>
      </div>

      {/* RIGHT PANEL: Info Sidebar */}
      <GameSidebar 
        selectedTile={selectedTile} 
        onSelectTile={setSelectedTile} 
        onProposeTrade={handleProposeTrade}
      />

      {/* Trade proposal overlay modal */}
      {showTradeModal && (
        <TradeModal 
          isOpen={showTradeModal} 
          onClose={() => setShowTradeModal(false)} 
          targetUser={tradeTarget}
        />
      )}

      {/* Active Auction Overlay */}
      <AuctionPanel />
    </div>
  );
};
export default GameScreen;
