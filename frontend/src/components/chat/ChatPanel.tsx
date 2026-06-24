import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useAuthContext } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';

export const ChatPanel: React.FC = () => {
  const { chatMessages, roomCode } = useGameContext();
  const { user } = useAuthContext();
  const { socket } = useSocketContext();
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !roomCode || !user || !chatInput.trim()) return;
    
    socket.emit('chatMessage', { roomCode, message: chatInput.trim() });
    setChatInput('');
  };

  if (!user) return null;

  return (
    <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 flex flex-col h-56">
      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        Chat de Causes
      </h3>
      
      {/* Messages view */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-xs pr-1">
        {chatMessages.length === 0 ? (
          <p className="text-[var(--text-muted)] italic text-[10px]">No hay mensajes.</p>
        ) : (
          chatMessages.map((msg, idx) => (
            <div key={idx} className="bg-[var(--bg-surface)] p-2 rounded border border-[var(--border-subtle)]">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-bold text-[var(--danger)]">@{msg.username}</span>
                <span className="text-[9px] text-[var(--text-muted)] font-mono">{msg.timestamp}</span>
              </div>
              <p className="text-[var(--text-primary)] font-medium">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendChatMessage} className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-grow bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)]"
          required
        />
        <Button type="submit" variant="primary" className="p-2 shrink-0">
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
};
export default ChatPanel;
