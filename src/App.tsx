import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, CheckSquare, Calendar, Settings, Cog, Timer, 
  Calculator, ArrowRightLeft, Palette, QrCode, File, Type, 
  Plus, Circle, CheckCircle, RotateCcw, Play, Wrench 
} from 'lucide-react';
import './App.css';
import { GlassCard, GlassButton, GlassPanel, GlassModal, GlassInput } from './components/ui/GlassComponents';
import { FloatingDock } from './components/dock/FloatingDock';
import { AppLayout, GridLayout, Container } from './components/layout/Layouts';
import type { DockItem } from './components/dock/FloatingDock';
// Local interfaces for dashboard widgets
interface DashboardNote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  tags: string[];
}

interface DashboardTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  category: string;
}
import { useTimer } from './contexts/TimerContext';
import { FloatingTimerToolbar } from './components/FloatingTimerToolbar';
import { TimeCalendarWidget } from './components/ui/TimeCalendarWidget';

// Import tools
import { Calculator as CalculatorTool } from './components/tools/Calculator';
import { Timer as TimerTool } from './components/tools/Timer';
import { QRCodeGenerator } from './components/tools/QRCodeGenerator';
import { ColorPicker } from './components/tools/ColorPicker';
import { UnitConverter } from './components/tools/UnitConverter';
import { TextTools } from './components/tools/TextTools';
import { FileTools } from './components/tools/FileTools';
import { Calendar as CalendarTool } from './components/tools/Calendar';
import { QuickNotes } from './components/tools/QuickNotes';
import { Tasks } from './components/tools/Tasks';
import { Settings as SettingsPage } from './components/tools/Settings';


// Widget type for dashboard
type Widget = {
  id: string;
  render: () => React.ReactNode;
};

