import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatCompactTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const FloatingTimerToolbar: React.FC = () => {
  const { timerState, pauseTimer, resumeTimer, stopTimer, resetTimer, isTimerVisible, setTimerVisible } = useTimer();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: 120 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showExplosion, setShowExplosion] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effects for animations and timer completion
  useEffect(() => {
    // Show explosion animation when timer completes
    if (timerState.time === 0 && !timerState.isRunning && timerState.mode === 'timer') {
      setShowExplosion(true);
      timerRef.current = setTimeout(() => setShowExplosion(false), 2000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerState.time, timerState.isRunning, timerState.mode]);

  // Improved drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    // Add visual feedback
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Better boundary constraints
    const maxX = window.innerWidth - (isHovered ? 100 : 30);
    const maxY = window.innerHeight - (isHovered ? 100 : 30);
    const minX = isHovered ? 100 : 30;
    const minY = isHovered ? 100 : 30;
    
    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    const maxX = window.innerWidth - (isHovered ? 100 : 30);
    const maxY = window.innerHeight - (isHovered ? 100 : 30);
    const minX = isHovered ? 100 : 30;
    const minY = isHovered ? 100 : 30;
    
    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset, isHovered]);

  if (!timerState.isActive || !isTimerVisible) {
    return null;
  }

  const progress = timerState.mode === 'timer' && timerState.initialTime > 0
    ? ((timerState.initialTime - timerState.time) / timerState.initialTime) * 100
    : 0;

  const isLowTime = timerState.mode === 'timer' && timerState.time <= 5 && timerState.time > 0;
  const circleSize = isHovered ? 200 : 60;

  return (
    <>
      {/* Main floating circle */}
      <div 
        ref={dragRef}
        className={`fixed z-50 transition-all duration-300 ease-out ${
          isDragging ? 'scale-110 cursor-grabbing' : 'cursor-grab hover:cursor-grab'
        } ${isLowTime ? 'animate-pulse' : ''}`}
        style={{ 
          left: position.x - circleSize / 2, 
          top: position.y - circleSize / 2,
          width: circleSize,
          height: circleSize
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Circle with progress ring */}
        <div className={`relative w-full h-full rounded-full transition-all duration-300 ${
          isLowTime 
            ? 'bg-red-500/20 border-2 border-red-400 shadow-lg shadow-red-500/50 animate-pulse' 
            : 'backdrop-blur-md bg-black/30 border-2 border-white/20 shadow-xl'
        }`}>
          
          {/* Progress ring */}
          {timerState.mode === 'timer' && timerState.initialTime > 0 && (
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isLowTime ? "#ef4444" : "#6366f1"}
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
                style={{
                  filter: isLowTime ? 'drop-shadow(0 0 8px #ef4444)' : 'none'
                }}
              />
            </svg>
          )}

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!isHovered ? (
              <div className="text-center">
                <div className={`font-mono font-bold transition-all duration-300 ${
                  isLowTime 
                    ? 'text-red-300 text-sm animate-bounce' 
                    : 'text-white text-xs'
                }`}>
                  {formatCompactTime(timerState.time)}
                </div>
                <div className={`w-2 h-2 rounded-full mx-auto mt-1 transition-all duration-300 ${
                  timerState.isRunning 
                    ? (isLowTime ? 'bg-red-400 animate-pulse' : 'bg-green-400 animate-pulse') 
                    : 'bg-yellow-400'
                }`} />
              </div>
            ) : (
              /* Expanded controls */
              <div className="p-4 text-center space-y-3">
                <div className="text-white/80 text-xs font-medium">
                  {timerState.mode === 'timer' ? 'Timer' : 'Stopwatch'}
                </div>
                
                <div className="text-white font-mono text-sm font-bold">
                  {formatTime(timerState.time)}
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      timerState.isRunning ? pauseTimer() : resumeTimer();
                    }}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {timerState.isRunning ? (
                      <Pause className="w-3 h-3 text-white" />
                    ) : (
                      <Play className="w-3 h-3 text-white" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetTimer();
                    }}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 text-white" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stopTimer();
                    }}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Square className="w-3 h-3 text-white" />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimerVisible(false);
                  }}
                  className="text-white/60 text-xs hover:text-white transition-colors"
                >
                  Hide
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explosion animation */}
      {showExplosion && (
        <div 
          className="fixed z-40 pointer-events-none"
          style={{ 
            left: position.x - 100, 
            top: position.y - 100,
            width: 200,
            height: 200
          }}
        >
          <div className="relative w-full h-full">
            {/* Explosion particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-ping"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-50px)`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
            
            {/* Central burst */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 animate-ping opacity-75" />
              <div className="absolute w-8 h-8 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Heartbeat overlay for low time */}
      {isLowTime && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          <div 
            className="absolute rounded-full border-4 border-red-500/30 animate-ping"
            style={{
              left: position.x - 80,
              top: position.y - 80,
              width: 160,
              height: 160
            }}
          />
        </div>
      )}
    </>
  );
};