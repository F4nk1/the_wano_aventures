export const CHARACTER_CLASSES = [
  { id: 'emprendedor', name: 'El Emprendedor', desc: 'Descuento del 15% al comprar paraderos y construir.' },
  { id: 'cobrador', name: 'El Cobrador', desc: 'Cobra doble alquiler en paraderos de transporte.' },
  { id: 'tramitador', name: 'El Tramitador', desc: 'La fianza en la comisaria se reduce a la mitad (S/. 25).' },
  { id: 'urraco', name: 'El Urraco', desc: 'Roba S/. 50 a cualquier causa que caiga en cartas de ampay.' },
  { id: 'organizador', name: 'El Organizador', desc: 'Arma polladas solidarias si su saldo baja de S/. 100.' }
] as const;

export type CharacterClassId = typeof CHARACTER_CLASSES[number]['id'];

export const PLAYER_COLORS = [
  '#E91E8C', '#FFD60A', '#00E5CC', '#FF6B2B', '#9D4EDD', '#4EA8FF'
] as const;

export const getInitialBackendUrl = (): string => {
  const stored = localStorage.getItem('monopoly_server_url');
  if (stored) return stored;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  return window.location.origin;
};