function App() {
  const { timerState, startTimer, pauseTimer, resumeTimer, resetTimer } = useTimer();
  const [currentView, setCurrentView] = useState('dashboard');
  const [notes, setNotes] = useState<DashboardNote[]>([]);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '' });
  


  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load notes from localStorage
        const savedNotes = localStorage.getItem('quick-notes');
        if (savedNotes) {
          const parsed = JSON.parse(savedNotes);
          const notesWithDates = parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            updatedAt: new Date(n.updatedAt)
          }));
          setNotes(notesWithDates.slice(0, 3)); // Show only first 3
        }

        // Load tasks from localStorage
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          const parsed = JSON.parse(savedTasks);
          const tasksWithDates = parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined
          }));
          const activeTasks = tasksWithDates.filter((t: any) => !t.completed).slice(0, 5);
          setTasks(activeTasks);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    // Listen for changes and update data periodically
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Command palette commands
  const commands = [
    { id: 'add-note', label: 'Add New Note', action: () => setShowNoteModal(true), icon: FileText },
    { id: 'add-task', label: 'Add New Task', action: () => setShowTaskModal(true), icon: CheckSquare },
    { id: 'go-dashboard', label: 'Go to Dashboard', action: () => setCurrentView('dashboard'), icon: Home },
    { id: 'go-notes', label: 'Go to Notes', action: () => setCurrentView('notes'), icon: FileText },
    { id: 'go-tasks', label: 'Go to Tasks', action: () => setCurrentView('tasks'), icon: CheckSquare },
    { id: 'go-calendar', label: 'Go to Calendar', action: () => setCurrentView('calendar'), icon: Calendar },
    { id: 'go-utilities', label: 'Go to Utilities', action: () => setCurrentView('utilities'), icon: Settings },
    { id: 'go-settings', label: 'Go to Settings', action: () => setCurrentView('settings'), icon: Cog },
    { id: 'go-focus', label: 'Go to Focus', action: () => setCurrentView('focus'), icon: Timer },
  ];

  // Execute command and close palette
  const executeCommand = (command: typeof commands[0]) => {
    command.action();
    setShowCommandPalette(false);
    setCommandQuery('');
    setSelectedCommandIndex(0);
  };

  // Filter commands based on search query
  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(commandQuery.toLowerCase())
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette shortcut (Cmd+K or Ctrl+K)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowCommandPalette(true);
        setSelectedCommandIndex(0);
      }
      // Escape to close command palette
      if (event.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
        setCommandQuery('');
        setSelectedCommandIndex(0);
      }
      // Arrow navigation and Enter selection in command palette
      if (showCommandPalette) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedCommandIndex(prev => 
            Math.min(prev + 1, filteredCommands.length - 1)
          );
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedCommandIndex(prev => Math.max(prev - 1, 0));
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          if (filteredCommands[selectedCommandIndex]) {
            executeCommand(filteredCommands[selectedCommandIndex]);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, filteredCommands, selectedCommandIndex]);

  // Add note function
  const handleAddNote = () => {
    if (!noteForm.title.trim()) return;
    try {
      const savedNotes = localStorage.getItem('quick-notes');
      const existingNotes = savedNotes ? JSON.parse(savedNotes) : [];
      
      const newNote = {
        id: Date.now().toString(),
        title: noteForm.title.trim(),
        content: noteForm.content.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: false,
        tags: []
      };

      const updatedNotes = [newNote, ...existingNotes];
      localStorage.setItem('quick-notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes.slice(0, 3));
      setNoteForm({ title: '', content: '' });
      setShowNoteModal(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Add task function
  const handleAddTask = () => {
    if (!taskForm.title.trim()) return;
    try {
      const savedTasks = localStorage.getItem('tasks');
      const existingTasks = savedTasks ? JSON.parse(savedTasks) : [];
      
      const newTask = {
        id: Date.now().toString(),
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        category: ''
      };

      const updatedTasks = [newTask, ...existingTasks];
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      const activeTasks = updatedTasks.filter(t => !t.completed).slice(0, 5);
      setTasks(activeTasks);
      setTaskForm({ title: '', description: '' });
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const updatedTasks = tasks.map((task: any) =>
          task.id === taskId
            ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined }
            : task
        );
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        const activeTasks = updatedTasks.filter((t: any) => !t.completed).slice(0, 5);
        setTasks(activeTasks);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const dockItems: DockItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'notes', icon: FileText, label: 'Notes', badge: notes.length || undefined },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks', badge: tasks.length || undefined },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'utilities', icon: Wrench, label: 'Utilities' },
    { id: 'settings', icon: Cog, label: 'Settings' },
    { id: 'focus', icon: Timer, label: 'Focus' },
  ];

  const toolCategories = {
    productivity: {
      label: 'Productivity',
      icon: Settings,
      tools: [
        { id: 'calculator', icon: Calculator, label: 'Calculator' },
        { id: 'timer', icon: Timer, label: 'Timer' },
        { id: 'unit-converter', icon: ArrowRightLeft, label: 'Unit Converter' },
      ]
    },
    design: {
      label: 'Design & Media',
      icon: Palette,
      tools: [
        { id: 'color-picker', icon: Palette, label: 'Color Picker' },
        { id: 'qr-generator', icon: QrCode, label: 'QR Generator' },
        { id: 'file-tools', icon: File, label: 'File Tools' },
      ]
    },
    development: {
      label: 'Development',
      icon: Type,
      tools: [
        { id: 'text-tools', icon: Type, label: 'Text Tools' },
      ]
    }
  };

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedCommandIndex(0);
  }, [commandQuery]);

  // Modular dashboard widgets
  const widgets: Widget[] = [
    {
      id: 'quick-notes',
      render: () => (
        <GlassCard 
          className="group cursor-pointer hover:bg-white/15 transition-all duration-300 p-4 h-full flex flex-col relative overflow-hidden"
          onClick={() => setCurrentView('notes')}
        >
          {/* Header with Icon and Count */}
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-lg group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${notes.length > 0 ? 'bg-green-400' : 'bg-gray-500'}`}></div>
              <span className="text-white/60 text-xs">{notes.length}</span>
            </div>
          </div>
          
          {/* Quick Preview */}
          <div className="flex-1 space-y-2 min-h-0">
            {notes.length > 0 ? (
              notes.slice(0, 2).map(note => (
                <div key={note.id} className="bg-white/5 rounded p-2">
                  <p className="text-white/90 text-xs font-medium truncate">{note.title}</p>
                  <p className="text-white/60 text-xs mt-1 truncate">{note.content}</p>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-xs text-center py-4">
                No notes yet
              </div>
            )}
          </div>
          
          {/* Quick Add Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNoteModal(true);
            }}
            className="mt-2 w-full bg-white/10 hover:bg-white/20 rounded py-2 flex items-center justify-center space-x-1 transition-colors text-xs text-white/80"
          >
            <Plus className="w-3 h-3" />
            <span>Add Note</span>
          </button>
        </GlassCard>
      )
    },
    {
      id: 'todays-tasks',
      render: () => (
        <GlassCard 
          className="group cursor-pointer hover:bg-white/15 transition-all duration-300 p-4 h-full flex flex-col relative overflow-hidden"
          onClick={() => setCurrentView('tasks')}
        >
          {/* Header with Icon and Progress */}
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[0, 1, 2].map(i => {
                  const completed = tasks.filter(t => t.completed).length;
                  return (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${i < completed ? 'bg-green-400' : 'bg-gray-500'}`}
                    />
                  );
                })}
              </div>
              <span className="text-white/60 text-xs">
                {tasks.filter(t => t.completed).length}/{tasks.length}
              </span>
            </div>
          </div>
          
          {/* Quick Preview */}
          <div className="flex-1 space-y-2 min-h-0">
            {tasks.length > 0 ? (
              tasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center space-x-2 bg-white/5 rounded p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTask(task.id);
                    }}
                    className="flex-shrink-0"
                  >
                    {task.completed ? 
                      <CheckCircle className="w-3 h-3 text-green-400" /> :
                      <Circle className="w-3 h-3 text-white/60 hover:text-white/80" />
                    }
                  </button>
                  <span className={`text-xs flex-1 truncate ${task.completed ? 'text-white/60 line-through' : 'text-white/90'}`}>
                    {task.title}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-xs text-center py-4">
                No tasks yet
              </div>
            )}
          </div>
          
          {/* Quick Add Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTaskModal(true);
            }}
            className="mt-2 w-full bg-white/10 hover:bg-white/20 rounded py-2 flex items-center justify-center space-x-1 transition-colors text-xs text-white/80"
          >
            <Plus className="w-3 h-3" />
            <span>Add Task</span>
          </button>
        </GlassCard>
      )
    },
    {
      id: 'productivity-tools',
      render: () => (
        <GlassCard 
          className="group cursor-pointer hover:bg-white/15 transition-all duration-300 p-4 h-full flex flex-col relative overflow-hidden"
          onClick={() => setCurrentView('utilities')}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-lg group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div className="bg-purple-500/30 text-white/80 text-xs px-2 py-1 rounded-full">
              {toolCategories.productivity.tools.length}
            </div>
          </div>
          
          {/* Tool Grid */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            {toolCategories.productivity.tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView(tool.id);
                  }}
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-3 flex flex-col items-center justify-center transition-colors group/tool"
                >
                  <Icon className="w-4 h-4 text-purple-300 mb-2 group-hover/tool:scale-110 transition-transform" />
                  <span className="text-xs text-white/80 text-center leading-tight">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>
      )
    },
    {
      id: 'design-tools',
      render: () => (
        <GlassCard 
          className="group cursor-pointer hover:bg-white/15 transition-all duration-300 p-4 h-full flex flex-col relative overflow-hidden"
          onClick={() => setCurrentView('utilities')}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-lg group-hover:scale-105 transition-transform">
              <Palette className="w-5 h-5 text-pink-400" />
            </div>
            <div className="bg-pink-500/30 text-white/80 text-xs px-2 py-1 rounded-full">
              {toolCategories.design.tools.length}
            </div>
          </div>
          
          {/* Tool Grid */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            {toolCategories.design.tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView(tool.id);
                  }}
                  className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 rounded-lg p-3 flex flex-col items-center justify-center transition-all group/tool"
                >
                  <Icon className="w-4 h-4 text-pink-300 mb-2 group-hover/tool:scale-110 transition-transform" />
                  <span className="text-xs text-white/80 text-center leading-tight">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>
      )
    },
    {
      id: 'focus-session',
      render: () => {
        const formatTime = (seconds: number) => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        const displayTime = timerState.isActive && timerState.mode === 'timer' 
          ? formatTime(timerState.time)
          : '25:00';

        const isRunning = timerState.isActive && timerState.isRunning && timerState.mode === 'timer';
        const isPaused = timerState.isActive && !timerState.isRunning && timerState.mode === 'timer';

        return (
          <GlassCard 
            className="group cursor-pointer hover:bg-white/15 transition-all duration-300 p-4 h-full flex flex-col relative overflow-hidden"
            onClick={() => setCurrentView('focus')}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-lg group-hover:scale-105 transition-transform">
                <Timer className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-green-400 animate-pulse' : 
                  isPaused ? 'bg-yellow-400' : 
                  'bg-orange-400'
                }`}></div>
                <span className="text-white/60 text-xs">
                  {isRunning ? 'Active' : isPaused ? 'Paused' : 'Ready'}
                </span>
              </div>
            </div>
            
            {/* Timer Display */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-white/80 text-2xl font-mono mb-2">{displayTime}</div>
              <div className="text-white/60 text-xs mb-4">Pomodoro Session</div>
            </div>
            
            {/* Controls */}
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (timerState.isActive) {
                    if (timerState.isRunning) {
                      pauseTimer();
                    } else {
                      resumeTimer();
                    }
                  } else {
                    startTimer(25 * 60, 'timer', 'Pomodoro Session'); // 25 minutes
                  }
                }}
                className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg py-2 flex items-center justify-center transition-colors"
              >
                {isRunning ? (
                  <>
                    <div className="w-1 h-4 bg-orange-300 rounded-full mr-1"></div>
                    <div className="w-1 h-4 bg-orange-300 rounded-full"></div>
                  </>
                ) : (
                  <Play className="w-4 h-4 text-orange-300" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetTimer();
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 rounded-lg py-2 flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </GlassCard>
        );
      }
    },

    {
      id: 'recent-files',
      render: () => (
        <GlassCard 
          className="group cursor-pointer hover:bg-white/15 transition-all duration-300 p-4 h-full flex flex-col relative overflow-hidden"
          onClick={() => setCurrentView('file-tools')}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-lg group-hover:scale-105 transition-transform">
              <File className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-white/60 text-xs">0 files</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-white/60 text-sm mb-2">No files processed yet</div>
            <div className="text-white/40 text-xs">Click to open file tools</div>
          </div>
          
          {/* Quick Process Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentView('file-tools');
            }}
            className="mt-2 w-full bg-white/10 hover:bg-white/20 rounded py-2 flex items-center justify-center space-x-1 transition-colors text-xs text-white/80"
          >
            <File className="w-3 h-3" />
            <span>Process File</span>
          </button>
        </GlassCard>
      )
    },
  ];

  const headerContent = (
    <Container>
      <div className="p-6">
        <GlassCard className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Tooltip</h1>
          <p className="text-white/80">All your everyday tools — beautifully unified</p>
        </GlassCard>
      </div>
    </Container>
  );

  const dockContent = (
    <FloatingDock
      items={dockItems}
      activeItemId={currentView}
      onItemClick={setCurrentView}
    />
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Container>
            <div className="p-6">
              <GridLayout columns={3} gap="md">
                {widgets.map(widget => (
                  <React.Fragment key={widget.id}>{widget.render()}</React.Fragment>
                ))}
              </GridLayout>
            </div>
          </Container>
        );
      case 'calculator':
        return <CalculatorTool />;
      case 'timer':
        return <TimerTool />;
      case 'qr-generator':
        return <QRCodeGenerator />;
      case 'color-picker':
        return <ColorPicker />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'text-tools':
        return <TextTools />;
      case 'file-tools':
        return <FileTools />;
      case 'calendar':
        return <CalendarTool />;
      case 'notes':
        return <QuickNotes />;
      case 'tasks':
        return <Tasks />;
      case 'settings':
        return <SettingsPage />;
      case 'utilities':
        return (
          <Container>
            <div className="p-6 space-y-6">
              <GlassCard className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">All Tools</h1>
                <p className="text-white/80">Choose from our collection of professional utilities</p>
              </GlassCard>
              
              {Object.entries(toolCategories).map(([categoryKey, category]) => {
                const CategoryIcon = category.icon;
                return (
                  <GlassPanel
                    key={categoryKey}
                    title={category.label}
                    icon={<CategoryIcon className="w-5 h-5" />}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {category.tools.map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <GlassButton
                            key={tool.id}
                            variant="secondary"
                            className="flex-col space-y-2 h-auto py-4"
                            icon={<ToolIcon className="w-6 h-6" />}
                            onClick={() => setCurrentView(tool.id)}
                          >
                            {tool.label}
                          </GlassButton>
                        );
                      })}
                    </div>
                  </GlassPanel>
                );
              })}
            </div>
          </Container>
        );
      case 'focus':
        return <TimerTool />;
      default:
        return (
          <Container size="md">
            <div className="flex items-center justify-center min-h-96">
              <GlassCard className="text-center max-w-md w-full">
                <div className="mb-4">
                  {(() => {
                    const item = dockItems.find(item => item.id === currentView);
                    if (item) {
                      const Icon = item.icon;
                      return <Icon className="w-16 h-16 text-white/60 mx-auto" />;
                    }
                    return null;
                  })()}
                </div>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {dockItems.find(item => item.id === currentView)?.label}
                </h2>
                <p className="text-white/80 mb-6">This feature is coming soon!</p>
                <GlassButton onClick={() => setCurrentView('dashboard')}>
                  Back to Dashboard
                </GlassButton>
              </GlassCard>
            </div>
          </Container>
        );
    }
  };

  return (
    <>
      <AppLayout 
        header={headerContent}
        dock={dockContent}
      >
        {renderContent()}          {/* Floating Timer Toolbar */}
          <FloatingTimerToolbar />
          
          {/* Time Calendar Widget */}
          <TimeCalendarWidget onCalendarClick={() => setCurrentView('calendar')} />
          
          {/* Command Palette Hint */}
          <div className="fixed bottom-16 sm:bottom-20 left-4 sm:right-4 sm:left-auto z-40">
            <GlassCard size="sm" className="px-2 py-1 sm:px-3 sm:py-2">
              <span className="text-white/80 text-xs">⌘K</span>
            </GlassCard>
          </div>

      {/* Add Note Modal */}
      <GlassModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add New Note"
        size="md"
      >
        <div className="space-y-4">
          <GlassInput
            label="Title"
            placeholder="Enter note title..."
            value={noteForm.title}
            onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
          />
          <GlassInput
            label="Content"
            placeholder="Write your note here..."
            value={noteForm.content}
            onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
          />
          <div className="flex space-x-3 pt-4">
            <GlassButton
              variant="secondary"
              className="flex-1"
              onClick={() => setShowNoteModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              className="flex-1"
              onClick={handleAddNote}
              disabled={!noteForm.title.trim()}
            >
              Add Note
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Add Task Modal */}
      <GlassModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add New Task"
        size="md"
      >
        <div className="space-y-4">
          <GlassInput
            label="Task Title"
            placeholder="Enter task title..."
            value={taskForm.title}
            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
          />
          <GlassInput
            label="Description (Optional)"
            placeholder="Add task details..."
            value={taskForm.description}
            onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex space-x-3 pt-4">
            <GlassButton
              variant="secondary"
              className="flex-1"
              onClick={() => setShowTaskModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              className="flex-1"
              onClick={handleAddTask}
              disabled={!taskForm.title.trim()}
            >
              Add Task
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Command Palette Modal */}
      <GlassModal
        isOpen={showCommandPalette}
        onClose={() => {
          setShowCommandPalette(false);
          setCommandQuery('');
        }}
        title="Command Palette"
        size="lg"
      >
        <div className="space-y-4">
          <GlassInput
            placeholder="Type a command..."
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
            autoFocus
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((command, index) => {
                const Icon = command.icon;
                return (
                  <GlassButton
                    key={command.id}
                    variant="secondary"
                    className={`w-full justify-start space-x-3 p-3 ${
                      index === selectedCommandIndex 
                        ? 'bg-white/20 border-white/40' 
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => executeCommand(command)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{command.label}</span>
                  </GlassButton>
                );
              })
            ) : (
              <div className="text-white/60 text-center py-8">
                No commands found for "{commandQuery}"
              </div>
            )}
          </div>
          <div className="text-white/40 text-xs text-center">
            Use ↑↓ to navigate • Enter to select • Esc to close
          </div>
        </div>
      </GlassModal>
    </AppLayout>
    </>
  );
}

export default App;
