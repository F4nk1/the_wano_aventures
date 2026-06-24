import React, { useEffect, useState } from 'react';

interface DiceDisplayProps {
  dice: [number, number];
}

const DiceFace: React.FC<{ value: number }> = ({ value }) => {
  const getDotPositions = (val: number) => {
    switch (val) {
      case 1:
        return [{ row: 2, col: 2 }];
      case 2:
        return [{ row: 1, col: 1 }, { row: 3, col: 3 }];
      case 3:
        return [{ row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }];
      case 4:
        return [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }];
      case 5:
        return [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 3 }];
      case 6:
        return [
          { row: 1, col: 1 }, { row: 1, col: 3 },
          { row: 2, col: 1 }, { row: 2, col: 3 },
          { row: 3, col: 1 }, { row: 3, col: 3 }
        ];
      default:
        return [];
    }
  };

  const dots = getDotPositions(value);

  return (
    <div className="w-12 h-12 bg-[var(--board-bg)] border-2 border-[var(--board-border)] rounded-xl flex items-center justify-center relative shadow-lg">
      <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 gap-0.5">
        {Array.from({ length: 9 }).map((_, idx) => {
          const row = Math.floor(idx / 3) + 1;
          const col = (idx % 3) + 1;
          const hasDot = dots.some(d => d.row === row && d.col === col);
          
          return (
            <div key={idx} className="flex items-center justify-center">
              {hasDot && (
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--board-border-dark)] shadow-sm animate-in fade-in zoom-in duration-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ dice }) => {
  const [rolling, setRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<[number, number]>(dice);

  useEffect(() => {
    // Run shuffling simulation whenever dice props change
    setRolling(true);
    let counter = 0;
    const interval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      counter++;
      if (counter > 6) {
        clearInterval(interval);
        setDisplayDice(dice);
        setRolling(false);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [dice]);

  return (
    <div className="flex gap-4 justify-center items-center py-2">
      <div className={rolling ? 'animate-dice-spin' : ''}>
        <DiceFace value={displayDice[0] || 1} />
      </div>
      <div className={rolling ? 'animate-dice-spin' : ''}>
        <DiceFace value={displayDice[1] || 1} />
      </div>
    </div>
  );
};

export default DiceDisplay;
