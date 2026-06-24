import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { createSocket } from '../config/socket';
import { getInitialBackendUrl } from '../config/constants';

interface SocketContextType {
  socket: Socket | null;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  saveServerUrl: (url: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendUrl, setBackendUrl] = useState<string>(getInitialBackendUrl());
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = createSocket(backendUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Socket conectado.'));
    newSocket.connect();

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl]);

  const saveServerUrl = (url: string) => {
    setBackendUrl(url);
    localStorage.setItem('monopoly_server_url', url);
  };

  return (
    <SocketContext.Provider value={{ socket, backendUrl, setBackendUrl, saveServerUrl }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within SocketProvider');
  return ctx;
};
