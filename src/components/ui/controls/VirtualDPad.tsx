import React, { useRef, useCallback } from 'react';

interface VirtualDPadProps {
  onDirectionPress: (direction: 'up' | 'down' | 'left' | 'right') => void;
  className?: string;
}

export default function VirtualDPad({ onDirectionPress, className = '' }: VirtualDPadProps) {
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleTouchStart = useCallback((direction: 'up' | 'down' | 'left' | 'right', e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    activeButtonRef.current = e.currentTarget;
    e.currentTarget.classList.add('scale-95', 'bg-white/20');
    onDirectionPress(direction);
  }, [onDirectionPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (activeButtonRef.current) {
      activeButtonRef.current.classList.remove('scale-95', 'bg-white/20');
      activeButtonRef.current = null;
    }
  }, []);

  const handleMouseDown = useCallback((direction: 'up' | 'down' | 'left' | 'right', e: React.MouseEvent<HTMLButtonElement>) => {
    activeButtonRef.current = e.currentTarget;
    e.currentTarget.classList.add('scale-95', 'bg-white/20');
    onDirectionPress(direction);
  }, [onDirectionPress]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeButtonRef.current) {
      activeButtonRef.current.classList.remove('scale-95', 'bg-white/20');
      activeButtonRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeButtonRef.current === e.currentTarget) {
      e.currentTarget.classList.remove('scale-95', 'bg-white/20');
      activeButtonRef.current = null;
    }
  }, []);

  const buttonBaseClass = "w-16 h-16 bg-white/10 hover:bg-white/15 active:bg-white/20 active:scale-95 rounded-xl flex items-center justify-center transition-all duration-75 touch-none select-none";

  return (
    <div className={`relative w-52 h-52 ${className}`} style={{ touchAction: 'none' }}>
      {/* Up Button */}
      <button
        className={`${buttonBaseClass} absolute top-0 left-1/2 -translate-x-1/2`}
        onTouchStart={(e) => handleTouchStart('up', e)}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={(e) => handleMouseDown('up', e)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        aria-label="Move up"
        tabIndex={0}
      >
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Down Button */}
      <button
        className={`${buttonBaseClass} absolute bottom-0 left-1/2 -translate-x-1/2`}
        onTouchStart={(e) => handleTouchStart('down', e)}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={(e) => handleMouseDown('down', e)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        aria-label="Move down"
        tabIndex={0}
      >
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Left Button */}
      <button
        className={`${buttonBaseClass} absolute left-0 top-1/2 -translate-y-1/2`}
        onTouchStart={(e) => handleTouchStart('left', e)}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={(e) => handleMouseDown('left', e)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        aria-label="Move left"
        tabIndex={0}
      >
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Button */}
      <button
        className={`${buttonBaseClass} absolute right-0 top-1/2 -translate-y-1/2`}
        onTouchStart={(e) => handleTouchStart('right', e)}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={(e) => handleMouseDown('right', e)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        aria-label="Move right"
        tabIndex={0}
      >
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Center decorative element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 rounded-full pointer-events-none" />
    </div>
  );
}
