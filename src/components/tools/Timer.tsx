import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Clock, Plus, Trash2, Volume2, Settings } from 'lucide-react';
import { GlassCard, GlassButton, GlassPanel, GlassInput, GlassModal } from '../ui/GlassComponents';
import { useTimer } from '../../contexts/TimerContext';

interface TimerProps {
  className?: string;
}

type TimerMode = 'stopwatch' | 'timer' | 'pomodoro' | 'multi';

interface SingleTimer {
  id: string;
  name: string;
  time: number;
  initialTime: number;
  isRunning: boolean;
  isCompleted: boolean;
}

interface TimerPreset {
  id: string;
  name: string;
  time: number;
  soundType: SoundType;
}

type SoundType = 'beep' | 'chime' | 'bell' | 'notification' | 'none';

interface TimerState {
  isRunning: boolean;
  time: number; // in seconds
  mode: TimerMode;
  initialTime: number;
  laps: number[];
  pomodoroSession: number;
  isBreak: boolean;
  multiTimers: SingleTimer[];
  presets: TimerPreset[];
  soundType: SoundType;
  volume: number;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const parseTimeInput = (input: string): number => {
  const parts = input.split(':').map(Number);
  if (parts.length === 1) return parts[0] * 60; // minutes to seconds
  if (parts.length === 2) return parts[0] * 60 + parts[1]; // mm:ss
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
  return 0;
};

export const Timer: React.FC<TimerProps> = ({ className = '' }) => {
  const globalTimer = useTimer();
  
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    time: 0,
    mode: 'stopwatch',
    initialTime: 0,
    laps: [],
    pomodoroSession: 1,
    isBreak: false,
    multiTimers: [],
    presets: [
      { id: '1', name: 'Quick Break', time: 5 * 60, soundType: 'chime' },
      { id: '2', name: 'Tea Timer', time: 3 * 60, soundType: 'bell' },
      { id: '3', name: 'Meeting', time: 30 * 60, soundType: 'notification' },
      { id: '4', name: 'Focus Session', time: 45 * 60, soundType: 'beep' },
    ],
    soundType: 'beep',
    volume: 0.5
  });

  const [timeInput, setTimeInput] = useState('25:00');
  const [showSettings, setShowSettings] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetTime, setNewPresetTime] = useState('10:00');
  const [newTimerName, setNewTimerName] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pomodoro settings
  const pomodoroWork = 25 * 60; // 25 minutes
  const pomodoroBreak = 5 * 60; // 5 minutes
  const pomodoroLongBreak = 15 * 60; // 15 minutes

  // Create audio context for notifications
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = useCallback((soundType: SoundType = state.soundType) => {
    if (soundType === 'none') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sound patterns
      const soundConfigs = {
        beep: { frequency: 800, type: 'sine' as OscillatorType, duration: 0.5 },
        chime: { frequency: 523.25, type: 'sine' as OscillatorType, duration: 1.0 }, // C5 note
        bell: { frequency: 659.25, type: 'triangle' as OscillatorType, duration: 2.0 }, // E5 note
        notification: { frequency: 440, type: 'square' as OscillatorType, duration: 0.3 } // A4 note
      };
      
      const config = soundConfigs[soundType] || soundConfigs.beep;
      
      oscillator.frequency.value = config.frequency;
      oscillator.type = config.type;
      
      gainNode.gain.setValueAtTime(state.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
      
      // For chime and bell, add harmony
      if (soundType === 'chime' || soundType === 'bell') {
        setTimeout(() => {
          const harmonyOsc = audioContext.createOscillator();
          const harmonyGain = audioContext.createGain();
          
          harmonyOsc.connect(harmonyGain);
          harmonyGain.connect(audioContext.destination);
          
          harmonyOsc.frequency.value = config.frequency * 1.25; // Perfect fifth
          harmonyOsc.type = config.type;
          
          harmonyGain.gain.setValueAtTime(state.volume * 0.6, audioContext.currentTime);
          harmonyGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration * 0.8);
          
          harmonyOsc.start(audioContext.currentTime);
          harmonyOsc.stop(audioContext.currentTime + config.duration * 0.8);
        }, 200);
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [state.soundType, state.volume]);

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
    playNotificationSound();
  }, [playNotificationSound]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Sync with global timer
  useEffect(() => {
    if (globalTimer.timerState.isActive) {
      setState(prev => ({
        ...prev,
        time: globalTimer.timerState.time,
        isRunning: globalTimer.timerState.isRunning
      }));
    }
  }, [globalTimer.timerState]);

  // Multi-timer tick effect
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        multiTimers: prev.multiTimers.map(timer => {
          if (!timer.isRunning || timer.isCompleted) return timer;
          
          const newTime = Math.max(0, timer.time - 1);
          const justCompleted = newTime === 0 && timer.time > 0;
          
          if (justCompleted) {
            playNotificationSound();
            showNotification(`${timer.name} Complete!`, 'Timer has finished');
          }
          
          return {
            ...timer,
            time: newTime,
            isCompleted: newTime === 0,
            isRunning: newTime > 0
          };
        })
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [playNotificationSound, showNotification]);

  // Handle timer completion for Pomodoro mode
  useEffect(() => {
    if (globalTimer.timerState.time === 0 && !globalTimer.timerState.isRunning && state.mode === 'pomodoro' && state.isRunning) {
      setState(prev => {
        const isWorkSession = !prev.isBreak;
        const nextSession = isWorkSession ? prev.pomodoroSession + 1 : prev.pomodoroSession;
        const isLongBreak = nextSession > 1 && nextSession % 4 === 1;
        
        let newState = { ...prev, isRunning: false };
        
        if (isWorkSession) {
          // Work session finished, start break
          const breakTime = isLongBreak ? pomodoroLongBreak : pomodoroBreak;
          newState.time = breakTime;
          newState.initialTime = breakTime;
          newState.isBreak = true;
          newState.pomodoroSession = nextSession;
          showNotification('Work Session Complete!', `Time for a ${isLongBreak ? 'long' : 'short'} break`);
        } else {
          // Break finished, start work
          newState.time = pomodoroWork;
          newState.initialTime = pomodoroWork;
          newState.isBreak = false;
          showNotification('Break Complete!', 'Time to get back to work');
        }
        
        return newState;
      });
    }
  }, [globalTimer.timerState, state.mode, state.isBreak, state.isRunning, pomodoroWork, pomodoroBreak, pomodoroLongBreak, showNotification]);

  const startStop = useCallback(() => {
    if (state.isRunning) {
      globalTimer.pauseTimer();
      setState(prev => ({ ...prev, isRunning: false }));
    } else {
      // Start global timer based on current mode
      const timerMode = state.mode === 'stopwatch' ? 'stopwatch' : 'timer';
      const initialTime = state.mode === 'stopwatch' ? state.time : state.time;
      const label = state.mode === 'pomodoro' ? 
        (state.isBreak ? 'Pomodoro Break' : `Pomodoro Session ${state.pomodoroSession}`) :
        state.mode === 'timer' ? 'Timer' : 'Stopwatch';
      
      globalTimer.startTimer(initialTime, timerMode, label);
      setState(prev => ({ ...prev, isRunning: true }));
    }
  }, [state, globalTimer]);

  const reset = useCallback(() => {
    globalTimer.resetTimer();
    setState(prev => ({
      ...prev,
      isRunning: false,
      time: prev.mode === 'stopwatch' ? 0 : prev.initialTime,
      laps: []
    }));
  }, [globalTimer]);

  const addLap = useCallback(() => {
    setState(prev => ({
      ...prev,
      laps: [prev.time, ...prev.laps.slice(0, 9)] // Keep last 10 laps
    }));
  }, []);

  const setMode = useCallback((mode: TimerMode) => {
    setState(prev => {
      let newTime = 0;
      let newInitialTime = 0;
      
      if (mode === 'timer') {
        newTime = parseTimeInput(timeInput);
        newInitialTime = newTime;
      } else if (mode === 'pomodoro') {
        newTime = pomodoroWork;
        newInitialTime = pomodoroWork;
      }

      return {
        ...prev,
        mode,
        time: newTime,
        initialTime: newInitialTime,
        isRunning: false,
        laps: [],
        pomodoroSession: mode === 'pomodoro' ? 1 : prev.pomodoroSession,
        isBreak: false
      };
    });
  }, [timeInput, pomodoroWork]);

  const setTimerTime = useCallback(() => {
    const seconds = parseTimeInput(timeInput);
    setState(prev => ({
      ...prev,
      time: seconds,
      initialTime: seconds,
      isRunning: false
    }));
  }, [timeInput]);

  // Multiple Timer Functions
  const addMultiTimer = useCallback(() => {
    const seconds = parseTimeInput(timeInput);
    const name = newTimerName || `Timer ${state.multiTimers.length + 1}`;
    const newTimer: SingleTimer = {
      id: Date.now().toString(),
      name,
      time: seconds,
      initialTime: seconds,
      isRunning: false,
      isCompleted: false
    };
    
    setState(prev => ({
      ...prev,
      multiTimers: [...prev.multiTimers, newTimer]
    }));
    
    setNewTimerName('');
    setTimeInput('05:00');
  }, [timeInput, newTimerName, state.multiTimers.length]);

  const removeMultiTimer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      multiTimers: prev.multiTimers.filter(timer => timer.id !== id)
    }));
  }, []);

  const toggleMultiTimer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      multiTimers: prev.multiTimers.map(timer => 
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    }));
  }, []);

  const resetMultiTimer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      multiTimers: prev.multiTimers.map(timer => 
        timer.id === id ? { 
          ...timer, 
          time: timer.initialTime, 
          isRunning: false,
          isCompleted: false 
        } : timer
      )
    }));
  }, []);

  // Preset Functions
  const addPreset = useCallback(() => {
    const seconds = parseTimeInput(newPresetTime);
    const preset: TimerPreset = {
      id: Date.now().toString(),
      name: newPresetName,
      time: seconds,
      soundType: state.soundType
    };
    
    setState(prev => ({
      ...prev,
      presets: [...prev.presets, preset]
    }));
    
    setNewPresetName('');
    setNewPresetTime('10:00');
    setShowPresets(false);
  }, [newPresetName, newPresetTime, state.soundType]);

  const removePreset = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      presets: prev.presets.filter(preset => preset.id !== id)
    }));
  }, []);

  const usePreset = useCallback((preset: TimerPreset) => {
    setState(prev => ({
      ...prev,
      time: preset.time,
      initialTime: preset.time,
      soundType: preset.soundType,
      isRunning: false
    }));
    setTimeInput(formatTime(preset.time));
  }, []);

  const getProgress = useCallback(() => {
    if (state.mode === 'stopwatch' || state.initialTime === 0) return 0;
    return ((state.initialTime - state.time) / state.initialTime) * 100;
  }, [state.mode, state.time, state.initialTime]);

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <GlassPanel
        title="Timer & Stopwatch"
        subtitle="Multi-purpose timing tool"
        icon={<TimerIcon className="w-5 h-5" />}
        actions={
          <div className="flex flex-wrap gap-1">
            <GlassButton
              variant={state.mode === 'stopwatch' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('stopwatch')}
            >
              Stopwatch
            </GlassButton>
            <GlassButton
              variant={state.mode === 'timer' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('timer')}
            >
              Timer
            </GlassButton>
            <GlassButton
              variant={state.mode === 'pomodoro' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('pomodoro')}
            >
              Pomodoro
            </GlassButton>
            <GlassButton
              variant={state.mode === 'multi' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('multi')}
            >
              Multi
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => setShowSettings(true)}
            >
              Settings
            </GlassButton>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Timer Display */}
          <GlassCard size="lg" className="text-center">
            {state.mode !== 'stopwatch' && state.initialTime > 0 && (
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            )}
            
            <div className="text-5xl font-mono text-white mb-2">
              {formatTime(state.time)}
            </div>
            
            {state.mode === 'pomodoro' && (
              <div className="text-white/70 text-sm">
                Session {state.pomodoroSession} • {state.isBreak ? 'Break Time' : 'Work Time'}
              </div>
            )}
          </GlassCard>

          {/* Timer Input (for timer mode) */}
          {state.mode === 'timer' && !state.isRunning && (
            <div className="flex space-x-2">
              <GlassInput
                placeholder="Enter time (mm:ss or hh:mm:ss)"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="flex-1"
              />
              <GlassButton onClick={setTimerTime}>Set</GlassButton>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <GlassButton
              variant="primary"
              size="lg"
              icon={state.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              onClick={startStop}
              disabled={state.mode !== 'stopwatch' && state.time === 0}
            >
              {state.isRunning ? 'Pause' : 'Start'}
            </GlassButton>
            
            <GlassButton
              variant="secondary"
              size="lg"
              icon={<RotateCcw className="w-6 h-6" />}
              onClick={reset}
            >
              Reset
            </GlassButton>
            
            {state.mode === 'stopwatch' && (
              <GlassButton
                variant="ghost"
                size="lg"
                icon={<Clock className="w-6 h-6" />}
                onClick={addLap}
                disabled={!state.isRunning}
              >
                Lap
              </GlassButton>
            )}
          </div>

          {/* Laps (for stopwatch mode) */}
          {state.mode === 'stopwatch' && state.laps.length > 0 && (
            <GlassCard size="sm">
              <div className="text-white/80 text-sm font-medium mb-3">Laps</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.laps.map((lap, index) => (
                  <div key={index} className="flex justify-between text-white/70 text-sm font-mono">
                    <span>Lap {state.laps.length - index}</span>
                    <span>{formatTime(lap)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Multi-Timer Mode */}
          {state.mode === 'multi' && (
            <>
              {/* Add New Timer */}
              <GlassCard size="sm">
                <div className="text-white/80 text-sm font-medium mb-3">Add New Timer</div>
                <div className="space-y-3">
                  <GlassInput
                    placeholder="Timer name"
                    value={newTimerName}
                    onChange={(e) => setNewTimerName(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <GlassInput
                      placeholder="Time (mm:ss)"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      className="flex-1"
                    />
                    <GlassButton
                      icon={<Plus className="w-4 h-4" />}
                      onClick={addMultiTimer}
                    >
                      Add
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>

              {/* Active Timers */}
              {state.multiTimers.length > 0 && (
                <div className="space-y-3">
                  <div className="text-white/80 text-sm font-medium">Active Timers</div>
                  {state.multiTimers.map((timer) => (
                    <GlassCard key={timer.id} size="sm" className={timer.isCompleted ? 'bg-green-500/10' : ''}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{timer.name}</div>
                          <div className={`text-lg font-mono ${timer.isCompleted ? 'text-green-400' : 'text-white/80'}`}>
                            {formatTime(timer.time)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <GlassButton
                            size="sm"
                            variant={timer.isRunning ? 'secondary' : 'primary'}
                            icon={timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            onClick={() => toggleMultiTimer(timer.id)}
                            disabled={timer.isCompleted}
                          >
                            {timer.isRunning ? 'Pause' : 'Start'}
                          </GlassButton>
                          <GlassButton
                            size="sm"
                            variant="ghost"
                            icon={<RotateCcw className="w-4 h-4" />}
                            onClick={() => resetMultiTimer(timer.id)}
                          >
                            Reset
                          </GlassButton>
                          <GlassButton
                            size="sm"
                            variant="ghost"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => removeMultiTimer(timer.id)}
                          >
                            Remove
                          </GlassButton>
                        </div>
                      </div>
                      {timer.initialTime > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-white/10 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full transition-all duration-1000 ${
                                timer.isCompleted ? 'bg-green-400' : 'bg-white'
                              }`}
                              style={{ width: `${((timer.initialTime - timer.time) / timer.initialTime) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Timer Presets */}
          {(state.mode === 'timer' || state.mode === 'multi') && (
            <GlassCard size="sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white/80 text-sm font-medium">Quick Presets</div>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowPresets(true)}
                >
                  Add
                </GlassButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {state.presets.map((preset) => (
                  <div key={preset.id} className="relative group">
                    <GlassButton
                      size="sm"
                      variant="ghost"
                      onClick={() => usePreset(preset)}
                      className="text-left justify-start w-full"
                    >
                      <div>
                        <div className="text-white/90 text-sm">{preset.name}</div>
                        <div className="text-white/60 text-xs">{formatTime(preset.time)}</div>
                      </div>
                    </GlassButton>
                    {state.presets.length > 4 && (
                      <button
                        onClick={() => removePreset(preset.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600 rounded p-1"
                        title="Remove preset"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Pomodoro Info */}
          {state.mode === 'pomodoro' && (
            <div className="text-white/60 text-xs text-center">
              Work: 25min • Short Break: 5min • Long Break: 15min (every 4 sessions)
            </div>
          )}

          {/* Keyboard Shortcuts Info */}
          <div className="text-white/40 text-xs text-center">
            Space: Start/Pause • R: Reset • L: Lap (stopwatch)
          </div>
        </div>
      </GlassPanel>

      {/* Settings Modal */}
      {showSettings && (
        <GlassModal
          title="Timer Settings"
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Notification Sound
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['beep', 'chime', 'bell', 'notification', 'none'] as SoundType[]).map((sound) => (
                  <GlassButton
                    key={sound}
                    variant={state.soundType === sound ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, soundType: sound }))}
                  >
                    {sound.charAt(0).toUpperCase() + sound.slice(1)}
                  </GlassButton>
                ))}
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-white/60" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state.volume}
                  onChange={(e) => setState(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="flex-1 accent-white"
                />
                <span className="text-white/60 text-sm">{Math.round(state.volume * 100)}%</span>
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => playNotificationSound()}
              >
                Test Sound
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Add Preset Modal */}
      {showPresets && (
        <GlassModal
          title="Add Timer Preset"
          isOpen={showPresets}
          onClose={() => setShowPresets(false)}
        >
          <div className="space-y-4">
            <GlassInput
              placeholder="Preset name"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
            />
            <GlassInput
              placeholder="Time (mm:ss or hh:mm:ss)"
              value={newPresetTime}
              onChange={(e) => setNewPresetTime(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <GlassButton
                variant="ghost"
                onClick={() => setShowPresets(false)}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={addPreset}
                disabled={!newPresetName || !newPresetTime}
              >
                Add Preset
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};