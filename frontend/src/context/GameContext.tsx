import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocketContext } from './SocketContext';
import { useAuthContext } from './AuthContext';
import type { GameState, ChatMessage } from '../types';

interface GameContextType {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  roomCode: string;
  setRoomCode: React.Dispatch<React.SetStateAction<string>>;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  errorMsg: string;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  customBidAmount: number;
  setCustomBidAmount: React.Dispatch<React.SetStateAction<number>>;
  isMyTurn: () => boolean;
  getCurrentPlayer: () => import('../types').Player | null;
  exitRoom: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = ({ roomCode: rc, gameState: gs }: { roomCode: string; gameState: GameState }) => {
      setRoomCode(rc);
      setGameState(gs);
      setErrorMsg('');
    };

    const onRoomJoined = ({ roomCode: rc, gameState: gs }: { roomCode: string; gameState: GameState }) => {
      setRoomCode(rc);
      setGameState(gs);
      setErrorMsg('');
    };

    const onGameUpdated = (updatedState: GameState) => {
      setGameState(updatedState);
      if (updatedState.auction) {
        setCustomBidAmount(updatedState.auction.highestBid + 10);
      }
    };

    const onNewChatMessage = (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
    };

    const onErrorMsg = (msg: string) => alert(msg);
    const onInfoMsg = (msg: string) => alert(msg);

    socket.on('roomCreated', onRoomCreated);
    socket.on('roomJoined', onRoomJoined);
    socket.on('gameUpdated', onGameUpdated);
    socket.on('chatMessage', onNewChatMessage);
    socket.on('errorMsg', onErrorMsg);
    socket.on('infoMsg', onInfoMsg);

    return () => {
      socket.off('roomCreated', onRoomCreated);
      socket.off('roomJoined', onRoomJoined);
      socket.off('gameUpdated', onGameUpdated);
      socket.off('chatMessage', onNewChatMessage);
      socket.off('errorMsg', onErrorMsg);
      socket.off('infoMsg', onInfoMsg);
    };
  }, [socket]);

  const isMyTurn = useCallback(() => {
    if (!gameState || !user) return false;
    const currentTurnPlayer = gameState.players[gameState.turnIndex];
    return currentTurnPlayer && currentTurnPlayer.username === user.username;
  }, [gameState, user]);

  const getCurrentPlayer = useCallback(() => {
    if (!gameState || !user) return null;
    return gameState.players.find(p => p.username === user.username) || null;
  }, [gameState, user]);

  const exitRoom = useCallback(() => {
    setGameState(null);
    setRoomCode('');
    setChatMessages([]);
  }, []);

  return (
    <GameContext.Provider value={{
      gameState, setGameState, roomCode, setRoomCode,
      chatMessages, setChatMessages, errorMsg, setErrorMsg,
      customBidAmount, setCustomBidAmount,
      isMyTurn, getCurrentPlayer, exitRoom
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
};
