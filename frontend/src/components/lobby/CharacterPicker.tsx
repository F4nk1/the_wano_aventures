import React from 'react';
import { Card } from '../ui/Card';

export const CHARACTER_CLASSES = [
  { 
    id: 'emprendedor', 
    name: 'El Emprendedor', 
    desc: 'Descuento del 15% al comprar paraderos y construir.',
    color: 'var(--chicha-cyan)'
  },
  { 
    id: 'cobrador', 
    name: 'El Cobrador', 
    desc: 'Cobra doble alquiler en paraderos de transporte.',
    color: 'var(--chicha-yellow)'
  },
  { 
    id: 'tramitador', 
    name: 'El Tramitador', 
    desc: 'La fianza en la comisaria se reduce a la mitad (S/. 25).',
    color: 'var(--chicha-lime)'
  },
  { 
    id: 'urraco', 
    name: 'El Urraco', 
    desc: 'Roba S/. 50 a cualquier causa que caiga en cartas de ampay.',
    color: 'var(--chicha-magenta)'
  },
  { 
    id: 'organizador', 
    name: 'El Organizador', 
    desc: 'Arma polladas solidarias si su saldo baja de S/. 100.',
    color: 'var(--chicha-orange)'
  }
] as const;

export type CharacterClassId = typeof CHARACTER_CLASSES[number]['id'];

interface CharacterPickerProps {
  selectedClass: CharacterClassId;
  onSelect: (id: CharacterClassId) => void;
}

export const CharacterPicker: React.FC<CharacterPickerProps> = ({ selectedClass, onSelect }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
        Selecciona tu Personaje
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {CHARACTER_CLASSES.map((cls) => {
          const isSelected = selectedClass === cls.id;
          return (
            <Card
              key={cls.id}
              onClick={() => onSelect(cls.id)}
              className={`cursor-pointer p-4 flex flex-col items-center text-center gap-3 border-2 transition-all duration-200 ${
                isSelected 
                  ? 'border-[var(--border-active)] bg-[var(--bg-elevated)] ring-1 ring-[var(--border-active)]' 
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--text-muted)]'
              }`}
            >
              {/* Token Preview */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 shadow-inner"
                style={{ backgroundColor: cls.color }}
              >
                {/* Simplified vector path representing the class inside preview */}
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-white drop-shadow-md">
                  {cls.id === 'emprendedor' && (
                    <path d="M6 14.5a6 6 0 0 1 12 0v1H6v-1zm6-9.5v3.5m-3-2.5v2m6-2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                  )}
                  {cls.id === 'cobrador' && (
                    <path d="M5 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm2 10v2m10-2v2m-11-6h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  )}
                  {cls.id === 'tramitador' && (
                    <path d="M12 4v16m-7-5 7-2 7 2M5 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  )}
                  {cls.id === 'urraco' && (
                    <path d="M19 16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2.5l1.5-2.5h2L14.5 7H17a2 2 0 0 1 2 2v7zm-7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  )}
                  {cls.id === 'organizador' && (
                    <path d="M12 4a3 3 0 0 1 3 3c0 2.5-3 5-3 5s-3-2.5-3-3a3 3 0 0 1 3-3zm0 8v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  )}
                </svg>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">
                  {cls.name}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium leading-relaxed">
                  {cls.desc}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default CharacterPicker;
