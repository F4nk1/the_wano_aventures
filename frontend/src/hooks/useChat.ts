import { useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useAuthContext } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';

export const useChat = () => {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();
  const { roomCode, chatMessages } = useGameContext();

  const sendMessage = useCallback((text: string) => {
    if (!socket || !roomCode || !user || !text.trim()) return;
    socket.emit('chatMessage', { roomCode, username: user.username, text });
  }, [socket, roomCode, user]);

  return { chatMessages, sendMessage };
};
