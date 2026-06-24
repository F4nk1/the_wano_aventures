import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SettingsModal } from '../components/auth/SettingsModal';

export const AuthScreen: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center px-4 relative">
      <button 
        onClick={() => setShowSettings(true)} 
        className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white rounded-full transition cursor-pointer"
        title="Configuracion de conexion"
      >
        <Settings size={20} />
      </button>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        {/* Title Block */}
        <span className="bg-gold-gradient text-slate-900 text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-md mb-2">
          Monopolio Andino
        </span>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] text-center text-chicha-glow">
          THE WANO AVENTURES
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-medium text-center uppercase tracking-widest mt-1 mb-6">
          Chicha Edition
        </p>

        {/* Form */}
        <LoginForm />
      </div>
    </div>
  );
};
export default AuthScreen;
