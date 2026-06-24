import React, { useState } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { useAuthContext } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import type { CharacterClassId } from './CharacterPicker';
import { Plus, Users } from 'lucide-react';

interface RoomActionsProps {
  selectedClass: CharacterClassId;
}

export const RoomActions: React.FC<RoomActionsProps> = ({ selectedClass }) => {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = () => {
    if (!socket || !user) return;
    setLoading(true);
    socket.emit('createRoom', { username: user.username, characterClass: selectedClass });
    setLoading(false);
  };

  const handleJoinRoom = () => {
    if (!socket || !user || !joinCodeInput.trim()) return;
    setLoading(true);
    socket.emit('joinRoom', {
      username: user.username,
      roomCode: joinCodeInput.trim().toUpperCase(),
      characterClass: selectedClass
    });
    setLoading(false);
  };

  const handleLoadRoom = () => {
    if (!socket || !user || !joinCodeInput.trim()) return;
    setLoading(true);
    socket.emit('loadGame', {
      roomCode: joinCodeInput.trim().toUpperCase(),
      username: user.username
    });
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Create Room */}
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <CardContent className="flex flex-col h-full justify-between gap-6 p-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Plus size={20} className="text-[var(--chicha-cyan)]" /> Crear Partida
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">
              Crea una nueva sala de juego para invitar a tus amigos y competir en Wano.
            </p>
          </div>
          <Button
            variant="chicha"
            onClick={handleCreateRoom}
            disabled={loading}
            fullWidth
          >
            Crear Nueva Sala
          </Button>
        </CardContent>
      </Card>

      {/* Join/Load Room */}
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <CardContent className="flex flex-col gap-4 p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Users size={20} className="text-[var(--chicha-yellow)]" /> Unirse o Cargar Partida
          </h3>
          <Input
            placeholder="Código de la Sala (ej. A1B2)"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            disabled={loading}
            maxLength={10}
            className="uppercase font-mono tracking-widest text-center text-lg"
          />
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={handleJoinRoom}
              disabled={loading || !joinCodeInput.trim()}
            >
              Unirse
            </Button>
            <Button
              variant="secondary"
              onClick={handleLoadRoom}
              disabled={loading || !joinCodeInput.trim()}
            >
              Cargar Partida
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default RoomActions;
