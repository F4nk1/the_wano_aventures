import { useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useAuthContext } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';
import type { CharacterClassId } from '../config/constants';

export const useGame = () => {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();
  const { roomCode } = useGameContext();

  const createRoom = useCallback((characterClass: CharacterClassId) => {
    if (!socket || !user) return;
    socket.emit('createRoom', { username: user.username, characterClass });
  }, [socket, user]);

  const joinRoom = useCallback((code: string, characterClass: CharacterClassId) => {
    if (!socket || !user || !code) return;
    socket.emit('joinRoom', { username: user.username, roomCode: code.toUpperCase(), characterClass });
  }, [socket, user]);

  const loadRoom = useCallback((code: string) => {
    if (!socket || !user || !code) return;
    socket.emit('loadGame', { roomCode: code.toUpperCase(), username: user.username });
  }, [socket, user]);

  const startGame = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('startGame', { roomCode });
  }, [socket, roomCode]);

  const rollDice = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('rollDice', { roomCode });
  }, [socket, roomCode]);

  const buyProperty = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('buyProperty', { roomCode });
  }, [socket, roomCode]);

  const declineProperty = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('declineProperty', { roomCode });
  }, [socket, roomCode]);

  const placeBid = useCallback((bidAmount: number) => {
    if (!socket || !roomCode || !bidAmount) return;
    socket.emit('placeBid', { roomCode, bidAmount });
  }, [socket, roomCode]);

  const passBid = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('passBid', { roomCode });
  }, [socket, roomCode]);

  const proposeTrade = useCallback((receiver: string, offerCash: number, offerProperties: number[], requestCash: number, requestProperties: number[]) => {
    if (!socket || !roomCode || !receiver) return;
    socket.emit('proposeTrade', { roomCode, receiver, offerCash, offerProperties, requestCash, requestProperties });
  }, [socket, roomCode]);

  const acceptTrade = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('acceptTrade', { roomCode });
  }, [socket, roomCode]);

  const declineTrade = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('declineTrade', { roomCode });
  }, [socket, roomCode]);

  const endTurn = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('endTurn', { roomCode });
  }, [socket, roomCode]);

  const payJailFine = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('payJailFine', { roomCode });
  }, [socket, roomCode]);

  const buildHouse = useCallback((tileId: number) => {
    if (!socket || !roomCode) return;
    socket.emit('buildHouse', { roomCode, tileId });
  }, [socket, roomCode]);

  const sellHouse = useCallback((tileId: number) => {
    if (!socket || !roomCode) return;
    socket.emit('sellHouse', { roomCode, tileId });
  }, [socket, roomCode]);

  const mortgageProperty = useCallback((tileId: number) => {
    if (!socket || !roomCode) return;
    socket.emit('mortgageProperty', { roomCode, tileId });
  }, [socket, roomCode]);

  const unmortgageProperty = useCallback((tileId: number) => {
    if (!socket || !roomCode) return;
    socket.emit('unmortgageProperty', { roomCode, tileId });
  }, [socket, roomCode]);

  const saveGame = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('saveGame', { roomCode });
  }, [socket, roomCode]);

  const declareBankrupt = useCallback(() => {
    if (!socket || !roomCode) return;
    socket.emit('declareBankrupt', { roomCode });
  }, [socket, roomCode]);

  return {
    createRoom, joinRoom, loadRoom, startGame,
    rollDice, buyProperty, declineProperty,
    placeBid, passBid,
    proposeTrade, acceptTrade, declineTrade,
    endTurn, payJailFine,
    buildHouse, sellHouse, mortgageProperty, unmortgageProperty,
    saveGame, declareBankrupt
  };
};
