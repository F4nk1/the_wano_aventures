import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { 
  Dice5, User, LogOut, Plus, LogIn, Send, Copy, Save, 
  Trash2, ShieldAlert, Award, Settings
} from 'lucide-react';
import type { GameState, Tile, ChatMessage } from './types';

// Detect or fallback backend url
const getInitialBackendUrl = () => {
  const stored = localStorage.getItem('monopoly_server_url');
  if (stored) return stored;
  
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  // If we are on a tunnel, the backend is likely on the same domain but maybe `/api` or custom route.
  // We default to the current origin.
  return window.location.origin;
};

function App() {
  // Connection and Server Settings
  const [backendUrl, setBackendUrl] = useState<string>(getInitialBackendUrl());
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Auth states
  const [token, setToken] = useState<string | null>(localStorage.getItem('monopoly_token'));
  const [user, setUser] = useState<{ id: number; username: string } | null>(
    localStorage.getItem('monopoly_user') ? JSON.parse(localStorage.getItem('monopoly_user')!) : null
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Lobby/Game selector states
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Game states
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // UI States
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Reconnect / Establish Socket connection when backendUrl changes
  useEffect(() => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(backendUrl, {
      autoConnect: false,
      reconnectionAttempts: 5,
    });
    
    setSocket(newSocket);

    // Load initial socket listeners
    newSocket.on('connect', () => {
      console.log('Socket conectado a:', backendUrl);
    });

    newSocket.on('connect_error', () => {
      setErrorMsg('Error al conectar con el servidor de juegos.');
    });

    newSocket.on('roomCreated', ({ roomCode, gameState }) => {
      setRoomCode(roomCode);
      setGameState(gameState);
      setErrorMsg('');
    });

    newSocket.on('roomJoined', ({ roomCode, gameState }) => {
      setRoomCode(roomCode);
      setGameState(gameState);
      setErrorMsg('');
    });

    newSocket.on('gameUpdated', (updatedState: GameState) => {
      setGameState(updatedState);
    });

    newSocket.on('newChatMessage', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
    });

    newSocket.on('errorMsg', (msg: string) => {
      alert(msg); // standard prompt fallback
    });

    newSocket.on('infoMsg', (msg: string) => {
      alert(msg);
    });

    newSocket.connect();

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl]);

  // Save backend URL setting
  const saveServerUrl = (url: string) => {
    setBackendUrl(url);
    localStorage.setItem('monopoly_server_url', url);
    setShowSettings(false);
  };

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.log]);

  // Auth Functions
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      if (authMode === 'login') {
        localStorage.setItem('monopoly_token', data.token);
        localStorage.setItem('monopoly_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setAuthUsername('');
        setAuthPassword('');
      } else {
        setAuthSuccess('Registro exitoso. ¡Inicia sesión ahora!');
        setAuthMode('login');
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('monopoly_token');
    localStorage.removeItem('monopoly_user');
    setToken(null);
    setUser(null);
    setGameState(null);
    setRoomCode('');
    setChatMessages([]);
  };

  // Game Room Functions
  const handleCreateRoom = () => {
    if (!socket || !user) return;
    socket.emit('createRoom', { username: user.username });
  };

  const handleJoinRoom = () => {
    if (!socket || !user || !joinCodeInput) return;
    socket.emit('joinRoom', { username: user.username, roomCode: joinCodeInput.toUpperCase() });
  };

  const handleLoadRoom = () => {
    if (!socket || !user || !joinCodeInput) return;
    socket.emit('loadGame', { roomCode: joinCodeInput.toUpperCase(), username: user.username });
  };

  const handleStartGame = () => {
    if (!socket || !roomCode) return;
    socket.emit('startGame', { roomCode });
  };

  const handleRollDice = () => {
    if (!socket || !roomCode) return;
    socket.emit('rollDice', { roomCode });
  };

  const handleBuyProperty = () => {
    if (!socket || !roomCode) return;
    socket.emit('buyProperty', { roomCode });
  };

  const handleDeclineProperty = () => {
    if (!socket || !roomCode) return;
    socket.emit('declineProperty', { roomCode });
  };

  const handleEndTurn = () => {
    if (!socket || !roomCode) return;
    socket.emit('endTurn', { roomCode });
  };

  const handlePayJailFine = () => {
    if (!socket || !roomCode) return;
    socket.emit('payJailFine', { roomCode });
  };

  const handleBuildHouse = (tileId: number) => {
    if (!socket || !roomCode) return;
    socket.emit('buildHouse', { roomCode, tileId });
  };

  const handleMortgage = (tileId: number) => {
    if (!socket || !roomCode) return;
    socket.emit('mortgageProperty', { roomCode, tileId });
  };

  const handleUnmortgage = (tileId: number) => {
    if (!socket || !roomCode) return;
    socket.emit('unmortgageProperty', { roomCode, tileId });
  };

  const handleSaveGame = () => {
    if (!socket || !roomCode) return;
    socket.emit('saveGame', { roomCode });
  };

  const handleBankruptcy = () => {
    if (window.confirm('¿Seguro que quieres declararte en BANCARROTA? Perderás todas tus propiedades.')) {
      if (!socket || !roomCode) return;
      socket.emit('declareBankrupt', { roomCode });
    }
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !roomCode || !user || !chatInput.trim()) return;
    socket.emit('chatMessage', { roomCode, username: user.username, text: chatInput });
    setChatInput('');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Helpers
  const isMyTurn = () => {
    if (!gameState || !user) return false;
    const currentTurnPlayer = gameState.players[gameState.turnIndex];
    return currentTurnPlayer && currentTurnPlayer.username === user.username;
  };

  const getCurrentPlayer = () => {
    if (!gameState || !user) return null;
    return gameState.players.find(p => p.username === user.username) || null;
  };

  // Translate group colors to CSS classes
  const getGroupColorClass = (group: string) => {
    switch (group) {
      case 'brown': return 'bg-amber-800';
      case 'cyan': return 'bg-cyan-400';
      case 'pink': return 'bg-pink-400';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-400';
      case 'green': return 'bg-green-600';
      case 'blue': return 'bg-blue-600';
      default: return 'bg-slate-400';
    }
  };

  // Convert 0-39 Monopoly tile index to Grid coordinates (11x11 layout)
  const getTileGridStyle = (index: number) => {
    if (index === 0) return { gridColumn: 11, gridRow: 11 };
    if (index === 10) return { gridColumn: 1, gridRow: 11 };
    if (index === 20) return { gridColumn: 1, gridRow: 1 };
    if (index === 30) return { gridColumn: 11, gridRow: 1 };

    if (index > 0 && index < 10) {
      return { gridColumn: 11 - index, gridRow: 11 };
    }
    if (index > 10 && index < 20) {
      return { gridColumn: 1, gridRow: 11 - (index - 10) };
    }
    if (index > 20 && index < 30) {
      return { gridColumn: index - 20 + 1, gridRow: 1 };
    }
    // Index 31 to 39
    return { gridColumn: 11, gridRow: index - 30 + 1 };
  };

  // Screen 1: AUTHENTICATION
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative">
        {/* Settings Panel trigger */}
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className="absolute top-4 right-4 p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition duration-200"
          title="Configurar servidor"
        >
          <Settings size={20} />
        </button>

        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-850 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold mb-4 text-slate-100 flex items-center gap-2">
                <Settings size={18} className="text-rose-500" /> Configuración de Conexión
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Si juegas a través de Cloudflare Tunnels u otro servidor, escribe la dirección URL aquí.
              </p>
              <input
                type="text"
                defaultValue={backendUrl}
                id="serverUrlInput"
                placeholder="http://localhost:4000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500 mb-4 font-mono text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const inputVal = (document.getElementById('serverUrlInput') as HTMLInputElement).value;
                    saveServerUrl(inputVal);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white rounded-lg transition duration-200"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-850 shadow-2xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <span className="bg-chicha-gradient text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full shadow-md">
              Monopolio Online
            </span>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 mt-3 text-chicha-glow">
              Chicha Edition
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Conéctate con tus causas y aduéñate de todo el Perú
            </p>
          </div>

          {/* Tab selectors */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition ${
                authMode === 'login' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition ${
                authMode === 'register' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl">
                {authSuccess}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Escribe tu usuario..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500 transition"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Escribe tu contraseña..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-chicha-gradient hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-rose-500/25 flex justify-center items-center gap-2 mt-6"
            >
              {authMode === 'login' ? <LogIn size={18} /> : <Plus size={18} />}
              {authMode === 'login' ? 'Ingresar a la Partida' : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Screen 2: LOBBY SELECTOR (Once Authenticated, before room)
  if (!roomCode || !gameState) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4">
        {/* User bar */}
        <div className="absolute top-4 right-4 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl py-2 px-4 shadow-md">
          <div className="flex items-center gap-2">
            <User size={16} className="text-rose-500" />
            <span className="text-sm font-semibold text-slate-200 uppercase">{user.username}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="w-full max-w-lg space-y-6">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-100">¿Listo para quebrar a tus causas?</h1>
            <p className="text-sm text-slate-400 mt-2">Crea una sala nueva o ingresa el código de una sala activa/guardada</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Room Card */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition shadow-xl">
              <div>
                <h2 className="text-lg font-bold text-slate-200">Crear Nueva Partida</h2>
                <p className="text-xs text-slate-400 mt-2 mb-6">
                  Inicia una sala nueva, invita a tus amigos pasándoles un código de 4 letras y comiencen a jugar.
                </p>
              </div>
              <button
                onClick={handleCreateRoom}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl transition flex justify-center items-center gap-2 shadow-lg shadow-rose-600/20"
              >
                <Plus size={18} /> Crear Sala
              </button>
            </div>

            {/* Join Room Card */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition shadow-xl space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-200">Unirse / Cargar</h2>
                <p className="text-xs text-slate-400 mt-2">
                  Escribe el código de 4 letras para unirte a un lobby o reanudar una partida guardada.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO DE SALA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest text-slate-100 focus:outline-none focus:border-rose-500 transition mb-3"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleJoinRoom}
                    disabled={!joinCodeInput}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold py-2.5 px-4 rounded-lg text-sm transition"
                  >
                    Unirse
                  </button>
                  <button
                    onClick={handleLoadRoom}
                    disabled={!joinCodeInput}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition"
                  >
                    Cargar Partida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Screen 3: LOBBY
  if (gameState.status === 'lobby') {
    const isCreator = gameState.creator === user.username;
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-850 p-8 rounded-2xl shadow-2xl relative">
          
          <button 
            onClick={() => { setGameState(null); setRoomCode(''); }}
            className="absolute top-4 left-4 text-xs text-slate-500 hover:text-slate-300"
          >
            &larr; Volver
          </button>

          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Código de la sala</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-4xl font-black text-rose-500 tracking-wider font-mono">{roomCode}</span>
              <button 
                onClick={copyRoomCode}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                title="Copiar código"
              >
                {copied ? <span className="text-xs text-emerald-400 font-semibold">Copiado</span> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Envía este código a tus causas para jugar</p>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Jugadores conectados ({gameState.players.length}/6)
            </h3>
            <ul className="space-y-2">
              {gameState.players.map((p, idx) => (
                <li key={idx} className="flex items-center justify-between bg-slate-950 px-4 py-3 rounded-xl border border-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm font-bold text-slate-200">{p.username}</span>
                  </div>
                  {gameState.creator === p.username && (
                    <span className="text-[10px] font-bold text-rose-500 border border-rose-500/20 bg-rose-500/5 px-2 py-0.5 rounded">
                      ADMIN
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {isCreator ? (
            <button
              onClick={handleStartGame}
              disabled={gameState.players.length < 2}
              className="w-full bg-chicha-gradient hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-lg flex justify-center items-center gap-2"
            >
              Comenzar Partida
            </button>
          ) : (
            <div className="text-center py-3 bg-slate-950/50 border border-slate-900/50 rounded-xl">
              <p className="text-xs text-slate-400">Esperando que el administrador inicie el juego...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Screen 4: MAIN GAMEPLAY
  const currentPlayerObj = gameState.players[gameState.turnIndex];
  const isTurn = isMyTurn();
  const selfObj = getCurrentPlayer();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col xl:flex-row h-screen overflow-hidden">
      
      {/* LEFT PANEL: The Monopoly Board (11x11 Grid) */}
      <div className="flex-1 flex justify-center items-center bg-slate-950 p-2 sm:p-4 overflow-auto border-r border-slate-850">
        <div className="relative aspect-square w-full max-w-[800px] bg-amber-50 rounded-lg p-1 border-4 border-slate-900 grid grid-cols-11 grid-rows-11 gap-0.5 shadow-2xl">
          
          {/* CENTER SPACE (Grid Column 2/10, Row 2/10) */}
          <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-slate-900 p-6 flex flex-col justify-between items-center text-center relative border border-slate-800">
            {/* Logo inside Board */}
            <div className="mt-2">
              <span className="bg-chicha-gradient text-white text-[9px] uppercase tracking-widest font-extrabold px-3 py-0.5 rounded-full">
                Monopolio Online
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 text-chicha-glow">
                CHICHA
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest">SALA: {roomCode}</p>
            </div>

            {/* Live Actions & Decision Box */}
            <div className="w-full max-w-sm bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-xl my-4">
              {gameState.status === 'ended' ? (
                <div>
                  <Award className="text-yellow-400 mx-auto animate-bounce mb-2" size={32} />
                  <h3 className="text-sm font-bold text-yellow-400">¡PARTIDA FINALIZADA!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Solo quedó un jugador en pie. ¡Felicitaciones!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentPlayerObj?.color }} />
                    <span className="text-xs font-bold text-slate-200">
                      {isTurn ? '★ ¡Es tu turno! ★' : `Turno de: ${currentPlayerObj?.username}`}
                    </span>
                  </div>

                  {/* Dice output visual */}
                  <div className="flex justify-center gap-3">
                    <div className="w-10 h-10 bg-slate-850 border border-slate-800 rounded-lg flex items-center justify-center font-bold text-lg text-rose-500 shadow-md">
                      {gameState.dice[0]}
                    </div>
                    <div className="w-10 h-10 bg-slate-850 border border-slate-800 rounded-lg flex items-center justify-center font-bold text-lg text-rose-500 shadow-md">
                      {gameState.dice[1]}
                    </div>
                  </div>

                  {/* Decision Options */}
                  {isTurn && (
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      {/* Roll Dice Button */}
                      {!gameState.hasRolled && !selfObj?.inJail && (
                        <button
                          onClick={handleRollDice}
                          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition duration-200 flex justify-center items-center gap-2"
                        >
                          <Dice5 size={16} /> Lanzar Dados
                        </button>
                      )}

                      {/* In Jail Decisions */}
                      {selfObj?.inJail && !gameState.hasRolled && (
                        <div className="flex flex-col gap-2">
                          <p className="text-[10px] text-yellow-500 font-semibold">Estás detenido en la comisaría.</p>
                          <button
                            onClick={handleRollDice}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition duration-200"
                          >
                            Lanzar para Dobles
                          </button>
                          <button
                            onClick={handlePayJailFine}
                            disabled={selfObj.cash < 50}
                            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg text-xs transition duration-200"
                          >
                            Pagar Fianza/Coima (50 soles)
                          </button>
                        </div>
                      )}

                      {/* Buy property decision */}
                      {gameState.currentPlayerAction === 'buy_or_auction' && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-300">
                            ¿Quieres comprar{' '}
                            <span className="font-bold text-white">
                              {gameState.board[selfObj?.position || 0].name}
                            </span>{' '}
                            por{' '}
                            <span className="font-bold text-emerald-400">
                              {gameState.board[selfObj?.position || 0].price} soles
                            </span>
                            ?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleBuyProperty}
                              disabled={!!(selfObj && selfObj.cash < (gameState.board[selfObj.position].price || 0))}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg text-xs transition"
                            >
                              Comprar
                            </button>
                            <button
                              onClick={handleDeclineProperty}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-lg text-xs transition"
                            >
                              Pasar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* End Turn button */}
                      {gameState.hasRolled && gameState.currentPlayerAction === null && (
                        <button
                          onClick={handleEndTurn}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition"
                        >
                          Terminar Turno
                        </button>
                      )}
                    </div>
                  )}

                  {!isTurn && (
                    <p className="text-[11px] text-slate-400 italic">
                      Esperando que el jugador realice su jugada...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions inside Board */}
            <div className="flex gap-3 text-xs w-full justify-center">
              <button
                onClick={handleSaveGame}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg transition"
                title="Guardar partida"
              >
                <Save size={14} /> Guardar Partida
              </button>
              <button
                onClick={handleBankruptcy}
                disabled={selfObj?.isBankrupt}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded-lg disabled:opacity-50 transition"
              >
                <Trash2 size={14} /> Declararse en Quiebra
              </button>
            </div>
          </div>

          {/* RENDER THE 40 BOARD TILES */}
          {gameState.board.map((tile) => {
            const gridStyle = getTileGridStyle(tile.id);
            const isSelected = selectedTile?.id === tile.id;
            
            // Get players on this tile
            const playersOnTile = gameState.players.filter(p => p.position === tile.id && !p.isBankrupt);

            return (
              <div
                key={tile.id}
                style={gridStyle}
                onClick={() => setSelectedTile(tile)}
                className={`relative flex flex-col justify-between border border-slate-350 p-1 cursor-pointer select-none overflow-hidden transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-rose-500 z-10 scale-[1.02]' : 'hover:bg-slate-100'
                } bg-slate-100 text-slate-900`}
              >
                {/* Colored banner for properties */}
                {tile.type === 'property' && (
                  <div className={`h-2 sm:h-3 w-full rounded-sm ${getGroupColorClass(tile.group || '')}`} />
                )}

                {/* Main details */}
                <div className="flex-1 flex flex-col justify-between text-center mt-0.5">
                  <span className="text-[7px] sm:text-[9px] font-bold leading-tight uppercase block max-w-full truncate">
                    {tile.name}
                  </span>
                  
                  {/* Houses / Hotels Indicator */}
                  {tile.houses > 0 && (
                    <div className="flex justify-center gap-0.5 my-0.5">
                      {tile.houses === 5 ? (
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-sm flex items-center justify-center text-[5px] text-white font-bold">H</div>
                      ) : (
                        Array.from({ length: tile.houses }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                        ))
                      )}
                    </div>
                  )}

                  {/* Render Tile Cost/Status */}
                  {tile.price && (
                    <span className="text-[6px] sm:text-[8px] font-mono text-slate-500 mt-auto">
                      {tile.mortgaged ? (
                        <span className="text-red-500 font-semibold">HIPOTECADA</span>
                      ) : tile.owner ? (
                        <span className="text-blue-600 font-semibold truncate max-w-full block">@{tile.owner}</span>
                      ) : (
                        `S/. ${tile.price}`
                      )}
                    </span>
                  )}
                  {tile.cost && (
                    <span className="text-[6px] sm:text-[8px] font-mono text-red-500 mt-auto">
                      Pagas S/.{tile.cost}
                    </span>
                  )}
                </div>

                {/* Render players inside this tile */}
                {playersOnTile.length > 0 && (
                  <div className="absolute bottom-1 right-1 flex flex-wrap gap-0.5 max-w-[80%] z-20">
                    {playersOnTile.map((p, idx) => (
                      <div
                        key={idx}
                        style={{ backgroundColor: p.color }}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white flex items-center justify-center text-[7px] sm:text-[9px] font-bold text-white shadow-md"
                        title={p.username}
                      >
                        {p.username.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Players Lists, Selected Property Details, Logs & Chat */}
      <div className="w-full xl:w-[420px] bg-slate-900 flex flex-col h-full border-l border-slate-800">
        
        {/* Top: Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-bold text-sm text-slate-200">Monopolio Chicha</h2>
          </div>
          <button 
            onClick={() => { setGameState(null); setRoomCode(''); }}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Salir de la Sala
          </button>
        </div>

        {/* Middle Scrollable Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Players List with Cash */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Jugadores</h3>
            <div className="space-y-2">
              {gameState.players.map((p, idx) => {
                const isCurrentTurn = gameState.turnIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                      isCurrentTurn 
                        ? 'bg-slate-900 border-rose-500 current-turn-active' 
                        : p.isBankrupt 
                          ? 'opacity-40 bg-slate-950 border-slate-950'
                          : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <div>
                        <span className={`text-sm font-bold block ${p.isBankrupt ? 'line-through' : ''}`}>
                          {p.username} {p.username === user.username ? '(Tú)' : ''}
                        </span>
                        {p.inJail && (
                          <span className="text-[9px] text-red-400 font-semibold uppercase">COMISARÍA</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {p.isBankrupt ? (
                        <span className="text-xs text-red-500 font-bold uppercase">QUIEBRA</span>
                      ) : (
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          S/. {p.cash}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Tile Inspector Panel */}
          {selectedTile && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div className="flex justify-between items-start mb-3 border-b border-slate-850 pb-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Ficha de Propiedad</h4>
                  <h3 className="text-lg font-black text-slate-100 mt-0.5">{selectedTile.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTile(null)} 
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Cerrar
                </button>
              </div>

              {/* Property attributes */}
              {selectedTile.type === 'property' && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grupo:</span>
                    <span className="font-bold uppercase" style={{ color: getGroupColorClass(selectedTile.group || '') }}>
                      {selectedTile.group}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precio de compra:</span>
                    <span className="font-bold text-white font-mono">S/. {selectedTile.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alquiler Base:</span>
                    <span className="font-bold text-white font-mono">S/. {selectedTile.rent?.[0]}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-1.5">
                    <span className="text-slate-400">Esteras (Casas) Edificadas:</span>
                    <span className="font-bold text-white">{selectedTile.houses === 5 ? 'Hotel' : selectedTile.houses}</span>
                  </div>
                  
                  {/* Actions for owner */}
                  {selectedTile.owner === user.username && !selfObj?.isBankrupt && (
                    <div className="pt-3 flex flex-wrap gap-2 border-t border-slate-900">
                      {/* Build house button */}
                      {selectedTile.houses < 5 && !selectedTile.mortgaged && (
                        <button
                          onClick={() => handleBuildHouse(selectedTile.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded text-center"
                        >
                          Construir Esteras (S/. {selectedTile.housePrice})
                        </button>
                      )}

                      {/* Mortgage Button */}
                      {!selectedTile.mortgaged ? (
                        <button
                          onClick={() => handleMortgage(selectedTile.id)}
                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-3 rounded text-center"
                        >
                          Hipotecar (+S/. {selectedTile.mortgageValue})
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnmortgage(selectedTile.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded text-center"
                        >
                          Deshipotecar (-S/. {Math.round((selectedTile.mortgageValue || 0) * 1.1)})
                        </button>
                      )}
                    </div>
                  )}

                  {selectedTile.owner && selectedTile.owner !== user.username && (
                    <div className="p-2 bg-slate-900 border border-slate-850 rounded">
                      <p className="text-[10px] text-slate-400">
                        Propiedad de: <span className="font-bold text-blue-400">@{selectedTile.owner}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedTile.type !== 'property' && selectedTile.description && (
                <p className="text-xs text-slate-400 italic bg-slate-900 p-2.5 rounded border border-slate-850">
                  {selectedTile.description}
                </p>
              )}
            </div>
          )}

          {/* Game Logs Feed */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col h-44">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registro de la Partida</h3>
            <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] font-mono text-slate-300 pr-1">
              {gameState.log.map((log, idx) => (
                <div key={idx} className="border-b border-slate-900/50 pb-1">
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>

        {/* Bottom: Chat Area */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 flex flex-col h-60">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chat de Causes</h3>
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-xs pr-1">
            {chatMessages.length === 0 ? (
              <p className="text-slate-500 italic text-[11px]">No hay mensajes en el chat aún.</p>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className="bg-slate-900/50 p-2 rounded border border-slate-900">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-rose-400">@{msg.username}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-200">{msg.text}</p>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={sendChatMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-500 transition"
              required
            />
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-500 p-2 rounded-lg text-white transition"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

export default App;
