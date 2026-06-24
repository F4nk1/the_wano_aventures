import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const {
    authMode,
    setAuthMode,
    authError,
    authSuccess,
    handleAuth,
    setAuthError,
    setAuthSuccess
  } = useAuthContext();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setAuthError('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      await handleAuth(username, password);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setAuthError('');
    setAuthSuccess('');
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <Input
        label="Usuario"
        type="text"
        placeholder="Tu nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="Tu contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      {authError && (
        <div className="p-3 bg-[var(--danger)]/15 border border-[var(--danger)]/30 rounded-xl text-sm text-[var(--danger)] font-medium">
          {authError}
        </div>
      )}

      {authSuccess && (
        <div className="p-3 bg-[var(--success)]/15 border border-[var(--success)]/30 rounded-xl text-sm text-[var(--success)] font-medium">
          {authSuccess}
        </div>
      )}

      <Button
        type="submit"
        variant={authMode === 'login' ? 'chicha' : 'gold'}
        fullWidth
        disabled={loading}
      >
        {loading ? 'Cargando...' : authMode === 'login' ? 'Ingresar' : 'Registrarse'}
      </Button>

      <button
        type="button"
        onClick={toggleMode}
        className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition uppercase tracking-wider text-center mt-2"
        disabled={loading}
      >
        {authMode === 'login' ? '¿No tienes cuenta? Registrate aquí' : '¿Ya tienes cuenta? Ingresa aquí'}
      </button>
    </form>
  );
};
export default LoginForm;
