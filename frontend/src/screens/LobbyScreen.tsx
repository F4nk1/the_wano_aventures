import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { CharacterPicker } from '../components/lobby/CharacterPicker';
import type { CharacterClassId } from '../components/lobby/CharacterPicker';
import { RoomActions } from '../components/lobby/RoomActions';
import { LogOut, User } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LobbyScreen: React.FC = () => {
  const { user, handleLogout } = useAuthContext();
  const [selectedClass, setSelectedClass] = useState<CharacterClassId>('emprendedor');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col p-4 md:p-8">
      {/* Top Profile Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-8">
        <div className="flex items-center gap-2">
          <User size={18} className="text-[var(--chicha-cyan)]" />
          <span className="font-bold text-sm">
            Hola, <span className="text-[var(--chicha-yellow)]">@{user.username}</span>
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10 font-bold"
        >
          <LogOut size={14} className="mr-1.5" /> Cerrar Sesión
        </Button>
      </div>

      {/* Main Lobby Form Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 flex-1 justify-center py-4">
        {/* Step 1: Character Picker */}
        <CharacterPicker 
          selectedClass={selectedClass} 
          onSelect={setSelectedClass} 
        />

        {/* Step 2: Room Actions */}
        <RoomActions selectedClass={selectedClass} />
      </div>
    </div>
  );
};
export default LobbyScreen;
