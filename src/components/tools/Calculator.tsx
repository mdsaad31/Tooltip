import React, { useState, useEffect, useCallback } from 'react';
import { Delete, History, Settings, MemoryStick } from 'lucide-react';
import { GlassCard, GlassButton, GlassPanel, GlassModal } from '../ui/GlassComponents';

interface CalculatorProps {
  className?: string;
}

type Operation = '+' | '-' | '*' | '/' | '=' | '^' | null;
type CalculatorMode = 'basic' | 'scientific' | 'programmer';

interface MemoryState {
  value: number;
  isEmpty: boolean;
}

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: Operation;
  waitingForOperand: boolean;
  history: string[];
  mode: CalculatorMode;
  memory: MemoryState;
  angleUnit: 'deg' | 'rad';
}

export const Calculator: React.FC<CalculatorProps> = ({ className = '' }) => {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
    history: [],
    mode: 'basic',
    memory: { value: 0, isEmpty: true },
    angleUnit: 'deg'
  });

  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Calculator operations
  const calculate = useCallback((firstValue: number, secondValue: number, operation: Operation): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '^':
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  }, []);

  const addToHistory = useCallback((expression: string) => {
    setState(prev => ({
      ...prev,
      history: [expression, ...prev.history.slice(0, 9)] // Keep last 10 entries
    }));
  }, []);

  const inputNumber = useCallback((num: string) => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: num,
          waitingForOperand: false
        };
      }
      
      const newDisplay = prev.display === '0' ? num : prev.display + num;
      return {
        ...prev,
        display: newDisplay.length <= 12 ? newDisplay : prev.display
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false
        };
      }
      
      if (prev.display.indexOf('.') === -1) {
        return {
          ...prev,
          display: prev.display + '.'
        };
      }
      
      return prev;
    });
  }, []);

  const clear = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: []
    }));
  }, []);

  const performOperation = useCallback((nextOperation: Operation) => {
    setState(prev => {
      const inputValue = parseFloat(prev.display);

      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: inputValue,
          operation: nextOperation,
          waitingForOperand: true
        };
      }

      if (prev.operation && prev.waitingForOperand) {
        return {
          ...prev,
          operation: nextOperation
        };
      }

      const result = calculate(prev.previousValue, inputValue, prev.operation);
      const expression = `${prev.previousValue} ${prev.operation} ${inputValue} = ${result}`;
      
      if (nextOperation === '=') {
        addToHistory(expression);
      }

      return {
        ...prev,
        display: String(result),
        previousValue: nextOperation === '=' ? null : result,
        operation: nextOperation === '=' ? null : nextOperation,
        waitingForOperand: true
      };
    });
  }, [calculate, addToHistory]);

  const percentage = useCallback(() => {
    setState(prev => {
      const value = parseFloat(prev.display) / 100;
      return {
        ...prev,
        display: String(value)
      };
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState(prev => {
      if (prev.display === '0') return prev;
      return {
        ...prev,
        display: prev.display.startsWith('-') 
          ? prev.display.slice(1)
          : '-' + prev.display
      };
    });
  }, []);

  const squareRoot = useCallback(() => {
    setState(prev => {
      const value = parseFloat(prev.display);
      const result = Math.sqrt(value);
      return {
        ...prev,
        display: String(result)
      };
    });
  }, []);

  const square = useCallback(() => {
    setState(prev => {
      const value = parseFloat(prev.display);
      const result = value * value;
      return {
        ...prev,
        display: String(result)
      };
    });
  }, []);

  // Memory operations
  const memoryStore = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: { value: parseFloat(prev.display), isEmpty: false }
    }));
  }, []);

  const memoryRecall = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: String(prev.memory.value),
      waitingForOperand: false
    }));
  }, []);

  const memoryClear = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: { value: 0, isEmpty: true }
    }));
  }, []);

  const memoryAdd = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: {
        value: prev.memory.value + parseFloat(prev.display),
        isEmpty: false
      }
    }));
  }, []);

  const memorySubtract = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: {
        value: prev.memory.value - parseFloat(prev.display),
        isEmpty: false
      }
    }));
  }, []);

  // Scientific functions
  const toRadians = useCallback((degrees: number): number => {
    return degrees * (Math.PI / 180);
  }, []);

  const scientificFunction = useCallback((func: string) => {
    setState(prev => {
      const value = parseFloat(prev.display);
      let result: number;

      switch (func) {
        case 'sin':
          result = Math.sin(prev.angleUnit === 'deg' ? toRadians(value) : value);
          break;
        case 'cos':
          result = Math.cos(prev.angleUnit === 'deg' ? toRadians(value) : value);
          break;
        case 'tan':
          result = Math.tan(prev.angleUnit === 'deg' ? toRadians(value) : value);
          break;
        case 'log':
          result = Math.log10(value);
          break;
        case 'ln':
          result = Math.log(value);
          break;
        case 'exp':
          result = Math.exp(value);
          break;
        case 'factorial':
          result = value <= 0 ? 1 : Array.from({ length: Math.floor(value) }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
          break;
        case 'reciprocal':
          result = value !== 0 ? 1 / value : 0;
          break;
        case 'pi':
          result = Math.PI;
          break;
        case 'e':
          result = Math.E;
          break;
        default:
          result = value;
      }

      return {
        ...prev,
        display: String(result)
      };
    });
  }, [toRadians]);

  const setMode = useCallback((mode: CalculatorMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const backspace = useCallback(() => {
    setState(prev => {
      if (prev.display.length > 1) {
        return {
          ...prev,
          display: prev.display.slice(0, -1)
        };
      }
      return {
        ...prev,
        display: '0'
      };
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;
      
      event.preventDefault();
      
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(key)) {
        performOperation(key as Operation);
      } else if (key === '^') {
        performOperation('^');
      } else if (key === 'Enter' || key === '=') {
        performOperation('=');
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
      } else if (key === 'Backspace') {
        backspace();
      } else if (key === '%') {
        percentage();
      } else if (key === 's' && event.ctrlKey) {
        event.preventDefault();
        memoryStore();
      } else if (key === 'r' && event.ctrlKey) {
        event.preventDefault();
        memoryRecall();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [inputNumber, inputDecimal, performOperation, clear, backspace, percentage, memoryStore, memoryRecall]);

  const ButtonGrid = () => (
    <div className="grid grid-cols-4 gap-3">
      {/* Row 1 */}
      <GlassButton variant="secondary" onClick={clear}>AC</GlassButton>
      <GlassButton variant="secondary" onClick={toggleSign}>±</GlassButton>
      <GlassButton variant="secondary" onClick={percentage}>%</GlassButton>
      <GlassButton variant="primary" onClick={() => performOperation('/')}>÷</GlassButton>

      {/* Row 2 */}
      <GlassButton variant="secondary" onClick={() => inputNumber('7')}>7</GlassButton>
      <GlassButton variant="secondary" onClick={() => inputNumber('8')}>8</GlassButton>
      <GlassButton variant="secondary" onClick={() => inputNumber('9')}>9</GlassButton>
      <GlassButton variant="primary" onClick={() => performOperation('*')}>×</GlassButton>

      {/* Row 3 */}
      <GlassButton variant="secondary" onClick={() => inputNumber('4')}>4</GlassButton>
      <GlassButton variant="secondary" onClick={() => inputNumber('5')}>5</GlassButton>
      <GlassButton variant="secondary" onClick={() => inputNumber('6')}>6</GlassButton>
      <GlassButton variant="primary" onClick={() => performOperation('-')}>−</GlassButton>

      {/* Row 4 */}
      <GlassButton variant="secondary" onClick={() => inputNumber('1')}>1</GlassButton>
      <GlassButton variant="secondary" onClick={() => inputNumber('2')}>2</GlassButton>
      <GlassButton variant="secondary" onClick={() => inputNumber('3')}>3</GlassButton>
      <GlassButton variant="primary" onClick={() => performOperation('+')}>+</GlassButton>

      {/* Row 5 */}
      <GlassButton variant="secondary" className="col-span-2" onClick={() => inputNumber('0')}>0</GlassButton>
      <GlassButton variant="secondary" onClick={inputDecimal}>.</GlassButton>
      <GlassButton variant="primary" onClick={() => performOperation('=')}>=</GlassButton>
    </div>
  );

  const MemoryButtons = () => (
    <div className="grid grid-cols-5 gap-2 mt-3">
      <GlassButton variant="ghost" size="sm" onClick={memoryClear} disabled={state.memory.isEmpty}>
        MC
      </GlassButton>
      <GlassButton variant="ghost" size="sm" onClick={memoryRecall} disabled={state.memory.isEmpty}>
        MR
      </GlassButton>
      <GlassButton variant="ghost" size="sm" onClick={memoryStore}>
        MS
      </GlassButton>
      <GlassButton variant="ghost" size="sm" onClick={memoryAdd}>
        M+
      </GlassButton>
      <GlassButton variant="ghost" size="sm" onClick={memorySubtract}>
        M-
      </GlassButton>
    </div>
  );

  const ScientificButtons = () => (
    <div className="space-y-3 mt-3">
      <div className="grid grid-cols-4 gap-2">
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('sin')}>sin</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('cos')}>cos</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('tan')}>tan</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => performOperation('^')}>x^y</GlassButton>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('log')}>log</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('ln')}>ln</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('exp')}>e^x</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('factorial')}>x!</GlassButton>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <GlassButton variant="ghost" size="sm" onClick={squareRoot}>√</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={square}>x²</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('reciprocal')}>1/x</GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => scientificFunction('pi')}>π</GlassButton>
      </div>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <GlassPanel
        title="Calculator"
        subtitle="Full-featured calculator with history"
        icon={<span className="text-lg">🧮</span>}
        actions={
          <div className="flex space-x-1">
            <GlassButton
              variant={state.mode === 'basic' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('basic')}
            >
              Basic
            </GlassButton>
            <GlassButton
              variant={state.mode === 'scientific' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('scientific')}
            >
              Scientific
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<History className="w-4 h-4" />}
              onClick={() => setShowHistory(!showHistory)}
            >
              History
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
        <div className="space-y-4">
          {/* Display */}
          <GlassCard size="sm" className="text-right">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm">
                {!state.memory.isEmpty && (
                  <span className="text-blue-400 flex items-center">
                    <MemoryStick className="w-4 h-4 mr-1" />M
                  </span>
                )}
                {state.mode === 'scientific' && (
                  <span className="text-white/60">{state.angleUnit.toUpperCase()}</span>
                )}
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<Delete className="w-4 h-4" />}
                onClick={backspace}
              >
                ⌫
              </GlassButton>
            </div>
            <div className="text-3xl font-mono text-white break-all">
              {state.display}
            </div>
            {state.operation && state.previousValue !== null && (
              <div className="text-sm text-white/60 mt-1">
                {state.previousValue} {state.operation}
              </div>
            )}
          </GlassCard>

          {/* History Panel */}
          {showHistory && (
            <GlassCard size="sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/80 text-sm font-medium">History</span>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  disabled={state.history.length === 0}
                >
                  Clear
                </GlassButton>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.history.length > 0 ? (
                  state.history.map((entry, index) => (
                    <div key={index} className="text-white/70 text-sm font-mono">
                      {entry}
                    </div>
                  ))
                ) : (
                  <div className="text-white/50 text-sm text-center py-2">
                    No calculations yet
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {/* Memory Buttons */}
          <MemoryButtons />

          {/* Button Grid */}
          <ButtonGrid />
          
          {/* Scientific Functions */}
          {state.mode === 'scientific' && <ScientificButtons />}

          {/* Keyboard Shortcuts Info */}
          <div className="text-white/40 text-xs text-center mt-4">
            Use keyboard: Numbers, +, -, *, /, Enter/=, Esc (clear), % (percent)
          </div>
        </div>
      </GlassPanel>

      {/* Settings Modal */}
      {showSettings && (
        <GlassModal
          title="Calculator Settings"
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Angle Unit (Scientific Mode)
              </label>
              <div className="flex space-x-2">
                <GlassButton
                  variant={state.angleUnit === 'deg' ? 'primary' : 'ghost'}
                  onClick={() => setState(prev => ({ ...prev, angleUnit: 'deg' }))}
                >
                  Degrees
                </GlassButton>
                <GlassButton
                  variant={state.angleUnit === 'rad' ? 'primary' : 'ghost'}
                  onClick={() => setState(prev => ({ ...prev, angleUnit: 'rad' }))}
                >
                  Radians
                </GlassButton>
              </div>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Memory Status
              </label>
              <div className="text-white/60 text-sm">
                {state.memory.isEmpty ? 'Memory is empty' : `Memory: ${state.memory.value}`}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Calculator Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <GlassButton
                  variant={state.mode === 'basic' ? 'primary' : 'ghost'}
                  onClick={() => setMode('basic')}
                >
                  Basic
                </GlassButton>
                <GlassButton
                  variant={state.mode === 'scientific' ? 'primary' : 'ghost'}
                  onClick={() => setMode('scientific')}
                >
                  Scientific
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};