import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface TimerState {
  isActive: boolean;
  isRunning: boolean;
  time: number;
  mode: 'timer' | 'stopwatch';
  initialTime: number;
  label?: string;
}

interface TimerContextType {
  timerState: TimerState;
  startTimer: (initialTime?: number, mode?: 'timer' | 'stopwatch', label?: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  isTimerVisible: boolean;
  setTimerVisible: (visible: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isRunning: false,
    time: 0,
    mode: 'stopwatch',
    initialTime: 0,
  });
  
  const [isTimerVisible, setTimerVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIcCDuP2+/XcykFl3LLzmgzBCJr1uutfA');
    audioRef.current.volume = 0.3;
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          let newTime = prev.time;
          
          if (prev.mode === 'stopwatch') {
            newTime = prev.time + 1;
          } else {
            newTime = prev.time - 1;
            
            // Timer finished
            if (newTime <= 0) {
              // Play notification sound
              if (audioRef.current) {
                audioRef.current.play().catch(console.error);
              }
              
              // Send browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Timer Finished!', {
                  body: prev.label ? `${prev.label} is complete` : 'Your timer has finished',
                  icon: '/favicon.ico'
                });
              }
              
              return {
                ...prev,
                time: 0,
                isRunning: false
              };
            }
          }
          
          return {
            ...prev,
            time: newTime
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const startTimer = useCallback((initialTime = 0, mode: 'timer' | 'stopwatch' = 'stopwatch', label = '') => {
    setTimerState({
      isActive: true,
      isRunning: true,
      time: initialTime,
      mode,
      initialTime,
      label
    });
    setTimerVisible(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      isRunning: false,
      time: 0
    }));
    setTimerVisible(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      time: prev.mode === 'timer' ? prev.initialTime : 0,
      isRunning: false
    }));
  }, []);

  const contextValue: TimerContextType = {
    timerState,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    isTimerVisible,
    setTimerVisible
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};