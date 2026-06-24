import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export const createSocket = (url: string): Socket => {
  return io(url, {
    autoConnect: false,
    reconnectionAttempts: 5,
  });
};
